/**
 * Runtime test configuration for E2E tests
 * This allows Maestro and other test tools to control app behavior at runtime
 */

import { logger } from '@/utils/logger';

type MockScenario = 'success' | 'error' | 'no_results' | 'single_result' | 'proxy';

interface ITestConfig {
  mockMode: boolean;
  mockScenario: MockScenario;
}

// Global test configuration that can be set at runtime
let testConfig: ITestConfig = {
  mockMode: false,
  mockScenario: 'success',
};

// Check build-time env vars as fallback
if (process.env.EXPO_PUBLIC_MOCK_MODE === 'true') {
  testConfig.mockMode = true;
  testConfig.mockScenario = (process.env.EXPO_PUBLIC_MOCK_SCENARIO as MockScenario) || 'success';
}

export const TestConfig = {
  /**
   * Enable or disable mock mode
   */
  setMockMode(enabled: boolean) {
    testConfig.mockMode = enabled;
    logger.log(`🎭 Mock mode ${enabled ? 'enabled' : 'disabled'}`);
  },

  /**
   * Set the mock scenario to test different states
   */
  setMockScenario(scenario: MockScenario) {
    testConfig.mockScenario = scenario;
    logger.log(`🎭 Mock scenario set to: ${scenario}`);
  },

  /**
   * Get current mock mode status
   */
  isMockMode(): boolean {
    return testConfig.mockMode;
  },

  /**
   * Get current mock scenario
   */
  getMockScenario(): MockScenario {
    return testConfig.mockScenario;
  },

  /**
   * Configure test settings from URL parameters or launch args
   * Call this early in app initialization
   */
  configure(params: { mockMode?: string; mockScenario?: string }) {
    if (params.mockMode === 'true') {
      this.setMockMode(true);
    }
    if (params.mockScenario) {
      this.setMockScenario(params.mockScenario as MockScenario);
    }
  },

  /**
   * Parse and configure from a URL string
   * Example: aiapp://test?mockMode=true&mockScenario=error
   */
  async configureFromUrl(url: string) {
    try {
      const urlObj = new URL(url);
      const params = {
        mockMode: urlObj.searchParams.get('mockMode') || undefined,
        mockScenario: urlObj.searchParams.get('mockScenario') || undefined,
      };
      this.configure(params);

      // Handle clearRecordings command
      if (urlObj.searchParams.get('clearRecordings') === 'true') {
        logger.log('🗑️ Clearing all recordings via deep link...');
        const { clearAllRecordings } = await import('./recordingStorage');
        await clearAllRecordings();
      }
    } catch (error) {
      logger.warn('Failed to parse test config URL:', error);
    }
  },

  /**
   * Reset to default state
   */
  reset() {
    testConfig = {
      mockMode: false,
      mockScenario: 'success',
    };
  },
};

// Expose to window for Maestro to access (web & mobile via JS injection)
if (typeof window !== 'undefined') {
  (window as any).TestConfig = TestConfig;
}

// Expose globally for React Native
if (typeof global !== 'undefined') {
  (global as any).TestConfig = TestConfig;
}
