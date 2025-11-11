import { IconButton } from '@/components/ui/IconButton';
import { COLORS, TYPOGRAPHY } from '@/constants/ui';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface TabButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  isActive?: boolean;
  variant?: 'default' | 'primary';
  color?: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  isActive = false,
  variant = 'default',
  color: colorProp,
  onPress,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  // Determine icon button variant based on state
  const getIconVariant = () => {
    if (variant === 'primary') return 'primary';
    if (isActive) return 'active';
    return 'default';
  };

  // Determine colors
  const getColors = () => {
    if (variant === 'primary') {
      return {
        icon: COLORS.white,
        label: COLORS.primary,
      };
    }

    if (isActive) {
      return {
        icon: COLORS.white,
        label: colorProp || COLORS.secondary,
      };
    }

    return {
      icon: colorProp,
      label: colorProp,
    };
  };

  const colors = getColors();

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconWrapper}>
        <IconButton
          icon={icon}
          variant={getIconVariant()}
          color={colors.icon}
          onPress={onPress}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
        />
      </View>
      <Text
        style={[styles.label, { color: colors.label }]}
        accessible={false} // Label is part of the button's accessibility
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  iconWrapper: {
    marginBottom: 4,
  },
  label: {
    fontSize: parseInt(TYPOGRAPHY.small.fontSize),
    fontWeight: '500',
    textAlign: 'center',
  },
});
