import { BirdNNET } from '@/utils/birdnetTypes';

/**
 * Mock bird detection results for Storybook stories
 */

export const mockBirdSingle: BirdNNET = {
  species: 'Turdus migratorius',
  commonName: 'American Robin',
  confidence: 0.89,
  timestamp: 1234567890,
};

export const mockBirdHighConfidence: BirdNNET = {
  species: 'Cardinalis cardinalis',
  commonName: 'Northern Cardinal',
  confidence: 0.95,
  timestamp: 1234567891,
};

export const mockBirdLowConfidence: BirdNNET = {
  species: 'Sialia sialis',
  commonName: 'Eastern Bluebird',
  confidence: 0.32,
  timestamp: 1234567892,
};

export const mockBirdLongName: BirdNNET = {
  species: 'Toxostoma longirostre',
  commonName: 'Long-billed Thrasher with an Extremely Long Common Name',
  confidence: 0.67,
  timestamp: 1234567893,
};

export const mockMultipleBirds: BirdNNET[] = [
  {
    species: 'Cardinalis cardinalis',
    commonName: 'Northern Cardinal',
    confidence: 0.92,
    timestamp: 1234567890,
  },
  {
    species: 'Cyanocitta cristata',
    commonName: 'Blue Jay',
    confidence: 0.87,
    timestamp: 1234567891,
  },
  {
    species: 'Turdus migratorius',
    commonName: 'American Robin',
    confidence: 0.81,
    timestamp: 1234567892,
  },
  {
    species: 'Zenaida macroura',
    commonName: 'Mourning Dove',
    confidence: 0.76,
    timestamp: 1234567893,
  },
  {
    species: 'Picoides pubescens',
    commonName: 'Downy Woodpecker',
    confidence: 0.68,
    timestamp: 1234567894,
  },
];

export const mockManyBirds: BirdNNET[] = [
  ...mockMultipleBirds,
  {
    species: 'Sitta carolinensis',
    commonName: 'White-breasted Nuthatch',
    confidence: 0.62,
    timestamp: 1234567895,
  },
  {
    species: 'Poecile atricapillus',
    commonName: 'Black-capped Chickadee',
    confidence: 0.58,
    timestamp: 1234567896,
  },
  {
    species: 'Junco hyemalis',
    commonName: 'Dark-eyed Junco',
    confidence: 0.54,
    timestamp: 1234567897,
  },
];

export const mockLowConfidenceBirds: BirdNNET[] = [
  {
    species: 'Sturnella magna',
    commonName: 'Eastern Meadowlark',
    confidence: 0.28,
    timestamp: 1234567890,
  },
  {
    species: 'Agelaius phoeniceus',
    commonName: 'Red-winged Blackbird',
    confidence: 0.23,
    timestamp: 1234567891,
  },
  {
    species: 'Quiscalus quiscula',
    commonName: 'Common Grackle',
    confidence: 0.19,
    timestamp: 1234567892,
  },
];

// Mock audio URIs for different platforms
export const mockAudioUri = {
  ios: 'file:///var/mobile/Containers/Data/Application/.../recording.m4a',
  android: 'file:///data/user/0/.../recording.m4a',
  web: 'blob:http://localhost:8081/abc-123-def-456',
};

// Helper to get platform-appropriate mock URI
export const getMockAudioUri = (): string => {
  if (typeof window !== 'undefined') {
    return mockAudioUri.web;
  }
  // Default to iOS format for Storybook
  return mockAudioUri.ios;
};
