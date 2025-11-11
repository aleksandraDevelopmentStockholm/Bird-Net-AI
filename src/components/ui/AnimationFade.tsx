import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const AnimationFade = ({
  children,
  fadeIn,
  absolute = false,
}: {
  children: React.ReactNode;
  fadeIn: boolean;
  absolute?: boolean;
}) => {
  // Always start at 0 to enable fade-in animations on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stop any running animation before starting a new one
    fadeAnim.stopAnimation(() => {
      if (fadeIn) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [fadeIn, fadeAnim]);

  // Don't render anything if there are no children
  if (!children) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        backgroundColor: 'transparent',
        ...(absolute && {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }),
      }}
      pointerEvents={fadeIn ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
};
