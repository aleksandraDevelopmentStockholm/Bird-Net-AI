/**
 * Error Suppression Configuration
 *
 * Suppresses known React Native warnings and errors that don't affect functionality.
 * Primarily addresses iOS simulator issues with deprecated modules.
 */

import { LogBox } from 'react-native';

// Suppress React Native deprecation warnings that cause red screens in simulators
// These are known issues with RN 0.81.5 and don't affect app functionality
LogBox.ignoreLogs([
  'new NativeEventEmitter', // PushNotificationIOS not available in simulator
  'PushNotificationIOS', // Deprecated module
  'Invariant Violation', // Related to NativeEventEmitter
  'Sending `onAnimatedValueUpdate` with no listeners registered', // Reanimated internal
  'Failed to copy recording file', // Simulator-specific file system timing issue
  'UnexpectedException', // expo-file-system errors in simulator
]);

// Prevent uncaught errors from crashing the app during development
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorString = args[0]?.toString() || '';

    // Suppress specific errors that crash simulators but don't affect functionality
    if (
      (errorString.includes('Invariant Violation') && errorString.includes('NativeEventEmitter')) ||
      errorString.includes('Failed to copy recording file') ||
      errorString.includes('UnexpectedException')
    ) {
      return; // Silently ignore
    }
    originalConsoleError(...args);
  };
}
