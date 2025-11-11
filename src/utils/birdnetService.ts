import { AudioData, BirdNETConfig, BirdNETResult } from '@/utils/birdnetTypes';
import { TestConfig } from '@/utils/testConfig';
import { birdnetApiLimiter, dailyQuotaTracker } from '@/utils/rateLimiter';
import Constants from 'expo-constants';
import { logger } from '@/utils/logger';
import { AudioLoadProgress } from '@/utils/audioUtils';

export class BirdNETService {
  private config: BirdNETConfig;
  private apiEndpoint: string;

  constructor(config: Partial<BirdNETConfig> = {}) {
    this.config = {
      minConfidence: 0.1,
      maxResults: 10,
      locale: 'en_us',
      ...config,
    };

    // Check if mock mode is enabled (runtime check)
    if (TestConfig.isMockMode()) {
      logger.log('🎭 Mock mode enabled - using mock server');

      // Dynamically get the dev server host from Expo Constants
      // This works for both emulator and physical devices
      const devServerHost = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
      const mockApiUrl = `http://${devServerHost}:3001/analyze`;

      logger.log(`📍 Mock API URL: ${mockApiUrl}`);
      this.apiEndpoint = mockApiUrl;
    } else if (process.env.EXPO_PUBLIC_BIRDNET_API_URL) {
      this.apiEndpoint = process.env.EXPO_PUBLIC_BIRDNET_API_URL;
    } else {
      throw new Error(
        'BirdNet service is not configured. Please check your app settings or contact support.'
      );
    }
  }

  async analyzeAudio(
    audioData: AudioData,
    onProgress?: (progress: AudioLoadProgress) => void
  ): Promise<BirdNETResult[]> {
    try {
      // Check daily quota before making request
      if (!dailyQuotaTracker.canMakeRequest()) {
        const usage = dailyQuotaTracker.getUsage();
        throw new Error(
          `Daily API quota exceeded (${usage.used}/${usage.limit}). ` + `Please try again tomorrow.`
        );
      }

      logger.log('🔄 Analyzing audio via API:', audioData.uri);

      // Use rate limiter to ensure we don't exceed API Gateway limits
      const results = await birdnetApiLimiter.execute(() =>
        this.callBirdNetAPI(audioData, onProgress)
      );

      // Track daily usage
      dailyQuotaTracker.incrementUsage();

      logger.log(`✅ API analysis complete: ${results.length} detections`);

      // Log rate limiter stats for debugging
      const stats = birdnetApiLimiter.getStats();
      logger.log(
        `📊 Rate limiter: ${stats.requestsInWindow}/${stats.maxRequests} used, ${stats.queuedRequests} queued`
      );

      return results;
    } catch (error) {
      logger.warn('Failed to analyze audio:', error);
      throw error;
    }
  }

  private async callBirdNetAPI(
    audioData: AudioData,
    onProgress?: (progress: AudioLoadProgress) => void
  ): Promise<BirdNETResult[]> {
    try {
      // Import AudioUtils dynamically to avoid circular dependencies
      const { AudioUtils } = await import('./audioUtils');

      // Load audio (either decode to PCM on web, or get base64 file on native)
      const audioBuffer = await AudioUtils.loadAudioFromUri(audioData.uri);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      // Add API key if available
      const apiKey = process.env.EXPO_PUBLIC_BIRDNET_API_KEY;
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      } else {
        logger.warn('⚠️ No API Key found');
      }

      let requestBody: any;

      // Check if we have a base64 file (native platform)
      if (audioBuffer.fileBase64) {
        logger.log(
          `📤 Sending audio file (${Math.round(audioBuffer.fileBase64.length / 1024)}KB base64) to API...`
        );
        requestBody = {
          audioFile: audioBuffer.fileBase64,
          confidence_threshold: this.config.minConfidence,
          max_results: this.config.maxResults,
        };
      } else {
        // Web platform - send PCM array
        const resampledAudio = AudioUtils.resampleAudio(audioBuffer, 48000);

        // BirdNET expects 144,000 samples (3 seconds at 48kHz)
        const expectedSamples = 144000;
        const audioArray = Array.from(resampledAudio.data.slice(0, expectedSamples));

        // Pad with zeros if too short
        while (audioArray.length < expectedSamples) {
          audioArray.push(0);
        }

        logger.log(`📤 Sending ${audioArray.length} audio samples to API...`);
        requestBody = {
          audio: audioArray,
          confidence_threshold: this.config.minConfidence,
          max_results: this.config.maxResults,
        };
      }

      logger.log(`🌐 API Endpoint: ${this.apiEndpoint}`);
      logger.log(`📦 Request body size: ${JSON.stringify(requestBody).length} bytes`);

      // Add scenario query param for mock server if using TestConfig
      let apiUrl = this.apiEndpoint;
      if (TestConfig.isMockMode()) {
        const scenario = TestConfig.getMockScenario();
        apiUrl = `${this.apiEndpoint}?scenario=${scenario}`;
        logger.log(`🎭 Using mock scenario: ${scenario}`);
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      logger.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();

        // Handle rate limiting (429 Too Many Requests)
        if (response.status === 429) {
          logger.warn('⏳ Rate limit exceeded - request throttled');
          throw new Error('Too many requests. Please wait a moment and try again.');
        }

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          logger.warn('🔒 Authentication failed');
          throw new Error(
            'API authentication failed. Please check your connection or try again later.'
          );
        }

        // Handle server errors
        if (response.status >= 500) {
          logger.warn('🚨 Server error');
          throw new Error(
            'The bird identification service is temporarily unavailable. Please try again later.'
          );
        }

        logger.warn(`❌ API Error Response:`, errorText);
        throw new Error('Unable to analyze the recording. Please try again.');
      }

      const result = await response.json();
      logger.log('✅ API Response received:', result);
      if (!result.success) {
        throw new Error(result.error || 'API returned failure');
      }

      if (result.success && result.results.length === 0) {
        logger.log('ℹ️ No bird species detected in the audio.');
        return [];
      }

      logger.log(`📥 API processing took ${result.processing_time_ms}ms`);

      return result.results.map((item: any) => ({
        species: item.species,
        commonName: item.commonName,
        confidence: item.confidence,
        timestamp: item.timestamp || Date.now(),
      }));
    } catch (error) {
      logger.warn('🚨 API Call Failed:', error);
      if (error instanceof Error) {
        logger.warn('Error message:', error.message);
        logger.warn('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async analyzeAudioFile(uri: string): Promise<BirdNETResult[]> {
    const audioData: AudioData = {
      uri,
      duration: 0, // Will be determined during processing
      sampleRate: 48000,
    };

    return this.analyzeAudio(audioData);
  }

  updateConfig(newConfig: Partial<BirdNETConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): BirdNETConfig {
    return { ...this.config };
  }

  getSupportedSpecies(): string[] {
    return []; // Species list comes from API
  }

  async dispose(): Promise<void> {
    logger.log('🗑️ Disposing BirdNET API service...');
  }
}
