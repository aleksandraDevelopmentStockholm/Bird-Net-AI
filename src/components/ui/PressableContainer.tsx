import { useThemedColors } from '@/components/theme';
import { COLORS, SPACING } from '@/constants/ui';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

export interface PressableContainerProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /** Visual variant of the container */
  variant?: 'default' | 'bordered' | 'selected';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius */
  borderRadius?: number;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Whether the container is disabled */
  disabled?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

export const PressableContainer: React.FC<PressableContainerProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  borderRadius = 8,
  backgroundColor: backgroundColorProp,
  borderColor: borderColorProp,
  disabled = false,
  style,
  onPress,
  testID,
  ...pressableProps
}) => {
  const colors = useThemedColors();

  const paddingValues = {
    none: 0,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
  };

  // Get colors based on variant and theme
  const getVariantColors = () => {
    switch (variant) {
      case 'bordered':
        return {
          background: backgroundColorProp || 'transparent',
          border: borderColorProp || colors.border,
          borderWidth: 2,
        };
      case 'selected':
        return {
          background:
            backgroundColorProp || (colors.isDark ? COLORS.primary + '20' : COLORS.primary + '10'),
          border: borderColorProp || COLORS.primary,
          borderWidth: 2,
        };
      case 'default':
      default:
        return {
          background: backgroundColorProp || 'transparent',
          border: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const variantColors = getVariantColors();

  const containerStyles: ViewStyle[] = [
    styles.container,
    {
      padding: paddingValues[padding],
      borderRadius,
      backgroundColor: variantColors.background,
      borderColor: variantColors.border,
      borderWidth: variantColors.borderWidth,
    },
    ...(disabled ? [styles.disabled] : []),
    ...(style ? [style] : []),
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...containerStyles,
        ...(pressed && !disabled ? [styles.pressed] : []),
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      testID={testID}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...pressableProps}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
