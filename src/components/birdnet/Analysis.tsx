import { Button } from '@/components/ui/Button';
import { Flex } from '@/components/ui/Layout';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { BirdNETService } from '@/utils/birdnetService';
import { BirdNETResult, BirdNNET } from '@/utils/birdnetTypes';
import { AudioPlayer } from '@/components/birdnet/AudioPlayer';
import { Results } from '@/components/birdnet/Results';
import { ErrorDisplay } from '@/components/birdnet/ErrorDisplay';
import { WarningDisplay } from '@/components/birdnet/WarningDisplay';
import { saveRecording } from '@/utils/recordingStorage';
import { getAudioDuration, AudioLoadProgress } from '@/utils/audioUtils';
import { preloadBirdImages, formatSpeciesLabel } from '@/utils/birdImageService';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';
import { router } from 'expo-router';

interface AnalysisProps {
  recordedAudioUri: string;
  onDeleteRecording: () => Promise<void>;
  setRecordedAudioUri: (uri: string | null) => void;
}

const ANALYSIS_STATE = { none: 'none', pending: 'pending', done: 'done', error: 'error' } as const;

export function Analysis({
  recordedAudioUri,
  onDeleteRecording,
  setRecordedAudioUri,
}: AnalysisProps) {
  const [AnalysisStatus, setAnalysisStatus] = useState<
    (typeof ANALYSIS_STATE)[keyof typeof ANALYSIS_STATE]
  >(ANALYSIS_STATE.none);
  const [results, setResults] = useState<BirdNETResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<AudioLoadProgress | null>(null);

  const birdnetService = useRef(
    new BirdNETService({
      minConfidence: 0.1,
      maxResults: 5,
      locale: 'en_us',
    })
  );

  useEffect(() => {
    const service = birdnetService.current;
    return () => {
      service.dispose();
    };
  }, []);

  const analyzeRecording = async () => {
    if (!recordedAudioUri) {
      setErrorMessage('No recording found. Please record audio first.');
      setAnalysisStatus(ANALYSIS_STATE.error);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnalysisStatus(ANALYSIS_STATE.pending);
    setLoadingProgress(null);

    try {
      logger.log('🔍 Analyzing recorded audio...');

      const audioData = {
        uri: recordedAudioUri,
        duration: 0,
        sampleRate: 48000,
      };

      const analysisResults = await birdnetService.current.analyzeAudio(
        audioData,
        (progress: AudioLoadProgress) => {
          setLoadingProgress(progress);
        }
      );
      setResults(analysisResults);
      setLoadingProgress(null);
      const hasErrors = analysisResults.filter((result) => 'error' in result).length > 0;

      if (analysisResults.length === 1 && hasErrors) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMessage('Analysis failed. Please try again.');
        setAnalysisStatus(ANALYSIS_STATE.error);
        return;
      }

      if (analysisResults.length >= 0 && !hasErrors) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        logger.log('✅ Analysis complete:', analysisResults);

        // Preload bird images in the background for faster display
        const birdResults = analysisResults.filter(
          (result): result is BirdNNET => 'commonName' in result
        );
        const speciesLabels = birdResults.map((result) =>
          formatSpeciesLabel(result.species, result.commonName)
        );
        logger.log('🖼️ Preloading images for:', speciesLabels);
        preloadBirdImages(speciesLabels, 'medium').catch((err) =>
          logger.warn('Failed to preload some images:', err)
        );

        // Save recording with analysis results (doesn't throw, just logs warnings)
        if (Platform.OS !== 'web') {
          const duration = await getAudioDuration(recordedAudioUri);
          await saveRecording(recordedAudioUri, duration, analysisResults);
          logger.log('💾 Recording save attempted');
        } else {
          logger.log('💾 Recording saving skipped on web platform');
        }

        setAnalysisStatus(ANALYSIS_STATE.done);
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      logger.error('❌ Analysis failed:', error);

      // Display the actual error message from the service
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrorMessage(errorMessage);
      setAnalysisStatus(ANALYSIS_STATE.error);
    }
  };

  const handleRecordAgain = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRecordedAudioUri(null);
    router.push('/recording');
  };

  if (AnalysisStatus !== ANALYSIS_STATE.done) {
    return (
      <Flex justifyContent="space-between">
        {AnalysisStatus === ANALYSIS_STATE.error && (
          <ErrorDisplay
            message={errorMessage || 'Could not find birds. Please try again.'}
            testID="analysis-error"
          />
        )}

        <AudioPlayer audioUri={recordedAudioUri} deleteRecording={onDeleteRecording} />
        <Button
          variant="primary"
          size="lg"
          fullWidth={true}
          onPress={analyzeRecording}
          disabled={AnalysisStatus === ANALYSIS_STATE.pending}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            AnalysisStatus === ANALYSIS_STATE.pending
              ? loadingProgress
                ? `${loadingProgress.stage === 'reading' ? 'Reading audio file' : 'Decoding audio'}, ${loadingProgress.progress} percent complete`
                : 'Finding birds, please wait'
              : 'Find birds'
          }
          accessibilityHint={
            AnalysisStatus === ANALYSIS_STATE.pending
              ? 'Analysis in progress'
              : 'Double tap to identify bird species in your recording'
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityState={{
            disabled: AnalysisStatus === ANALYSIS_STATE.pending,
            busy: AnalysisStatus === ANALYSIS_STATE.pending,
          }}
          text={
            AnalysisStatus === ANALYSIS_STATE.pending
              ? loadingProgress
                ? `${loadingProgress.stage === 'reading' ? 'Reading' : 'Decoding'} ${loadingProgress.progress}%`
                : 'Finding...'
              : 'Find Birds'
          }
          testID="analyze-button"
        />
      </Flex>
    );
  }

  if (AnalysisStatus === ANALYSIS_STATE.done && results.length === 0) {
    return (
      <>
        <Flex justifyContent="space-between">
          <WarningDisplay
            message="No bird species detected. Try recording again in a different location or time."
            testID="no-results-warning"
          />
          <AudioPlayer audioUri={recordedAudioUri} deleteRecording={onDeleteRecording} />
          <Button
            variant="primary"
            size="lg"
            fullWidth={true}
            text="Record Again"
            onPress={handleRecordAgain}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Record again"
            accessibilityHint="Double tap to go back to recording page and record a new audio sample"
            testID="record-again-button"
          />
        </Flex>
      </>
    );
  }

  return (
    <>
      {AnalysisStatus === 'done' && results.length > 0 && (
        <>
          <Results
            results={results.filter(
              (result: BirdNETResult): result is BirdNNET => 'commonName' in result
            )}
          />
          <AudioPlayer audioUri={recordedAudioUri} deleteRecording={onDeleteRecording} />
        </>
      )}
    </>
  );
}
