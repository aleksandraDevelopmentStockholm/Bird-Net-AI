import { useThemedColors } from '@/components/theme';
import { COLORS, SHADOWS } from '@/constants/ui';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

export interface IconButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'active' | 'primary' | 'secondary';
  color?: string;
  disabled?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'imagebutton';
  testID?: string;
}

const ICON_BUTTON_SIZES = {
  sm: {
    containerSize: 36,
    iconSize: 20,
    borderRadius: 18,
  },
  md: {
    containerSize: 48,
    iconSize: 28,
    borderRadius: 24,
  },
  lg: {
    containerSize: 64,
    iconSize: 36,
    borderRadius: 32,
  },
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  color: colorProp,
  disabled = false,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
}) => {
  const colors = useThemedColors();
  const sizeConfig = ICON_BUTTON_SIZES[size];

  // Get colors based on variant and theme
  const getVariantColors = () => {
    switch (variant) {
      case 'active':
        return {
          background: COLORS.secondary,
          icon: COLORS.white,
        };
      case 'primary':
        return {
          background: COLORS.primary,
          icon: COLORS.white,
        };
      case 'secondary':
        return {
          background: COLORS.secondary,
          icon: COLORS.white,
        };
      case 'default':
      default:
        return {
          background: 'transparent',
          icon: colorProp || colors.text,
        };
    }
  };

  const variantColors = getVariantColors();

  // Get shadow based on variant
  const getShadow = (): ViewStyle => {
    if (variant === 'primary') {
      return Platform.OS === 'web'
        ? ({ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } as ViewStyle)
        : SHADOWS.floating;
    }

    if (variant === 'active' || variant === 'secondary') {
      return Platform.OS === 'web'
        ? ({ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } as ViewStyle)
        : SHADOWS.button;
    }

    return {};
  };

  const containerStyles: ViewStyle[] = [
    styles.container,
    {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      borderRadius: sizeConfig.borderRadius,
      backgroundColor: variantColors.background,
    },
    ...(variant !== 'default' ? [getShadow()] : []),
    ...(disabled ? [styles.disabled] : []),
  ];

  // If it's pressable (has onPress), wrap in Pressable
  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...containerStyles, ...(pressed ? [styles.pressed] : [])]}
        accessible={accessible}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        testID={testID}
      >
        <MaterialIcons name={icon} size={sizeConfig.iconSize} color={variantColors.icon} />
      </Pressable>
    );
  }

  // Otherwise, just a View
  return (
    <View
      style={containerStyles}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <MaterialIcons name={icon} size={sizeConfig.iconSize} color={variantColors.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
