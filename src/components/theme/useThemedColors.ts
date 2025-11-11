import { COLORS } from '@/constants/ui';
import { useTheme } from './ThemeProvider';

/**
 * Semantic color type that works across light and dark themes
 */
export type SemanticColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'background'
  | 'backgroundSecondary'
  | 'border'
  | 'card'
  | 'placeholder'
  | 'white'
  | 'black'
  | 'transparent';

/**
 * Hook that returns theme-aware colors based on current theme (light/dark)
 * Use this instead of importing useTheme everywhere
 *
 * @example
 * const colors = useThemedColors();
 * <View style={{ backgroundColor: colors.background }} />
 * <Text style={{ color: colors.secondary }} />
 */
export const useThemedColors = () => {
  const { isDark } = useTheme();
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  return {
    // Theme-aware colors (change based on light/dark mode)
    text: themeColors.text,
    textSecondary: themeColors.textSecondary,
    textMuted: themeColors.textMuted,
    background: themeColors.background,
    backgroundSecondary: themeColors.backgroundSecondary,
    border: themeColors.border,
    card: themeColors.card,
    placeholder: themeColors.placeholder,
    secondary: isDark ? COLORS.dark.secondary : COLORS.secondary,

    // Static colors (same in light/dark mode)
    primary: COLORS.primary,
    accent: COLORS.accent,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    white: COLORS.white,
    black: COLORS.black,
    transparent: COLORS.transparent,

    // Utility: get any semantic color by name
    get: (color: SemanticColor): string => {
      const colorMap: Record<SemanticColor, string> = {
        primary: COLORS.primary,
        secondary: isDark ? COLORS.dark.secondary || COLORS.secondary : COLORS.secondary,
        accent: COLORS.accent,
        success: COLORS.success,
        warning: COLORS.warning,
        danger: COLORS.danger,
        text: themeColors.text,
        textSecondary: themeColors.textSecondary,
        textMuted: themeColors.textMuted,
        background: themeColors.background,
        backgroundSecondary: themeColors.backgroundSecondary,
        border: themeColors.border,
        card: themeColors.card,
        placeholder: themeColors.placeholder,
        white: COLORS.white,
        black: COLORS.black,
        transparent: COLORS.transparent,
      };
      return colorMap[color];
    },

    // Raw theme object for advanced use
    isDark,
  };
};

/**
 * Resolve a semantic color name to its actual hex value
 * Useful for inline style objects
 *
 * @example
 * const colors = useThemedColors();
 * const bgColor = colors.resolve('secondary'); // Returns actual hex color
 */
export type ResolvedColors = ReturnType<typeof useThemedColors>;
