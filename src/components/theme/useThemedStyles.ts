import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useThemedColors, ResolvedColors } from './useThemedColors';

/**
 * Hook for creating theme-aware StyleSheet styles
 * Automatically updates when theme changes (light/dark)
 *
 * @example
 * const styles = useThemedStyles((colors) => ({
 *   container: {
 *     backgroundColor: colors.background,
 *     borderColor: colors.border,
 *   },
 *   text: {
 *     color: colors.textSecondary,
 *   },
 * }));
 *
 * // Use like normal styles
 * <View style={styles.container}>
 *   <Text style={styles.text}>Hello</Text>
 * </View>
 */
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  stylesFn: (colors: ResolvedColors) => T
): T => {
  const colors = useThemedColors();

  return useMemo(() => {
    const styles = stylesFn(colors);
    return StyleSheet.create(styles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors.isDark]); // Only recreate when theme changes, colors object is derived from isDark
};

/**
 * Alternative: Get a single themed style object without creating a StyleSheet
 * Useful for dynamic styles or inline styles
 *
 * @example
 * const style = useThemedStyle((colors) => ({
 *   backgroundColor: colors.card,
 *   borderColor: colors.border,
 * }));
 */
export const useThemedStyle = <T extends ViewStyle | TextStyle | ImageStyle>(
  styleFn: (colors: ResolvedColors) => T
): T => {
  const colors = useThemedColors();

  return useMemo(() => {
    return styleFn(colors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors.isDark]); // Only recreate when theme changes, colors object is derived from isDark
};
