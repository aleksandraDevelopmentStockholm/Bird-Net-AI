import { ScrollView, Platform } from 'react-native';
import { Flex, SafeArea } from '@/components/ui/Layout';
import { Analysis } from '@/components/birdnet/Analysis';
import { Button } from '@/components/ui/Button';
import { useRecordingContext } from '@/contexts/RecordingContext';
import { File } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { logger } from '@/utils/logger';
import { router } from 'expo-router';

export default function AnalysisScreen() {
  const { recordedAudioUri, setRecordedAudioUri } = useRecordingContext();

  const clearRecording = () => {
    setRecordedAudioUri(null);
    router.push('/');
  };

  const deleteRecording = async () => {
    try {
      if (recordedAudioUri) {
        if (Platform.OS === 'web' && recordedAudioUri.startsWith('blob:')) {
          URL.revokeObjectURL(recordedAudioUri);
          logger.log('🗑️ Revoked blob URL:', recordedAudioUri);
        } else {
          try {
            const file = new File(recordedAudioUri);
            file.delete();
            logger.log('🗑️ Deleted recording from storage:', recordedAudioUri);
          } catch (fileError) {
            logger.log('File deletion skipped (may not exist):', fileError);
          }
        }
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Navigate back to home after deletion
      clearRecording();
    } catch (error) {
      logger.warn('Failed to delete recording:', error);
      clearRecording();
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearRecording();
  };

  // If no recording, redirect to recording page
  if (!recordedAudioUri) {
    return (
      <SafeArea edges={['top', 'bottom']}>
        <Flex padding="sm" flex={1} justifyContent="center">
          <Button
            variant="primary"
            size="lg"
            fullWidth={true}
            text="Go to Recording"
            onPress={() => router.push('/recording')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go to recording"
          />
        </Flex>
      </SafeArea>
    );
  }

  return (
    <SafeArea edges={['top', 'bottom']}>
      <ScrollView
        testID="analysis-scroll-view"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Flex padding="sm" flex={1}>
          <Flex flexDirection="row" justifyContent="flex-end" alignItems="center">
            <Button
              variant="roundIcon"
              colorVariant="secondary"
              size="md"
              icon="clear"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close analysis"
              accessibilityHint="Double tap to close this analysis"
              onPress={handleClose}
              testID="close-analysis-button"
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            />
          </Flex>
          <Analysis
            recordedAudioUri={recordedAudioUri}
            onDeleteRecording={deleteRecording}
            setRecordedAudioUri={setRecordedAudioUri}
          />
        </Flex>
      </ScrollView>
    </SafeArea>
  );
}
