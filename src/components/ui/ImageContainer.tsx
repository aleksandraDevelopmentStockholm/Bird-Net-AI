import { StyleSheet, Image, ActivityIndicator, View, ImageSourcePropType } from 'react-native';
import { Flex } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { COLORS, BORDER_RADIUS } from '@/constants/ui';

interface ImageContainerProps {
  /** Image URI or source */
  source?: string | ImageSourcePropType;
  /** Whether the image is currently loading */
  isLoading?: boolean;
  /** Aspect ratio of the container (width / height). Default: 1 (square) */
  aspectRatio?: number;
  /** Border radius size. Default: 'md' */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Accessibility label for the image */
  accessibilityLabel?: string;
  /** Placeholder text when no image is available */
  placeholderText?: string;
  /** Loading indicator color */
  loadingColor?: string;
  /** Image resize mode */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** Test ID for testing */
  testID?: string;
}

/**
 * ImageContainer - A reusable component for displaying images with loading and error states
 *
 * @example
 * <ImageContainer
 *   source={{ uri: imageUrl }}
 *   isLoading={isLoading}
 *   accessibilityLabel="Photo of bird"
 *   aspectRatio={1}
 * />
 */
export function ImageContainer({
  source,
  isLoading = false,
  aspectRatio = 1,
  borderRadius = 'md',
  accessibilityLabel,
  placeholderText = 'No image available',
  loadingColor = COLORS.primary,
  resizeMode = 'cover',
  testID,
}: ImageContainerProps) {
  const borderRadiusMap = {
    none: BORDER_RADIUS.none,
    sm: BORDER_RADIUS.sm,
    md: BORDER_RADIUS.md,
    lg: BORDER_RADIUS.lg,
    xl: BORDER_RADIUS.xl,
  };

  const containerStyle = [
    styles.container,
    {
      aspectRatio,
      borderRadius: borderRadiusMap[borderRadius],
    },
  ];

  // Determine if we have a valid source
  const hasSource = source && (typeof source === 'string' ? source.length > 0 : true);

  return (
    <View style={containerStyle} testID={testID}>
      {isLoading ? (
        <Flex flex={1} justifyContent="center" alignItems="center" backgroundColor="primary">
          <ActivityIndicator size="large" color={loadingColor} />
        </Flex>
      ) : hasSource ? (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={styles.image}
          resizeMode={resizeMode}
          accessible={!!accessibilityLabel}
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <Flex flex={1} justifyContent="center" alignItems="center" backgroundColor="primary">
          <Text variant="h2" color="secondary">
            {placeholderText}
          </Text>
        </Flex>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
