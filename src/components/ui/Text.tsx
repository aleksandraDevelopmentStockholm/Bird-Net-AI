import { COLORS, TYPOGRAPHY } from '@/constants/ui';
import { useThemedColors } from '@/components/theme';
import React from 'react';
import { StyleProp, Text as RNText, TextStyle } from 'react-native';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'small';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white';
  textAlign?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  accessible?: boolean;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  textAlign = 'left',
  numberOfLines,
  accessible,
  accessibilityLiveRegion,
  accessibilityLabel,
  style,
  testID,
}) => {
  const typography = TYPOGRAPHY[variant];
  const colors = useThemedColors();

  const getFontWeight = (): '500' | '600' | '700' => {
    if (weight === 'semibold') return '600';
    if (weight === 'bold') return '700';
    return '500';
  };

  const getColor = () => {
    const colorMap = {
      primary: colors.text,
      secondary: colors.textSecondary,
      success: COLORS.success,
      warning: COLORS.warning,
      danger: COLORS.danger,
      white: COLORS.white,
    };
    return colorMap[color];
  };

  const textStyle = {
    fontSize: parseInt(typography.fontSize),
    fontWeight: getFontWeight(),
    color: getColor(),
    textAlign,
    lineHeight: parseInt(typography.fontSize) * 1.4,
    fontFamily: typography.fontFamily,
  };

  return (
    <RNText
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      accessible={accessible}
      accessibilityLiveRegion={accessibilityLiveRegion}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </RNText>
  );
};
