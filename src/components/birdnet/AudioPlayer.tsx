import { Text } from '@/components/ui/Text';
import { COLORS, SPACING } from '@/constants/ui';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { Flex } from '@/components/ui/Layout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDuration } from '@/utils/audioUtils';

interface AudioPlayerProps {
  audioUri?: string;
  deleteRecording: () => Promise<void>;
}

export function AudioPlayer({ audioUri, deleteRecording }: AudioPlayerProps) {
  const player = useAudioPlayer(audioUri);
  const status = useAudioPlayerStatus(player);

  // Use audio player's built-in state
  const isPlaying = status.playing;
  const currentTime = status.currentTime * 1000; // Convert to milliseconds
  const displayDuration = status.duration * 1000; // Use player's actual duration in milliseconds

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (player.playing) {
      player.pause();
    } else {
      // If finished playing, restart from beginning
      if (currentTime >= displayDuration - 100) {
        // 100ms tolerance
        player.seekTo(0);
      }
      player.play();
    }
  };

  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;
  const hasFinished = currentTime >= displayDuration - 100 && !isPlaying; // 100ms tolerance
  let icon = 'play-arrow';
  let text = 'Play';
  let accessibilityState = 'Pause recording';
  let accessibilityHint = `Double tap to play the recorded bird sounds`;
  if (isPlaying) {
    icon = 'pause';
    text = 'Pause';
    accessibilityState = 'Resume recording';
    accessibilityHint = `Double tap to pause the playback of the recorded bird sounds`;
  }
  if (hasFinished) {
    icon = 'replay';
    text = 'Replay';
    accessibilityState = 'Play recording again';
    accessibilityHint = 'Double tap to replay the recorded bird sounds';
  }

  return (
    <Flex
      testID={'audio-player-container'}
      paddingTop="none"
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`Audio player. Recording duration ${formatDuration(displayDuration)}. Currently ${isPlaying ? 'playing' : 'paused'}`}
    >
      {/* Header */}
      <Flex flexDirection="column" themeAware={false}>
        <Text variant="h1" color="secondary" weight="bold">
          Your Recording
        </Text>
      </Flex>
      {/* Controls */}
      <Flex flexDirection="column" alignItems="center" justifyContent="center" themeAware={false}>
        <Button
          onPress={handlePlayPause}
          variant="textIcon"
          colorVariant="secondary"
          fullWidth={true}
          size="lg"
          icon={icon}
          iconColor={COLORS.white}
          text={text}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={accessibilityState}
          accessibilityHint={accessibilityHint}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />
        {audioUri && (
          <Button
            variant="textIcon"
            icon="delete"
            colorVariant="danger"
            size="lg"
            onPress={deleteRecording}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete recording"
            accessibilityHint="Double tap to Delete the current recording and start a new one"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            text="Delete"
            testID={`delete-recording-button`}
            fullWidth={true}
          />
        )}
      </Flex>

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        size="md"
        variant="standard"
        style={{ marginBottom: SPACING.sm }}
        accessibilityLabel={`Playback progress ${Math.round(progress)}%`}
      />

      {/* Visual State Indicator for Deaf Users */}
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        themeAware={false}
      >
        <Flex themeAware={false} flexDirection="row">
          <Text variant="h3" color="secondary">
            {formatDuration(Math.floor(currentTime))}
          </Text>
          <Text variant="h3" color="secondary">
            / {formatDuration(displayDuration)}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
