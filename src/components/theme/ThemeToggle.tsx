import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Flex } from '@/components/ui/Layout';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'compact';
  showLabel?: boolean;
}

const ICON_SIZES = {
  sm: 18,
  md: 20,
  lg: 24,
} as const;

const THEME_CONFIG = {
  light: { icon: 'light-mode', label: 'Light' },
  dark: { icon: 'dark-mode', label: 'Dark' },
  system: { icon: 'brightness-auto', label: 'Auto' },
} as const;

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  variant = 'button',
  showLabel = true,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const config = THEME_CONFIG[theme] || THEME_CONFIG.system;
  const iconColor = isDark ? '#e6fbe0' : '#2c372d';

  if (variant === 'icon') {
    return (
      <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
        <MaterialIcons name={config.icon as any} size={ICON_SIZES[size]} color={iconColor} />
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
        <Flex flexDirection="row" alignItems="center">
          <MaterialIcons name={config.icon as any} size={ICON_SIZES[size]} color={iconColor} />
          {showLabel && <Text style={{ color: iconColor }}>{config.label}</Text>}
        </Flex>
      </TouchableOpacity>
    );
  }

  // Default button variant
  return (
    <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
      <Flex flexDirection="row" alignItems="center">
        <MaterialIcons name={config.icon as any} size={ICON_SIZES[size]} color={iconColor} />
        {showLabel && <Text style={{ color: iconColor }}>{config.label} Mode</Text>}
      </Flex>
    </TouchableOpacity>
  );
};

export default ThemeToggle;
