import { Flex } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { RecordingListItem } from '@/components/birdnet/RecordingListItem';
import { SavedRecording } from '@/utils/birdnetTypes';
import { getAllRecordings, deleteRecording } from '@/utils/recordingStorage';
import { useRecordingContext } from '@/contexts/RecordingContext';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import { logger } from '@/utils/logger';

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { recordedAudioUri, setRecordedAudioUri } = useRecordingContext();

  const loadRecordings = async () => {
    try {
      const allRecordings = await getAllRecordings();
      setRecordings(allRecordings);
    } catch (error) {
      logger.error('Failed to load recordings:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load recordings when the tab is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadRecordings();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRecordings();
  };

  const handleDelete = async (id: string) => {
    try {
      // Find the recording before deleting to check if it matches current recording
      const recordingToDelete = recordings.find((r) => r.id === id);

      await deleteRecording(id);

      // Remove from local state immediately for optimistic UI
      setRecordings((prev) => prev.filter((r) => r.id !== id));

      // Only clear the Home tab's recording if it matches the deleted one
      if (recordingToDelete?.audioUri === recordedAudioUri) {
        logger.log('🗑️ Clearing current recording as it was deleted');
        setRecordedAudioUri(null);
      }
    } catch (error) {
      logger.error('Failed to delete recording:', error);
      // Optionally show error to user
    }
  };

  if (isLoading) {
    return (
      <Flex
        testID="loading-recordings"
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="md"
      >
        <Text variant="body" color="secondary">
          Loading recordings...
        </Text>
      </Flex>
    );
  }

  if (recordings.length === 0) {
    return (
      <Flex
        testID="empty-recordings"
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="md"
      >
        <Text variant="h3" weight="semibold" textAlign="center" style={styles.emptyTitle}>
          No recordings yet
        </Text>
        <Text variant="body" color="secondary" textAlign="center" style={styles.emptySubtitle}>
          Record and analyze bird sounds to see them here
        </Text>
      </Flex>
    );
  }

  return (
    <ScrollView
      testID="recordings-scroll-view"
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      <Flex flexDirection="column" paddingRight="sm" paddingLeft="sm" flex={1}>
        {recordings.map((recording) => (
          <RecordingListItem key={recording.id} recording={recording} onDelete={handleDelete} />
        ))}
      </Flex>
    </ScrollView>
  );
};

const NotSuppertedPage = () => {
  return (
    <Flex flex={1} justifyContent="center" alignItems="center" padding="md">
      <Text variant="h3" weight="semibold" textAlign="center" style={styles.emptyTitle}>
        Recording are not saved on Web
      </Text>
      <Text variant="body" color="secondary" textAlign="center" style={styles.emptySubtitle}>
        You can save your recordings when using the mobile app
      </Text>
    </Flex>
  );
};

export default Platform.OS === 'web' ? NotSuppertedPage : RecordingsPage;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Account for tab bar
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtitle: {
    maxWidth: 300,
  },
});
