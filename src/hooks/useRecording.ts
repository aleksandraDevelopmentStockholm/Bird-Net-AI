import {
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  IOSOutputFormat,
  AudioQuality,
  type RecordingOptions,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRecordingContext } from '@/contexts/RecordingContext';
import { logger } from '@/utils/logger';

const MAX_RECORDING_DURATION = 30; // Maximum recording duration in seconds

// WAV recording preset for BirdNET compatibility
// Uses 48kHz sample rate and mono channel to match BirdNET API requirements
const WAV_RECORDING_OPTIONS: RecordingOptions = {
  extension: '.wav',
  sampleRate: 48000, // BirdNET expects 48kHz
  numberOfChannels: 1, // Mono for smaller file size and BirdNET compatibility
  bitRate: 768000, // 48000 * 16 bits = 768kbps for uncompressed PCM
  isMeteringEnabled: true,
  android: {
    extension: '.wav',
    outputFormat: 'default', // DEFAULT format produces WAV on Android
    audioEncoder: 'default', // DEFAULT encoder for PCM
    sampleRate: 48000,
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM, // Uncompressed PCM
    audioQuality: AudioQuality.HIGH,
    sampleRate: 48000,
    linearPCMBitDepth: 16, // 16-bit audio
    linearPCMIsBigEndian: false, // Little-endian (standard for WAV)
    linearPCMIsFloat: false, // Integer PCM values
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 768000,
  },
};

export function useRecording() {
  const { recordedAudioUri, setRecordedAudioUri } = useRecordingContext();

  // Use WAV format for better compatibility with expo-audio-studio
  const audioRecorder = useAudioRecorder(WAV_RECORDING_OPTIONS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  // Poll recorder state only when recording to avoid excessive re-renders
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        const status = audioRecorder.getStatus();
        setRecordingDuration(status.durationMillis);

        // Check if recorder auto-stopped (when max duration reached)
        if (!status.isRecording && status.url) {
          logger.log('⏰ Recording auto-stopped at max duration');
          setIsRecording(false);
          setRecordedAudioUri(status.url);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, audioRecorder, setRecordingDuration, setIsRecording, setRecordedAudioUri]);

  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecorder = async () => {
    logger.log('🔄 Resetting recorder... (current isRecording:', isRecording, ')');

    if (audioRecorder.isRecording) {
      await audioRecorder.stop();
    }

    setRecordedAudioUri(null);
    setIsRecording(false);
    setRecordingDuration(0);

    logger.log('✅ Recorder reset complete');
  };

  const startRecordingWithPermissions = async () => {
    logger.log('📱 Starting new recording...');

    // Check permissions
    const currentPermission = await getRecordingPermissionsAsync();
    let granted = currentPermission.granted;

    if (!granted) {
      const { granted: newGranted } = await requestRecordingPermissionsAsync();
      granted = newGranted;
    }

    if (!granted) {
      throw new Error('Microphone permission not granted');
    }

    // Set audio mode
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });

    // Prepare and start recording
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record({ forDuration: MAX_RECORDING_DURATION * 1000 });

    setIsRecording(true);
    setRecordingDuration(0);
    logger.log('✅ Recording started');
  };

  const resetAndStartRecording = () => {
    return resetRecorder()
      .then(() => startRecordingWithPermissions())
      .catch((error) => {
        logger.error('❌ Failed to start recording:', error);
        Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      });
  };

  const stopRecording = async () => {
    try {
      logger.log('🛑 Stopping recording...');

      // Only stop if actually recording to avoid "Cannot stop without MediaRecorder" error
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }

      setIsRecording(false);
      setRecordingDuration(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logger.log('🛑 Recording stopped. isRecording:', false);

      // Reset audio mode to allow playback
      if (Platform.OS !== 'web') {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
        logger.log('📱 Audio mode reset for playback');
      }

      if (audioRecorder.uri) {
        logger.log('📁 Recording saved:', audioRecorder.uri);
        setRecordedAudioUri(audioRecorder.uri);
        logger.log('✅ Recording completed. Ready for analysis.');
      } else {
        logger.warn('⚠️ No recording URI available after stopping');
      }
    } catch (error) {
      logger.warn('Failed to stop recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  return {
    recordedAudioUri,
    isRecording,
    setIsRecording,
    recordingDuration,
    formatDuration,
    resetRecorder,
    stopRecording,
    resetAndStartRecording,
    maxDuration: MAX_RECORDING_DURATION * 1000,
  };
}
