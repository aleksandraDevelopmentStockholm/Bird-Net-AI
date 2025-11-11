// AWS SDK v3 for Node.js 22.x
const { S3Client } = require('@aws-sdk/client-s3');
const { Buffer } = require('buffer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// TensorFlow will be loaded when needed
let tf = null;

// Global variables for model caching
let labels = [];
let audioModel = null;
const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-north-1' });

/**
 * Decode base64 audio file to PCM samples at 48kHz using FFmpeg
 * @param {string} base64Audio - Base64 encoded audio file
 * @returns {Promise<Float32Array>} PCM samples normalized to -1.0 to 1.0
 */
async function decodeAudioFile(base64Audio) {
  return new Promise((resolve, reject) => {
    try {
      // Convert base64 to Buffer
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      console.log(`Decoding audio file with FFmpeg: ${audioBuffer.length} bytes`);

      // Create temp file paths in /tmp
      const tempInputPath = path.join('/tmp', `input_${Date.now()}.audio`);
      const tempOutputPath = path.join('/tmp', `output_${Date.now()}.raw`);

      // Write audio buffer to temp file
      fs.writeFileSync(tempInputPath, audioBuffer);

      // Use FFmpeg to decode audio to raw PCM f32le (Float32) at 48kHz mono
      const ffmpeg = spawn('ffmpeg', [
        '-i',
        tempInputPath,
        '-f',
        'f32le', // Output format: 32-bit float PCM little-endian
        '-acodec',
        'pcm_f32le', // Audio codec: PCM Float32
        '-ar',
        '48000', // Sample rate: 48kHz
        '-ac',
        '1', // Channels: mono
        tempOutputPath,
      ]);

      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        try {
          // Clean up input file
          fs.unlinkSync(tempInputPath);

          if (code !== 0) {
            console.error('FFmpeg error:', stderr);
            throw new Error(`FFmpeg exited with code ${code}: ${stderr}`);
          }

          // Read the raw PCM data
          const pcmBuffer = fs.readFileSync(tempOutputPath);
          fs.unlinkSync(tempOutputPath);

          // Convert Buffer to Float32Array
          const float32Array = new Float32Array(
            pcmBuffer.buffer,
            pcmBuffer.byteOffset,
            pcmBuffer.length / Float32Array.BYTES_PER_ELEMENT
          );

          console.log(`✅ Decoded audio: 48000Hz, 1 channel, ${float32Array.length} samples`);
          resolve(float32Array);
        } catch (error) {
          console.error('Failed to process FFmpeg output:', error);
          reject(new Error(`Audio decoding failed: ${error.message}`));
        }
      });

      ffmpeg.on('error', (error) => {
        // Clean up temp files
        try {
          fs.unlinkSync(tempInputPath);
        } catch (e) {}
        try {
          fs.unlinkSync(tempOutputPath);
        } catch (e) {}

        console.error('FFmpeg spawn error:', error);
        reject(new Error(`Failed to start FFmpeg: ${error.message}`));
      });
    } catch (error) {
      console.error('Failed to decode audio file:', error);
      reject(new Error(`Audio decoding failed: ${error.message}`));
    }
  });
}

/**
 * Resample audio to target sample rate using linear interpolation
 * @param {Float32Array} samples - Input audio samples
 * @param {number} fromRate - Source sample rate
 * @param {number} toRate - Target sample rate
 * @returns {Float32Array} Resampled audio
 */
function resampleAudio(samples, fromRate, toRate) {
  if (fromRate === toRate) return samples;

  const ratio = fromRate / toRate;
  const newLength = Math.round(samples.length / ratio);
  const resampled = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const indexFloor = Math.floor(originalIndex);
    const indexCeil = Math.min(indexFloor + 1, samples.length - 1);
    const fraction = originalIndex - indexFloor;

    // Linear interpolation
    resampled[i] = samples[indexFloor] * (1 - fraction) + samples[indexCeil] * fraction;
  }

  return resampled;
}

