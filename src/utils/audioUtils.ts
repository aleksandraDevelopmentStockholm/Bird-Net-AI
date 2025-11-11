import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

export interface ProcessedAudioBuffer {
  data: Float32Array;
  sampleRate: number;
  duration: number;
  // For native platforms, we'll send the raw file instead
  fileUri?: string;
  fileBase64?: string;
}

export interface AudioLoadProgress {
  stage: 'reading' | 'decoding' | 'complete';
  progress: number;
}

/**
 * Format duration in milliseconds to MM:SS format
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format timestamp to human-readable relative date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export class AudioUtils {
  /**
   * Load audio from URI and convert to ProcessedAudioBuffer
   * @param uri - Audio file URI
   */
  static async loadAudioFromUri(uri: string): Promise<ProcessedAudioBuffer> {
    try {
      if (Platform.OS === 'web') {
        return await this.loadAudioWeb(uri);
      } else {
        return await this.loadAudioNative(uri);
      }
    } catch (error) {
      logger.warn('Failed to load audio:', error);
      throw new Error('Failed to load audio file');
    }
  }

  /**
   * Parse WAV file and extract PCM audio data
   * @param uri - File URI to the WAV file
   * @returns Parsed audio buffer with Float32 PCM data
   */
  private static async parseWavFile(uri: string): Promise<ProcessedAudioBuffer> {
    // Read the WAV file using modern File API
    const { File } = await import('expo-file-system');
    const file = new File(uri);
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    logger.log(`✅ Read ${bytes.length} bytes from WAV file`);

    // Parse WAV header using DataView
    const view = new DataView(bytes.buffer);

    // Verify RIFF header (first 4 bytes should be "RIFF")
    const riff = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3)
    );

    // Debug: log first 50 bytes to see what we got
    logger.log(
      `🔍 First 4 bytes (should be RIFF): "${riff}" (hex: ${Array.from(bytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ')})`
    );
    logger.log(
      `🔍 Next 16 bytes: ${Array.from(bytes.slice(4, 20))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ')}`
    );

    if (riff !== 'RIFF') {
      logger.error(`❌ Expected RIFF header, got: "${riff}"`);
      logger.error(`❌ File size: ${bytes.length} bytes`);
      throw new Error(`Invalid WAV file: missing RIFF header. Got "${riff}" instead.`);
    }

    // Find 'fmt ' and 'data' chunks
    let offset = 12; // Skip RIFF header (4 bytes ID + 4 bytes size + 4 bytes format)
    let sampleRate = 44100;
    let numChannels = 1;
    let bitsPerSample = 16;
    let dataOffset = 0;
    let dataSize = 0;

    while (offset < bytes.length - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      const chunkSize = view.getUint32(offset + 4, true); // Little-endian

      if (chunkId === 'fmt ') {
        // Parse format chunk
        sampleRate = view.getUint32(offset + 12, true);
        numChannels = view.getUint16(offset + 10, true);
        bitsPerSample = view.getUint16(offset + 22, true);
      } else if (chunkId === 'data') {
        // Found data chunk
        dataOffset = offset + 8;
        dataSize = chunkSize;
        break;
      }

      offset += 8 + chunkSize;
    }

    logger.log(`📊 WAV Format: ${sampleRate}Hz, ${numChannels} channel(s), ${bitsPerSample}-bit`);

    if (dataOffset === 0) {
      throw new Error('Invalid WAV file: no data chunk found');
    }

    // Extract PCM samples and convert to Float32Array
    const numSamples = dataSize / (bitsPerSample / 8);
    const float32Data = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const sampleOffset = dataOffset + i * 2;
      const sample = view.getInt16(sampleOffset, true); // 16-bit little-endian
      float32Data[i] = sample / 32768.0; // Normalize to -1.0 to 1.0
    }

    logger.log(`✅ Extracted ${float32Data.length} PCM samples`);

    return {
      data: float32Data,
      sampleRate,
      duration: float32Data.length / sampleRate,
    };
  }

  /**
   * Load audio on web platform using Web Audio API
   */
  private static async loadAudioWeb(
    uri: string,
    onProgress?: (progress: AudioLoadProgress) => void
  ): Promise<ProcessedAudioBuffer> {
    onProgress?.({ stage: 'reading', progress: 20 });

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const response = await fetch(uri);
    onProgress?.({ stage: 'reading', progress: 50 });

    const arrayBuffer = await response.arrayBuffer();
    onProgress?.({ stage: 'decoding', progress: 70 });

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    onProgress?.({ stage: 'decoding', progress: 90 });

    const channelData = audioBuffer.getChannelData(0);
    const data = new Float32Array(channelData);

    await audioContext.close();

    onProgress?.({ stage: 'complete', progress: 100 });

    return {
      data,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
    };
  }

  /**
   * Load audio file on native platform - sends raw file to API for server-side decoding
   */
  private static async loadAudioNative(
    uri: string,
    onProgress?: (progress: AudioLoadProgress) => void
  ): Promise<ProcessedAudioBuffer> {
    try {
      logger.log('📱 Native platform - preparing to send raw audio file to API');
      logger.log('📁 Audio URI:', uri);

      onProgress?.({ stage: 'reading', progress: 30 });

      // Read the audio file as base64
      const { File } = await import('expo-file-system');
      const file = new File(uri);

      logger.log('📖 Reading audio file as base64...');
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Convert to base64
      let base64 = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        base64 += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const fileBase64 = btoa(base64);

      logger.log(
        `✅ Read audio file: ${bytes.length} bytes (${Math.round(bytes.length / 1024)}KB)`
      );
      onProgress?.({ stage: 'complete', progress: 100 });

      // Return minimal data - the important part is fileBase64
      return {
        data: new Float32Array(0), // Empty - we're sending the file instead
        sampleRate: 48000, // Assume 48kHz (server will verify)
        duration: 0, // Server will calculate
        fileUri: uri,
        fileBase64,
      };
    } catch (error) {
      logger.error('Failed to read audio file:', error);
      throw new Error('Failed to load audio file on native platform');
    }
  }

  /**
   * Resample audio to target sample rate
   */
  static resampleAudio(
    audioBuffer: ProcessedAudioBuffer,
    targetSampleRate: number
  ): ProcessedAudioBuffer {
    if (audioBuffer.sampleRate === targetSampleRate) {
      return audioBuffer;
    }

    const ratio = audioBuffer.sampleRate / targetSampleRate;
    const newLength = Math.round(audioBuffer.data.length / ratio);
    const resampledData = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const indexFloor = Math.floor(originalIndex);
      const indexCeil = Math.min(indexFloor + 1, audioBuffer.data.length - 1);
      const fraction = originalIndex - indexFloor;

      // Linear interpolation
      resampledData[i] =
        audioBuffer.data[indexFloor] * (1 - fraction) + audioBuffer.data[indexCeil] * fraction;
    }

    return {
      data: resampledData,
      sampleRate: targetSampleRate,
      duration: newLength / targetSampleRate,
    };
  }

  /**
   * Get audio file duration without loading full data
   */
  static async getAudioDuration(uri: string): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        const audio = new Audio(uri);
        return new Promise((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
          });
          audio.addEventListener('error', reject);
          audio.load();
        });
      } else {
        // For native, return mock duration
        return 3.0;
      }
    } catch (error) {
      logger.warn('Failed to get audio duration:', error);
      return 0;
    }
  }
}

/**
 * Get audio file duration without loading full data
 * Exported as standalone function for convenience
 */
export async function getAudioDuration(uri: string): Promise<number> {
  return AudioUtils.getAudioDuration(uri);
}
