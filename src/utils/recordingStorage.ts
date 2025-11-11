import { Directory, File, Paths } from 'expo-file-system';
import { BirdNETResult, SavedRecording } from '@/utils/birdnetTypes';
import { logger } from '@/utils/logger';

// Lazy initialization to avoid errors on web platform during module import
let _recordingsDir: Directory | null = null;
let _metadataFile: File | null = null;

function getRecordingsDir(): Directory {
  if (!_recordingsDir) {
    _recordingsDir = new Directory(Paths.cache, 'birdnet-recordings');
  }
  return _recordingsDir;
}

function getMetadataFile(): File {
  if (!_metadataFile) {
    _metadataFile = new File(getRecordingsDir(), 'metadata.json');
  }
  return _metadataFile;
}

/**
 * Initialize the recordings directory
 */
function ensureRecordingsDirectory(): void {
  const dir = getRecordingsDir();
  if (!dir.exists) {
    dir.create({ idempotent: true });
    logger.log('📁 Created birdnet-recordings directory');
  }
}

/**
 * Load all recording metadata
 */
async function loadMetadata(): Promise<SavedRecording[]> {
  try {
    const metadataFile = getMetadataFile();
    if (!metadataFile.exists) {
      return [];
    }

    const content = await metadataFile.text();
    return JSON.parse(content);
  } catch (error) {
    logger.warn('Failed to load recording metadata:', error);
    return [];
  }
}

/**
 * Save metadata to disk
 */
function saveMetadata(recordings: SavedRecording[]): void {
  ensureRecordingsDirectory();
  const metadataFile = getMetadataFile();
  metadataFile.write(JSON.stringify(recordings, null, 2), { encoding: 'utf8' });
}

/**
 * Save a new recording
 */
export async function saveRecording(
  audioUri: string,
  duration: number,
  results?: BirdNETResult[]
): Promise<SavedRecording> {
  ensureRecordingsDirectory();

  // Generate unique ID
  const id = `recording_${Date.now()}`;
  const fileName = `${id}.m4a`;
  const recordingsDir = getRecordingsDir();
  const targetFile = new File(recordingsDir, fileName);

  // Copy audio file to cache location
  let finalAudioUri = audioUri; // Default to original URI if copy fails
  try {
    // Extract filename from URI (e.g., file:///path/to/recording-xyz.m4a)
    const sourceFileName = audioUri.split('/').pop() || fileName;
    const sourceDir = new Directory(Paths.cache, 'Audio');
    const sourceFile = new File(sourceDir, sourceFileName);

    // Check if source file exists before attempting to copy
    if (!sourceFile.exists) {
      logger.warn(`⚠️ Source recording file not found: ${sourceFile.uri}`);
      logger.warn('📝 This is common in simulators - proceeding without file copy');
      // Keep original URI - analysis results are still valid even if we can't copy the file
    } else {
      sourceFile.copy(targetFile);
      finalAudioUri = targetFile.uri; // Use copied file URI
      logger.log('💾 Saved recording to cache:', targetFile.uri);
    }
  } catch (error) {
    logger.error('Failed to copy recording file:', error);
    // Keep original URI - gracefully degrade
    logger.warn('📝 Recording will use original URI instead of copied file');
  }

  // Create metadata entry
  const recording: SavedRecording = {
    id,
    audioUri: finalAudioUri, // Use original URI if copy failed, otherwise use copied file
    date: Date.now(),
    duration,
    results,
  };

  // Load existing metadata and append
  const recordings = await loadMetadata();
  recordings.unshift(recording); // Add to beginning (most recent first)

  // Save updated metadata
  saveMetadata(recordings);

  logger.log(`✅ Recording saved with ${results?.length || 0} bird detections`);

  return recording;
}

/**
 * Get all saved recordings
 */
export async function getAllRecordings(): Promise<SavedRecording[]> {
  return loadMetadata();
}

/**
 * Delete a recording
 */
export async function deleteRecording(id: string): Promise<void> {
  const recordings = await loadMetadata();
  const recordingIndex = recordings.findIndex((r) => r.id === id);

  if (recordingIndex === -1) {
    logger.warn('Recording not found:', id);
    return;
  }

  const recording = recordings[recordingIndex];

  // Delete audio file
  try {
    // Extract filename from URI
    const fileName = recording.audioUri.split('/').pop();
    if (fileName) {
      const recordingsDir = getRecordingsDir();
      const audioFile = new File(recordingsDir, fileName);
      if (audioFile.exists) {
        audioFile.delete();
        logger.log('🗑️ Deleted recording file:', recording.audioUri);
      }
    }
  } catch (error) {
    logger.warn('File deletion skipped (may not exist):', error);
  }

  // Remove from metadata
  recordings.splice(recordingIndex, 1);
  saveMetadata(recordings);

  logger.log('✅ Recording deleted:', id);
}

/**
 * Get recording by ID
 */
export async function getRecording(id: string): Promise<SavedRecording | null> {
  const recordings = await loadMetadata();
  return recordings.find((r) => r.id === id) || null;
}

/**
 * Clear all recordings (for testing purposes)
 */
export async function clearAllRecordings(): Promise<void> {
  const recordings = await loadMetadata();

  // Delete all audio files
  for (const recording of recordings) {
    try {
      const fileName = recording.audioUri.split('/').pop();
      if (fileName) {
        const recordingsDir = getRecordingsDir();
        const audioFile = new File(recordingsDir, fileName);
        if (audioFile.exists) {
          audioFile.delete();
        }
      }
    } catch (error) {
      logger.warn('Failed to delete recording file:', recording.audioUri, error);
    }
  }

  // Clear metadata
  saveMetadata([]);
  logger.log('🗑️ All recordings cleared');
}
