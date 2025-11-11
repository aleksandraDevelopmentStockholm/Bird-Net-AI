import { useThemedColors } from '@/components/theme';
import {
  BORDER_RADIUS,
  BORDER_WIDTHS,
  BUTTON_SIZES,
  COLORS,
  OPACITY,
  SHADOWS,
  SPACING,
} from '@/constants/ui';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'roundIcon' | 'textIcon';
  colorVariant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  floating?: boolean; // Position absolute at bottom for round buttons
  floatingBottom?: number; // Custom bottom position when floating
  floatingRight?: number; // Custom right position when floating
  disabled?: boolean;
  loading?: boolean;
  text?: string;
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
  testID?: string;
  accessible: boolean;
  accessibilityRole: 'button' | 'checkbox' | 'link' | 'menuitem' | 'none' | 'imagebutton' | 'tab';
  accessibilityLabel: string;
  accessibilityHint?: string;
  hitSlop?: { top: number; bottom: number; left: number; right: number };
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  colorVariant,
  size = 'md',
  fullWidth,
  floating = false,
  floatingBottom = SPACING.xl,
  floatingRight = SPACING.xl,
  disabled = false,
  loading = false,
  text,
  icon,
  iconColor,
  backgroundColor,
  onPress,
  testID,
  accessible,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  hitSlop,
  accessibilityState,
}) => {
  const colors = useThemedColors();
  type IconName = keyof typeof MaterialIcons.glyphMap;

  const getColors = () => {
    const activeColorVariant =
      colorVariant || (variant === 'roundIcon' || variant === 'textIcon' ? 'primary' : variant);

    const colorSchemes = {
      primary: { bg: COLORS.primary, text: COLORS.white, border: COLORS.primary },
      secondary: colors.isDark
        ? { bg: COLORS.dark.secondary, text: COLORS.white, border: COLORS.white }
        : { bg: COLORS.secondary, text: COLORS.white, border: COLORS.transparent },
      outline: { bg: COLORS.transparent, text: COLORS.primary, border: COLORS.primary },
      ghost: {
        bg: COLORS.transparent,
        text: colors.isDark ? COLORS.white : COLORS.gray[700],
        border: COLORS.transparent,
      },
      danger: { bg: COLORS.danger, text: COLORS.white, border: COLORS.danger },
    };

    const scheme = colorSchemes[activeColorVariant] || colorSchemes.primary;
    return { ...scheme, bg: backgroundColor || scheme.bg };
  };

  const buttonColors = getColors();
  const sizeConfig = BUTTON_SIZES[size];
  const isRoundIcon = variant === 'roundIcon';

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: buttonColors.bg,
      borderColor: buttonColors.border,
      borderRadius: sizeConfig.borderRadius,
      minHeight: sizeConfig.minHeight,
      minWidth: sizeConfig.minWidth,
      borderWidth:
        variant === 'outline' ? parseInt(BORDER_WIDTHS.thick) : parseInt(BORDER_WIDTHS.none),
      opacity: disabled ? OPACITY.disabled : OPACITY.full,
      ...(isRoundIcon && {
        maxHeight: sizeConfig.maxHeightRound,
        maxWidth: sizeConfig.maxWidthRound,
      }),
      ...(floating && {
        position: 'absolute' as const,
        bottom: floatingBottom,
        right: floatingRight,
        zIndex: 100,
      }),
    },
    isRoundIcon && styles.roundIcon,
    fullWidth && styles.fullWidth,
  ];

  const textStyleProps = {
    weight: 'semibold' as const,
    style: {
      color: buttonColors.text,
      fontSize: parseInt(sizeConfig.fontSize),
      lineHeight: parseInt(sizeConfig.fontSize) * 1.2,
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
      // @ts-ignore - web-specific property for flex alignment
      display: 'flex' as const,
      alignItems: 'center' as const,
      textAlign: 'center' as const,
    },
  };

  const accessibilityProps = {
    accessible,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    hitSlop,
    testID,
  };

  if (variant === 'roundIcon') {
    return (
      <TouchableOpacity
        style={buttonStyle}
        disabled={disabled || loading}
        onPress={onPress}
        activeOpacity={OPACITY.active}
        {...accessibilityProps}
      >
        {loading ? (
          <ActivityIndicator size="small" color={buttonColors.text} />
        ) : (
          <MaterialIcons
            name={icon as IconName}
            size={sizeConfig.iconSize}
            color={iconColor || buttonColors.text}
          />
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'textIcon') {
    return (
      <TouchableOpacity
        style={buttonStyle}
        disabled={disabled || loading}
        onPress={onPress}
        activeOpacity={OPACITY.active}
        {...accessibilityProps}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color={buttonColors.text} style={styles.loader} />
          ) : (
            <MaterialIcons
              name={icon as any}
              size={sizeConfig.iconSize}
              color={iconColor || buttonColors.text}
            />
          )}
          <Text {...textStyleProps}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={OPACITY.active}
      {...accessibilityProps}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator size="small" color={buttonColors.text} style={styles.loader} />
        )}
        <Text {...textStyleProps}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    // Apply consistent shadow to all buttons
    ...SHADOWS.button,
    // @ts-ignore - web-specific property
    display: 'flex',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  loader: {
    marginRight: SPACING.sm,
  },
  roundIcon: {
    // Use floating shadow for round icon buttons
    ...SHADOWS.floating,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
});
