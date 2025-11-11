export interface BirdNNET {
  species: string;
  commonName: string;
  confidence: number;
  timestamp: number;
}

export type BirdNETResult = BirdNNET | { error: string };

export interface AudioData {
  uri: string;
  duration: number;
  sampleRate: number;
}

export interface BirdNETConfig {
  minConfidence: number;
  maxResults: number;
  locale: string;
}

export interface ModelLoadResult {
  success: boolean;
  error?: string;
  modelSize?: number;
}

export interface SavedRecording {
  id: string;
  audioUri: string;
  date: number; // timestamp
  duration: number; // in milliseconds
  results?: BirdNETResult[];
}