// Define custom layer for computing mel spectrograms (from BirdNET v2.4)
// Must extend tf.layers.Layer for proper TensorFlow.js integration
function createMelSpecLayer() {
  if (!tf) tf = require('@tensorflow/tfjs-node');

  class MelSpecLayerSimple extends tf.layers.Layer {
    constructor(config) {
      super(config);
      this.sampleRate = config.sampleRate;
      this.specShape = config.specShape;
      this.frameStep = config.frameStep;
      this.frameLength = config.frameLength;
      this.fmin = config.fmin;
      this.fmax = config.fmax;

      // Store melFilterbank configuration for later initialization
      this.melFilterbankConfig = config.melFilterbank;
      this.melFilterbank = null;
    }

    build(inputShape) {
      // Initialize mel filterbank tensor
      if (!this.melFilterbank && this.melFilterbankConfig) {
        this.melFilterbank = tf.tensor2d(this.melFilterbankConfig);
      }

      // Initialize trainable weights
      this.magScale = this.addWeight(
        'magnitude_scaling',
        [],
        'float32',
        tf.initializers.constant({ value: 1.23 })
      );

      super.build(inputShape);
    }

    computeOutputShape(inputShape) {
      return [inputShape[0], this.specShape[0], this.specShape[1], 1];
    }

    call(inputs) {
      return tf.tidy(() => {
        let input = Array.isArray(inputs) ? inputs[0] : inputs;

        // Split along batch dimension
        const inputList = tf.split(input, input.shape[0]);

        const specBatch = inputList.map((inputTensor) => {
          inputTensor = inputTensor.squeeze();

          // Normalize values between -1 and 1
          inputTensor = tf.sub(inputTensor, tf.min(inputTensor, -1, true));
          inputTensor = tf.div(inputTensor, tf.add(tf.max(inputTensor, -1, true), 0.000001));
          inputTensor = tf.sub(inputTensor, 0.5);
          inputTensor = tf.mul(inputTensor, 2.0);

          // Perform STFT
          let spec = tf.signal.stft(
            inputTensor,
            this.frameLength,
            this.frameStep,
            this.frameLength,
            tf.signal.hannWindow
          );

          // Cast from complex to float
          spec = tf.cast(spec, 'float32');

          // Apply mel filter bank
          spec = tf.matMul(spec, this.melFilterbank);

          // Convert to power spectrogram
          spec = spec.pow(2.0);

          // Apply nonlinearity
          spec = spec.pow(tf.div(1.0, tf.add(1.0, tf.exp(this.magScale.read()))));

          // Flip the spectrogram
          spec = tf.reverse(spec, -1);

          // Swap axes to fit input shape
          spec = tf.transpose(spec);

          // Adding the channel dimension
          spec = spec.expandDims(-1);

          return spec;
        });

        return tf.stack(specBatch);
      });
    }

    getClassName() {
      return 'MelSpecLayerSimple';
    }

    static get className() {
      return 'MelSpecLayerSimple';
    }
  }

  return MelSpecLayerSimple;
}

// Register the custom layer with TensorFlow.js
function registerCustomLayer() {
  if (!tf) tf = require('@tensorflow/tfjs-node');
  const MelSpecLayerSimple = createMelSpecLayer();
  tf.serialization.registerClass(MelSpecLayerSimple);
  return MelSpecLayerSimple;
}

/**
 * Load species labels from S3
 */
async function loadLabels() {
  if (labels.length > 0) {
    return; // Already loaded
  }

  console.log('Loading species labels from EFS...');

  try {
    // Load labels from EFS
    const fs = require('fs');
    const labelsPath = '/mnt/efs/models/model-data/model/labels.json';

    const labelsText = fs.readFileSync(labelsPath, 'utf-8');
    if (!labelsText) {
      throw new Error('Failed to read labels file');
    }

    // Parse labels - JSON format: array of species names
    const labelsData = JSON.parse(labelsText);
    labels = Array.isArray(labelsData) ? labelsData : Object.values(labelsData);

    console.log(`✅ Real labels loaded from EFS: ${labels.length} species`);
  } catch (error) {
    console.warn('❌ Failed to load labels from EFS:', error.message);
    throw new Error(`Cannot load species labels from EFS: ${error.message}`);
  }
}

/**
 * Load BirdNET model from EFS
 */
async function loadModel() {
  if (audioModel) {
    return; // Already loaded
  }

  console.log('Loading BirdNET model from EFS...');

  try {
    if (!tf) tf = require('@tensorflow/tfjs-node');

    // Register custom layer before loading model
    const MelSpecLayerSimple = registerCustomLayer();

    // Load full model with custom MelSpecLayerSimple layer
    const modelPath = 'file:///mnt/efs/models/model-data/model/model.json';

    audioModel = await tf.loadLayersModel(modelPath, {
      customObjects: { MelSpecLayerSimple: MelSpecLayerSimple },
    });

    console.log('✅ BirdNET model loaded successfully from EFS');
    console.log(`Model input shape: ${JSON.stringify(audioModel.inputs[0].shape)}`);
    console.log(`Model output shape: ${JSON.stringify(audioModel.outputs[0].shape)}`);
  } catch (error) {
    console.warn('❌ Failed to load model from EFS:', error);
    throw new Error(`Cannot load BirdNET model: ${error.message}`);
  }
}

