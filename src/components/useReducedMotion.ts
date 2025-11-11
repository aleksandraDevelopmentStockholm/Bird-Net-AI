import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to check if the user has enabled reduced motion in their system settings.
 * Returns true if reduced motion is enabled, false otherwise.
 *
 * Use this to disable or reduce animations for accessibility:
 * const reduceMotion = useReducedMotion();
 * const duration = reduceMotion ? 0 : 200;
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled ?? false);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
