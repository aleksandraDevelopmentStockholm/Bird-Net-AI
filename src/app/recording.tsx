import { ScrollView } from 'react-native';
import { useEffect, useRef } from 'react';
import { Flex, SafeArea } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Spacer } from '@/components/ui/Spacer';
import { useRecording } from '@/hooks/useRecording';
import { router } from 'expo-router';

export default function RecordingScreen() {
  const { recordingDuration, resetAndStartRecording, formatDuration, stopRecording, maxDuration } =
    useRecording();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      resetAndStartRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStopRecording = async () => {
    await stopRecording();
    router.push('/analysis');
  };

  console.log('Rendering RecordingScreen with duration:', recordingDuration);

  return (
    <SafeArea edges={['top', 'bottom']}>
      <ScrollView
        testID="recording-scroll-view"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Flex padding="sm" flex={1}>
          <Flex flex={1} justifyContent="center" alignItems="center">
            <Button
              variant="textIcon"
              colorVariant="secondary"
              size="lg"
              icon="stop"
              text="Stop"
              fullWidth={true}
              onPress={handleStopRecording}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Recording for ${formatDuration(recordingDuration)}. Tap to stop`}
              accessibilityHint="Double tap to stop recording"
              accessibilityState={{
                busy: true,
              }}
              testID="recording-stop-button"
            />
            <Spacer size="sm" />

            <Flex testID="recording-duration-container" alignItems="center">
              <Text
                accessible={true}
                accessibilityLiveRegion="polite"
                variant="h1"
                color="secondary"
                textAlign="center"
                testID="recording-duration"
              >
                {`${formatDuration(recordingDuration)} / ${formatDuration(maxDuration)}`}
              </Text>
              <Text
                accessible={true}
                accessibilityLiveRegion="polite"
                variant="h1"
                weight="bold"
                color="secondary"
                textAlign="center"
                testID="recording-duration-text"
              >
                Recording...
              </Text>

              <Spacer size="sm" />
              <Text
                variant="h1"
                color="secondary"
                textAlign="center"
                accessible={true}
                accessibilityLabel="Keep your device steady while recording"
              >
                Keep device steady
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </ScrollView>
    </SafeArea>
  );
}
