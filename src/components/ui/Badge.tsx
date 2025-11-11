import { COLORS, SHADOWS } from '@/constants/ui';
import { Image, ImageSource } from 'expo-image';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export interface BadgeProps {
  source: ImageSource;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  iconSize?: number;
  accessible?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  source,
  size = 80,
  backgroundColor,
  iconColor,
  iconSize,
  accessible = true,
  accessibilityLabel = 'Icon badge',
  style,
}) => {
  const calculatedIconSize = iconSize || size * 0.6;
  const borderRadius = size / 2;

  // Use theme-aware defaults if not provided
  const defaultBackgroundColor = backgroundColor || COLORS.primary;
  const defaultIconColor = iconColor || COLORS.white;

  const badgeStyle = [
    styles.badge,
    {
      width: size,
      height: size,
      borderRadius,
      backgroundColor: defaultBackgroundColor,
    },
    style,
  ];

  return (
    <View style={badgeStyle}>
      <Image
        source={source}
        style={{ width: calculatedIconSize, height: calculatedIconSize }}
        contentFit="contain"
        tintColor={defaultIconColor}
        accessible={accessible}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    // Use consistent shadow from UI constants
    ...SHADOWS.button,
  },
});