/**
 * Real inference function using TensorFlow model with raw audio
 */
async function runInference(audioData) {
  console.log(`Processing audio with ${audioData.length} samples`);

  // Ensure model is loaded
  await loadModel();

  try {
    if (!tf) tf = require('@tensorflow/tfjs-node');

    // BirdNET expects input shape: [1, 144000] (3 seconds at 48kHz)
    const expectedSamples = 144000;

    // Pad or truncate audio to expected length
    let processedAudio = audioData;
    if (audioData.length < expectedSamples) {
      console.log(`Padding audio from ${audioData.length} to ${expectedSamples} samples`);
      const padding = new Array(expectedSamples - audioData.length).fill(0);
      processedAudio = audioData.concat(padding);
    } else if (audioData.length > expectedSamples) {
      console.log(`Truncating audio from ${audioData.length} to ${expectedSamples} samples`);
      processedAudio = audioData.slice(0, expectedSamples);
    }

    // Create tensor with shape [1, 144000]
    const inputTensor = tf.tensor2d([processedAudio], [1, expectedSamples]);

    console.log(`Input tensor shape: ${inputTensor.shape}`);

    // Run inference
    const prediction = audioModel.predict(inputTensor);
    const scores = await prediction.data();

    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    console.log(`Generated ${scores.length} predictions`);
    return Array.from(scores);
  } catch (error) {
    console.warn('Inference error:', error);
    throw new Error(`Inference failed: ${error.message}`);
  }
}

/**
 * Post-process predictions to get bird species results
 */
function postProcessPredictions(scores, confidenceThreshold = 0.1, maxResults = 10) {
  const results = [];

  for (let i = 0; i < Math.min(scores.length, labels.length); i++) {
    if (scores[i] >= confidenceThreshold) {
      results.push({
        species: getScientificName(labels[i]),
        commonName: labels[i],
        confidence: scores[i],
        timestamp: Date.now(),
      });
    }
  }

  // Sort by confidence and limit results
  return results.sort((a, b) => b.confidence - a.confidence).slice(0, maxResults);
}

/**
 * Get scientific name mapping
 */
function getScientificName(commonName) {
  const scientificNames = {
    'American Robin': 'Turdus migratorius',
    'Northern Cardinal': 'Cardinalis cardinalis',
    'Blue Jay': 'Cyanocitta cristata',
    'House Sparrow': 'Passer domesticus',
    'House Finch': 'Haemorhous mexicanus',
    'American Goldfinch': 'Spinus tristis',
    'European Starling': 'Sturnus vulgaris',
    'Mourning Dove': 'Zenaida macroura',
    'Red-winged Blackbird': 'Agelaius phoeniceus',
    'Common Grackle': 'Quiscalus quiscula',
  };

  return scientificNames[commonName] || `Unknown ${commonName.toLowerCase().replace(' ', '_')}`;
}

/**
 * Health check endpoint
 */
async function healthCheck(requestId) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'X-Request-Id': requestId,
    },
    body: JSON.stringify({
      status: 'healthy',
      speciesCount: labels.length,
      timestamp: Date.now(),
      environment: process.env.ENVIRONMENT || 'dev',
      requestId,
    }),
  };
}

/**
 * Main Lambda handler for API Gateway
 */
