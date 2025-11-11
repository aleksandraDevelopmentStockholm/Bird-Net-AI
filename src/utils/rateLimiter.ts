/**
 * Client-side rate limiter to prevent exceeding API Gateway limits
 *
 * Implements a token bucket algorithm for smooth request throttling
 */

import { logger } from '@/utils/logger';

interface RateLimiterConfig {
  maxRequests: number; // Maximum requests allowed in the time window
  timeWindowMs: number; // Time window in milliseconds
  minDelayMs?: number; // Minimum delay between requests (optional)
}

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class RateLimiter {
  private requestTimestamps: number[] = [];
  private requestQueue: QueuedRequest<any>[] = [];
  private isProcessing: boolean = false;
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      timeWindowMs: config.timeWindowMs,
      minDelayMs: config.minDelayMs || 0,
    };
  }

  /**
   * Execute a function with rate limiting
   *
   * @param fn Function to execute
   * @returns Promise that resolves when the function executes
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ execute: fn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the request queue respecting rate limits
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      // Clean up old timestamps outside the time window
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        (timestamp) => now - timestamp < this.config.timeWindowMs
      );

      // Check if we can make a request
      if (this.requestTimestamps.length >= this.config.maxRequests) {
        // Calculate wait time until the oldest request falls outside the window
        const oldestTimestamp = this.requestTimestamps[0];
        const waitTime = this.config.timeWindowMs - (now - oldestTimestamp);

        logger.log(
          `⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s before next request...`
        );
        await this.delay(waitTime);
        continue;
      }

      // Enforce minimum delay between requests if configured
      if (this.config.minDelayMs > 0 && this.requestTimestamps.length > 0) {
        const lastRequestTime = this.requestTimestamps[this.requestTimestamps.length - 1];
        const timeSinceLastRequest = now - lastRequestTime;

        if (timeSinceLastRequest < this.config.minDelayMs) {
          const delayNeeded = this.config.minDelayMs - timeSinceLastRequest;
          await this.delay(delayNeeded);
        }
      }

      // Process the next request
      const request = this.requestQueue.shift();
      if (!request) break;

      try {
        this.requestTimestamps.push(Date.now());
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Helper to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limiter statistics
   */
  getStats() {
    const now = Date.now();
    const recentRequests = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.config.timeWindowMs
    );

    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.config.maxRequests,
      queuedRequests: this.requestQueue.length,
      availableRequests: Math.max(0, this.config.maxRequests - recentRequests.length),
    };
  }

  /**
   * Clear the rate limiter state
   */
  reset(): void {
    this.requestTimestamps = [];
    this.requestQueue = [];
    this.isProcessing = false;
  }
}

/**
 * Pre-configured rate limiter for BirdNET API
 * Matches API Gateway limits: 5 req/sec with 10 burst, 1000/day quota
 */
export const birdnetApiLimiter = new RateLimiter({
  maxRequests: 4, // 4 requests per minute (stay under 5 req/sec limit)
  timeWindowMs: 60000, // 1 minute window
  minDelayMs: 1000, // Minimum 1 second between requests for better UX
});

/**
 * Daily quota tracker to prevent exceeding 1000 requests/day
 */
class DailyQuotaTracker {
  private storageKey = 'birdnet_daily_quota';
  private memoryCache: { date: string; count: number } | null = null;

  private getQuotaData(): { date: string; count: number } {
    // Use in-memory cache since AsyncStorage is async and these methods need to be sync
    // This is acceptable since quota tracking is best-effort and resets daily
    if (this.memoryCache) {
      return this.memoryCache;
    }

    return { date: this.getTodayString(), count: 0 };
  }

  private saveQuotaData(data: { date: string; count: number }): void {
    this.memoryCache = data;
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  incrementUsage(): void {
    const data = this.getQuotaData();
    const today = this.getTodayString();

    if (data.date === today) {
      data.count += 1;
    } else {
      // New day, reset counter
      data.date = today;
      data.count = 1;
    }

    this.saveQuotaData(data);
  }

  getUsage(): { used: number; limit: number; remaining: number } {
    const data = this.getQuotaData();
    const today = this.getTodayString();
    const used = data.date === today ? data.count : 0;
    const limit = 1000;

    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  }

  canMakeRequest(): boolean {
    const usage = this.getUsage();
    return usage.remaining > 0;
  }

  reset(): void {
    this.memoryCache = null;
  }
}

export const dailyQuotaTracker = new DailyQuotaTracker();
