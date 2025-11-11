import { SavedRecording, BirdNNET } from '@/utils/birdnetTypes';
import { AudioPlayer } from '@/components/birdnet/AudioPlayer';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OPACITY } from '@/constants/ui';
import { SavedRecordings } from '@/components/birdnet/SavedRecordings';
import { Flex } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { formatDate, formatDuration } from '@/utils/audioUtils';
import { Spacer } from '@/components/ui/Spacer';
import { logger } from '@/utils/logger';

interface RecordingListItemProps {
  recording: SavedRecording;
  onDelete: (id: string) => Promise<void>;
}

export function RecordingListItem({ recording, onDelete }: RecordingListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter valid bird results (excludes error results)
  const birdResults = (recording.results || []).filter(
    (result): result is BirdNNET => 'commonName' in result
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(recording.id);
    } catch (error) {
      logger.error('Failed to delete recording:', error);
      setIsDeleting(false);
    }
  };

  // Build accessibility label
  const speciesCount = birdResults.length;
  const accessibilityLabel = `Recording from ${formatDate(recording.date)}, ${
    speciesCount > 0 ? `${speciesCount} species detected` : 'no birds detected'
  }`;

  return (
    <View style={[...(isDeleting ? [styles.deleting] : [])]}>
      <Flex accessible={true} accessibilityRole="none" accessibilityLabel={accessibilityLabel}>
        {/* Recording metadata header */}
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingBottom="sm"
        >
          <Text variant="small" color="secondary">
            {formatDate(recording.date)}
          </Text>
          <Text variant="small" color="secondary">
            {formatDuration(recording.duration)}
          </Text>
        </Flex>

        {/* Audio player */}
        {recording.audioUri && (
          <AudioPlayer audioUri={recording.audioUri} deleteRecording={handleDelete} />
        )}

        {/* Bird detection results */}
        {birdResults.length > 0 && <SavedRecordings results={birdResults} />}

        {/* No birds detected message */}
        {recording.results && birdResults.length === 0 && (
          <Flex alignItems="center" paddingTop="md">
            <Text variant="body" color="secondary">
              No birds detected
            </Text>
          </Flex>
        )}

        <Spacer size="xl" divider />
      </Flex>
    </View>
  );
}

const styles = StyleSheet.create({
  deleting: {
    opacity: OPACITY.disabled,
  },
});
