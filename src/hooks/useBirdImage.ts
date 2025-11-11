/**
 * useBirdImage Hook
 *
 * React hook for loading bird images on-demand from iNaturalist.
 * Handles loading states and provides image data with attribution.
 * Automatically preloads images for better perceived performance.
 */

import { useState, useEffect } from 'react';
import {
  getBirdImageUrl,
  getBirdImageData,
  hasBirdImage,
  preloadBirdImage,
  type BirdImageData,
  type ImageSize,
} from '@/utils/birdImageService';

interface UseBirdImageResult {
  /** Image URL ready to use with Image component */
  imageUrl: string | null;
  /** Complete image data including attribution */
  imageData: BirdImageData | null;
  /** Whether the image is available */
  isAvailable: boolean;
  /** Loading state (mainly for future async operations) */
  isLoading: boolean;
}

/**
 * Hook to get bird image URL and data
 *
 * @param speciesLabel - Species label in format "ScientificName_Common Name"
 * @param size - Image size variant (default: 'medium')
 * @returns Image URL, data, and loading state
 *
 * @example
 * function BirdCard({ species }: { species: string }) {
 *   const { imageUrl, imageData, isAvailable } = useBirdImage(species, 'large');
 *
 *   if (!isAvailable) {
 *     return <Text>No image available</Text>;
 *   }
 *
 *   return (
 *     <View>
 *       <Image source={{ uri: imageUrl }} style={styles.image} />
 *       <Text>{imageData?.attribution}</Text>
 *     </View>
 *   );
 * }
 */
export function useBirdImage(
  speciesLabel: string | null | undefined,
  size: ImageSize = 'medium'
): UseBirdImageResult {
  const [isLoading, setIsLoading] = useState(true);

  // Get image data (synchronous - already loaded from JSON)
  const imageData = speciesLabel ? getBirdImageData(speciesLabel) : null;
  const imageUrl = speciesLabel ? getBirdImageUrl(speciesLabel, size) : null;
  const isAvailable = speciesLabel ? hasBirdImage(speciesLabel) : false;

  // Preload the image when the component mounts
  useEffect(() => {
    // Early return inside useEffect is allowed
    if (!speciesLabel) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    if (imageUrl) {
      preloadBirdImage(speciesLabel, size)
        .then(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [speciesLabel, size, imageUrl]);

  return {
    imageUrl,
    imageData,
    isAvailable,
    isLoading,
  };
}
