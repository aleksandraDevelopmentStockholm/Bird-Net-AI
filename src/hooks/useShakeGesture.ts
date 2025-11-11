import { useEffect, useRef } from 'react';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

/**
 * Hook to detect shake gestures using device accelerometer
 *
 * @param onShake - Callback function to execute when shake is detected
 * @param threshold - Shake sensitivity (default: 15, lower = more sensitive)
 * @param timeout - Minimum time between shake detections in ms (default: 1000)
 */
export function useShakeGesture(
  onShake: () => void,
  threshold: number = 15,
  timeout: number = 1000
) {
  const lastShakeTime = useRef<number>(0);

  useEffect(() => {
    // Only enable on physical devices (not web)
    if (Platform.OS === 'web') {
      return;
    }

    let subscription: any;

    const setupShakeDetection = async () => {
      // Check if device motion is available
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) {
        logger.warn('Device motion not available on this device');
        return;
      }

      // Set update interval (in milliseconds)
      DeviceMotion.setUpdateInterval(100);

      // Subscribe to motion updates
      subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
        const { acceleration } = data;

        if (!acceleration) return;

        // Calculate total acceleration (magnitude of acceleration vector)
        const totalAcceleration = Math.sqrt(
          Math.pow(acceleration.x || 0, 2) +
            Math.pow(acceleration.y || 0, 2) +
            Math.pow(acceleration.z || 0, 2)
        );

        // Check if acceleration exceeds threshold
        if (totalAcceleration > threshold) {
          const now = Date.now();

          // Prevent multiple triggers in quick succession
          if (now - lastShakeTime.current > timeout) {
            lastShakeTime.current = now;
            onShake();
          }
        }
      });
    };

    setupShakeDetection();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [onShake, threshold, timeout]);
}
