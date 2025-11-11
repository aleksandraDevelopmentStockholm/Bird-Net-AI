import { View, StyleSheet } from 'react-native';
import { SPACING } from '@/constants/ui';
import { useThemedColors } from '@/components/theme';

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  horizontal?: boolean;
  divider?: boolean;
}

/**
 * Spacer component for adding consistent spacing between elements
 *
 * @param size - Size of the spacer (xs, sm, md, lg, xl). Default: 'md'
 * @param horizontal - If true, creates horizontal space. Default: false (vertical)
 * @param divider - If true, adds a horizontal line at the bottom of the spacer. Default: false
 *
 * @example
 * // Vertical spacing (default)
 * <Text>Item 1</Text>
 * <Spacer />
 * <Text>Item 2</Text>
 *
 * @example
 * // Horizontal spacing
 * <View style={{ flexDirection: 'row' }}>
 *   <Text>Item 1</Text>
 *   <Spacer horizontal />
 *   <Text>Item 2</Text>
 * </View>
 *
 * @example
 * // Spacer with divider line
 * <Text>Section 1</Text>
 * <Spacer size="lg" divider />
 * <Text>Section 2</Text>
 */
export function Spacer({ size = 'md', horizontal = false, divider = false }: SpacerProps) {
  const colors = useThemedColors();
  const sizes = {
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
    xl: SPACING.xl,
  };

  const spacerSize = sizes[size];
  const borderColor = colors.border;

  if (divider && !horizontal) {
    return (
      <View style={{ height: spacerSize, justifyContent: 'flex-end', flexGrow: 1 }}>
        <View style={[styles.divider, { borderBottomColor: borderColor }]} />
      </View>
    );
  }

  return <View style={horizontal ? { width: spacerSize } : { height: spacerSize }} />;
}

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: 1,
    width: '100%',
  },
});
