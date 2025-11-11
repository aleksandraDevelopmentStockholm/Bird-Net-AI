/**
 * Custom logger that only logs in development mode
 * Prevents sensitive information from being logged in production builds
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

class Logger {
  /**
   * Log general information (dev only)
   */
  log(...args: any[]): void {
    if (__DEV__) {
      console.log(...args);
    }
  }

  /**
   * Log informational messages (dev only)
   */
  info(...args: any[]): void {
    if (__DEV__) {
      console.info(...args);
    }
  }

  /**
   * Log warnings (always logged, but less verbose in production)
   */
  warn(...args: any[]): void {
    if (__DEV__) {
      console.warn(...args);
    } else {
      // In production, only log the first argument (usually the message)
      console.warn(args[0]);
    }
  }

  /**
   * Log errors (always logged for crash reporting)
   */
  error(...args: any[]): void {
    console.error(...args);
  }

  /**
   * Log with custom level
   */
  private logWithLevel(level: LogLevel, ...args: any[]): void {
    if (__DEV__) {
      console[level](...args);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
