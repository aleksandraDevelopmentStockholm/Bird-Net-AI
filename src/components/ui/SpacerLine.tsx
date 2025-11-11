import { View } from 'react-native';
import { SPACING } from '@/constants/ui';

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  horizontal?: boolean;
}

/**
 * Spacer component for adding consistent spacing between elements
 *
 * @param size - Size of the spacer (xs, sm, md, lg, xl). Default: 'md'
 * @param horizontal - If true, creates horizontal space. Default: false (vertical)
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
 */
export function Spacer({ size = 'md', horizontal = false }: SpacerProps) {
  const sizes = {
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
    xl: SPACING.xl,
  };

  const spacerSize = sizes[size];

  return <View style={horizontal ? { width: spacerSize } : { height: spacerSize }} />;
}