exports.handler = async (event, context) => {
  const startTime = Date.now();
  const requestId = context.awsRequestId;

  try {
    // API Gateway event structure
    const httpMethod = event.httpMethod;
    const path = event.path || event.resource;
    const sourceIp = event.requestContext?.identity?.sourceIp;

    console.log(`[${requestId}] ${httpMethod} ${path} from ${sourceIp}`);

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
          'X-Request-Id': requestId,
        },
        body: '',
      };
    }

    // Health check (no API key required)
    if (httpMethod === 'GET' && path.includes('/health')) {
      // Skip loading labels/models for health check to avoid timeout
      return await healthCheck(requestId);
    }

    // Bird identification endpoint
    if (httpMethod === 'POST' && path.includes('/identify-bird')) {
      // API Key validation (API Gateway handles this, but double-check)
      const apiKey = event.headers?.['X-API-Key'] || event.headers?.['x-api-key'];
      if (process.env.ENVIRONMENT === 'prod' && !apiKey) {
        console.warn(`[${requestId}] Missing API key from ${sourceIp}`);
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
            'X-Request-Id': requestId,
          },
          body: JSON.stringify({
            success: false,
            error: 'API key required',
            requestId,
          }),
        };
      }

      // Validate request size (prevent DoS)
      const bodySize = Buffer.byteLength(event.body || '', 'utf8');
      if (bodySize > 10 * 1024 * 1024) {
        // 10MB limit
        console.warn(`[${requestId}] Request too large: ${bodySize} bytes from ${sourceIp}`);
        return {
          statusCode: 413,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
            'X-Request-Id': requestId,
          },
          body: JSON.stringify({
            success: false,
            error: 'Request too large',
            requestId,
          }),
        };
      }

      // Load labels on first request
      await loadLabels();

      // Parse and validate JSON body
      let requestBody;
      try {
        requestBody = JSON.parse(event.body || '{}');
      } catch (parseError) {
        console.warn(`[${requestId}] JSON parse error from ${sourceIp}:`, parseError.message);
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
            'X-Request-Id': requestId,
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid JSON format',
            requestId,
          }),
        };
      }

      // Get and validate configuration
      const confidenceThreshold = Math.max(
        0,
        Math.min(1, parseFloat(requestBody.confidence_threshold || '0.1'))
      );
      const maxResults = Math.max(1, Math.min(50, parseInt(requestBody.max_results || '10')));

      let audioSamples;

      // Check if we received a base64 audio file (from native platforms)
      if (requestBody.audioFile && typeof requestBody.audioFile === 'string') {
        console.log('Received base64 audio file from native platform');

        // Validate file size (prevent DoS) - max 10MB base64
        if (requestBody.audioFile.length > 10 * 1024 * 1024 * 1.33) {
          // base64 is ~33% larger
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
            },
            body: JSON.stringify({
              success: false,
              error: 'Audio file too large (max 10MB)',
            }),
          };
        }

        // Decode the audio file to PCM samples
        audioSamples = await decodeAudioFile(requestBody.audioFile);
        console.log(`Decoded to ${audioSamples.length} samples at 48kHz`);
      } else if (requestBody.audio && Array.isArray(requestBody.audio)) {
        // Received PCM array (from web platform)
        console.log('Received PCM audio array from web platform');

        // Validate audio size (prevent DoS) - 3 seconds at 48kHz = 144,000 samples max
        if (requestBody.audio.length > 200000) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
            },
            body: JSON.stringify({
              success: false,
              error: 'Audio data too large (max 200,000 samples)',
            }),
          };
        }

        // Validate numeric values
        if (!requestBody.audio.every((val) => typeof val === 'number' && !isNaN(val))) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
            },
            body: JSON.stringify({
              success: false,
              error: 'Audio must contain only numeric values',
            }),
          };
        }

        audioSamples = requestBody.audio;
      } else {
        // No valid audio data provided
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
          },
          body: JSON.stringify({
            success: false,
            error:
              'No audio data provided - send either "audio" array or "audioFile" base64 string',
          }),
        };
      }

      // Ensure we have exactly 144,000 samples (3 seconds at 48kHz) for BirdNET
      const expectedSamples = 144000;
      if (audioSamples.length < expectedSamples) {
        // Pad with zeros
        const padded = new Float32Array(expectedSamples);
        padded.set(audioSamples);
        audioSamples = Array.from(padded);
      } else if (audioSamples.length > expectedSamples) {
        // Trim to first 3 seconds
        audioSamples = Array.from(audioSamples.slice(0, expectedSamples));
      } else {
        audioSamples = Array.from(audioSamples);
      }

      console.log(`Processing ${audioSamples.length} audio samples`);

      // Run inference on audio data
      const scores = await runInference(audioSamples);

      // Post-process results
      const results = postProcessPredictions(scores, confidenceThreshold, maxResults);

      const processingTime = Date.now() - startTime;

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        },
        body: JSON.stringify({
          success: true,
          results: results,
          processing_time_ms: processingTime,
        }),
      };
    }

    // Invalid endpoint
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      },
      body: JSON.stringify({
        success: false,
        error: 'Endpoint not found',
      }),
    };
  } catch (error) {
    console.warn('Lambda error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        processing_time_ms: Date.now() - startTime,
      }),
    };
  }
};
