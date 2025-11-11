import { Flex } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/birdnet/Header';
import { Instructions } from '@/components/birdnet/Instructions';
import { Spacer } from '@/components/ui/Spacer';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useRecordingContext } from '@/contexts/RecordingContext';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { setRecordedAudioUri } = useRecordingContext();

  useEffect(() => {
    setRecordedAudioUri(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      testID="home-scroll-view"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Flex padding="sm" flex={1} justifyContent="flex-start">
        <Header />
        <Spacer size="md" />
        <Instructions />
        <Button
          variant="secondary"
          size="lg"
          fullWidth={true}
          text="Start Recording"
          onPress={() => router.push('/recording')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Start recording"
          accessibilityHint="Double tap to go to the recording page"
          testID="start-recording-button"
        />
      </Flex>
    </ScrollView>
  );
}
