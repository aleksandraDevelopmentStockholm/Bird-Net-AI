import { useThemedColors } from '@/components/theme';
import { COLORS } from '@/constants/ui';
import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface ProgressBarProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Border radius variant */
  variant?: 'standard' | 'rounded';
  /** Fill color - defaults to theme-aware primary */
  color?: string;
  /** Background color - defaults to theme-aware gray */
  backgroundColor?: string;
  /** Whether the bar should flex to fill available space */
  flex?: boolean;
  /** Minimum width when flex is enabled */
  minWidth?: number;
  /** Custom container style */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID */
  testID?: string;
}

const PROGRESS_BAR_SIZES = {
  sm: {
    height: 4,
    minWidth: 60,
  },
  md: {
    height: 8,
    minWidth: 100,
  },
  lg: {
    height: 12,
    minWidth: 120,
  },
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  variant = 'standard',
  color: colorProp,
  backgroundColor: backgroundColorProp,
  flex = false,
  minWidth,
  style,
  accessibilityLabel,
  testID,
}) => {
  const colors = useThemedColors();
  const sizeConfig = PROGRESS_BAR_SIZES[size];

  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Get colors
  const fillColor = colorProp || COLORS.primary;
  const bgColor = backgroundColorProp || colors.backgroundSecondary;

  // Determine border radius
  const borderRadius = variant === 'rounded' ? 999 : 4;

  const containerStyles: ViewStyle = {
    height: sizeConfig.height,
    backgroundColor: bgColor,
    borderRadius,
    overflow: 'hidden',
    ...(flex && { flex: 1 }),
    ...(minWidth !== undefined && { minWidth }),
    ...(!flex && !minWidth && { minWidth: sizeConfig.minWidth }),
  };

  const fillStyles: ViewStyle = {
    height: '100%',
    width: `${clampedProgress}%`,
    backgroundColor: fillColor,
    borderRadius,
  };

  return (
    <View
      style={[containerStyles, style]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || `Progress: ${Math.round(clampedProgress)}%`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress) }}
      testID={testID}
    >
      <View style={fillStyles} />
    </View>
  );
};
