/**
 * Bird Image Service
 *
 * Fetches bird images on-demand from iNaturalist via pre-generated URL mapping.
 * Zero hosting cost - images served directly from iNaturalist CDN.
 */

import birdImageUrlsRaw from '@/assets/data/bird-image-urls.json';
import { logger } from '@/utils/logger';

export interface BirdImageData {
  scientificName: string;
  commonName: string;
  imageUrl: string;
  mediumUrl: string;
  largeUrl: string;
  thumbnailUrl: string;
  attribution: string;
  license: string;
  observationId: number;
  photoId: number;
  qualityGrade: string; // 'research' = community verified (≥2 people agreed)
  numIdentificationAgreements?: number; // How many community members agreed on species ID
  faves?: number; // Number of favorites (quality/beauty indicator)
}

export type ImageSize = 'thumbnail' | 'medium' | 'large';

// Type the imported JSON with proper type assertion
const birdImageUrls = birdImageUrlsRaw as Record<string, BirdImageData | null>;

/**
 * Get bird image URL by species label
 *
 * @param speciesLabel - Species label in format "ScientificName_Common Name"
 * @param size - Image size variant (thumbnail, medium, or large)
 * @returns Image URL or null if not found
 *
 * @example
 * const imageUrl = getBirdImageUrl('Passer_domesticus_House Sparrow', 'medium');
 */
export function getBirdImageUrl(speciesLabel: string, size: ImageSize = 'medium'): string | null {
  const imageData = birdImageUrls[speciesLabel];

  if (!imageData) {
    return null;
  }

  switch (size) {
    case 'thumbnail':
      return imageData.thumbnailUrl;
    case 'medium':
      return imageData.mediumUrl;
    case 'large':
      return imageData.largeUrl;
    default:
      return imageData.mediumUrl;
  }
}

/**
 * Get complete bird image data including attribution
 *
 * @param speciesLabel - Species label in format "ScientificName_Common Name"
 * @returns Complete image data or null if not found
 *
 * @example
 * const data = getBirdImageData('Passer_domesticus_House Sparrow');
 * console.log(data?.attribution); // "(c) photographer, some rights reserved (CC BY)"
 */
export function getBirdImageData(speciesLabel: string): BirdImageData | null {
  const imageData = birdImageUrls[speciesLabel];
  return imageData || null;
}

/**
 * Get bird image URL by scientific name only
 *
 * @param scientificName - Scientific name (e.g., "Passer domesticus")
 * @param size - Image size variant
 * @returns Image URL or null if not found
 *
 * @example
 * const imageUrl = getBirdImageByScientificName('Passer domesticus', 'large');
 */
export function getBirdImageByScientificName(
  scientificName: string,
  size: ImageSize = 'medium'
): string | null {
  // Find the matching species label
  const label = Object.keys(birdImageUrls).find((key) => {
    const data = birdImageUrls[key as keyof typeof birdImageUrls];
    return data?.scientificName === scientificName;
  });

  if (!label) {
    return null;
  }

  return getBirdImageUrl(label, size);
}

/**
 * Check if an image is available for a species
 *
 * @param speciesLabel - Species label
 * @returns true if image is available
 */
export function hasBirdImage(speciesLabel: string): boolean {
  return (
    speciesLabel in birdImageUrls &&
    birdImageUrls[speciesLabel as keyof typeof birdImageUrls] !== null
  );
}

/**
 * Get all available species with images
 *
 * @returns Array of species labels that have images
 */
export function getAvailableSpecies(): string[] {
  return Object.keys(birdImageUrls).filter(
    (key) => birdImageUrls[key as keyof typeof birdImageUrls] !== null
  );
}

/**
 * Get statistics about available images
 *
 * @returns Statistics object
 */
export function getImageStats() {
  const total = Object.keys(birdImageUrls).length;
  const available = getAvailableSpecies().length;
  const missing = total - available;

  return {
    total,
    available,
    missing,
    coveragePercent: total > 0 ? Math.round((available / total) * 100) : 0,
  };
}

/**
 * Format species label from scientific name and common name
 *
 * Converts BirdNET result format to the label format used in image mapping.
 *
 * @param scientificName - Scientific name (e.g., "Passer domesticus")
 * @param commonName - Common name (e.g., "House Sparrow")
 * @returns Formatted label (e.g., "Passer domesticus_House Sparrow")
 *
 * @example
 * const label = formatSpeciesLabel("Passer domesticus", "House Sparrow");
 * // Returns: "Passer domesticus_House Sparrow"
 * const imageUrl = getBirdImageUrl(label, 'medium');
 */
export function formatSpeciesLabel(scientificName: string, commonName: string): string {
  // Combine scientific name and common name with underscore separator
  // This matches the format in labels.json: "ScientificName_Common Name"
  return `${scientificName}_${commonName}`;
}

/**
 * Preload a bird image to cache it
 *
 * Uses Image.prefetch on React Native and Image preload on web to cache the image
 * before it's needed, improving perceived performance.
 *
 * @param speciesLabel - Species label in format "ScientificName_Common Name"
 * @param size - Image size variant to preload
 * @returns Promise that resolves when image is cached
 *
 * @example
 * // Preload images when analysis results arrive
 * results.forEach(result => {
 *   const label = formatSpeciesLabel(result.species, result.commonName);
 *   preloadBirdImage(label, 'medium');
 * });
 */
export async function preloadBirdImage(
  speciesLabel: string,
  size: ImageSize = 'medium'
): Promise<boolean> {
  const imageUrl = getBirdImageUrl(speciesLabel, size);

  if (!imageUrl) {
    return false;
  }

  try {
    if (typeof Image !== 'undefined') {
      // Web: Use Image preload
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          logger.log(`✅ Preloaded image for ${speciesLabel}`);
          resolve(true);
        };
        img.onerror = () => {
          logger.warn(`❌ Failed to preload image for ${speciesLabel}`);
          resolve(false);
        };
        img.src = imageUrl;
      });
    } else {
      // React Native: Use Image.prefetch
      const { Image: RNImage } = await import('react-native');
      await RNImage.prefetch(imageUrl);
      logger.log(`✅ Preloaded image for ${speciesLabel}`);
      return true;
    }
  } catch (error) {
    logger.warn(`Failed to preload image for ${speciesLabel}:`, error);
    return false;
  }
}

/**
 * Preload multiple bird images in parallel
 *
 * @param speciesLabels - Array of species labels to preload
 * @param size - Image size variant to preload
 * @returns Promise that resolves when all images are loaded or failed
 *
 * @example
 * await preloadBirdImages(['Passer_domesticus_House Sparrow', 'Turdus_merula_Blackbird'], 'medium');
 */
export async function preloadBirdImages(
  speciesLabels: string[],
  size: ImageSize = 'medium'
): Promise<void> {
  await Promise.all(speciesLabels.map((label) => preloadBirdImage(label, size)));
}
