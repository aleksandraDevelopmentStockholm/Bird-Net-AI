import { ScrollView, View, StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Flex, Card, SafeArea } from '@/components/ui/Layout';
import { Spacer } from '@/components/ui/Spacer';
import { Results } from '@/components/birdnet/Results';
import { ErrorDisplay } from '@/components/birdnet/ErrorDisplay';
import { WarningDisplay } from '@/components/birdnet/WarningDisplay';
import { Header } from '@/components/birdnet/Header';
import { Instructions } from '@/components/birdnet/Instructions';
import { AudioPlayer } from '@/components/birdnet/AudioPlayer';
import { ImageContainer } from '@/components/ui/ImageContainer';
import { BirdNNET } from '@/utils/birdnetTypes';
import { COLORS, SPACING } from '@/constants/ui';
import { formatDuration } from '@/utils/audioUtils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useThemedColors } from '@/components/theme';
import { Tabs } from '@/components/ui/Tabs';
import { logger } from '@/utils/logger';

// Mock data for testing
const mockBirds: BirdNNET[] = [
  {
    species: 'Turdus migratorius',
    commonName: 'American Robin',
    confidence: 0.89,
    timestamp: Date.now(),
  },
  {
    species: 'Cyanocitta cristata',
    commonName: 'Blue Jay',
    confidence: 0.76,
    timestamp: Date.now(),
  },
  {
    species: 'Cardinalis cardinalis',
    commonName: 'Northern Cardinal',
    confidence: 0.62,
    timestamp: Date.now(),
  },
];

const singleBird: BirdNNET[] = [
  {
    species: 'Sturnus vulgaris',
    commonName: 'European Starling',
    confidence: 0.45,
    timestamp: Date.now(),
  },
];

// Section component for organizing playground
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useThemedColors();

  return (
    <View style={styles.section}>
      <Text variant="h2" color="secondary" style={styles.sectionTitle}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionContent,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

// Interactive Recording Button Demo
function InteractiveRecordingDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_DURATION = 15000; // 15 seconds

  const handleStopRecording = () => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleReset = () => {
    handleStopRecording();
    setDuration(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Flex alignItems="center">
      <Text variant="caption" color="secondary" style={{ textAlign: 'center' }}>
        {isRecording
          ? `Recording: ${formatDuration(duration)} / ${formatDuration(MAX_DURATION)}`
          : duration > 0
            ? `Recording complete: ${formatDuration(duration)}`
            : 'Press button to start recording'}
      </Text>
      {duration > 0 && !isRecording && (
        <Button
          variant="outline"
          size="sm"
          text="Reset"
          onPress={handleReset}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Reset recording"
        />
      )}
    </Flex>
  );
}

export default function Playground() {
  // UI Components Tab Content
  const uiComponentsContent = (
    <ScrollView showsVerticalScrollIndicator={true}>
      <View style={styles.tabContentPadding}>
        {/* Buttons */}
        <Section title="Buttons">
          <Flex>
            <Button
              text="Primary Button"
              variant="primary"
              onPress={() => logger.log('Primary pressed')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Primary button"
            />
            <Button
              text="Secondary Button"
              variant="secondary"
              onPress={() => logger.log('Secondary pressed')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Secondary button"
            />
            <Button
              text="Outline Button"
              variant="outline"
              onPress={() => logger.log('Outline pressed')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Outline button"
            />
            <Button
              text="Disabled Button"
              variant="primary"
              disabled={true}
              onPress={() => {}}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Disabled button"
            />
            <Button
              text="Loading Button"
              variant="primary"
              loading={true}
              onPress={() => {}}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Loading button"
            />

            <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md }}>
              <Button
                variant="roundIcon"
                icon="play-arrow"
                size="md"
                onPress={() => logger.log('Play pressed')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Play button"
              />
              <Button
                variant="roundIcon"
                icon="pause"
                size="md"
                onPress={() => logger.log('Pause pressed')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Pause button"
              />
              <Button
                variant="roundIcon"
                icon="clear"
                colorVariant="secondary"
                size="md"
                onPress={() => logger.log('Clear pressed')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear button"
              />
            </View>
          </Flex>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <Flex>
            <Text variant="h1" color="primary">
              Heading 1 - Large Title
            </Text>
            <Text variant="h2" color="primary">
              Heading 2 - Section Title
            </Text>
            <Text variant="h3" color="secondary">
              Heading 3 - Subsection
            </Text>
            <Text variant="body" color="primary">
              Body Text - Regular paragraph content
            </Text>
            <Text variant="caption" color="secondary">
              Caption - Small helper text
            </Text>
          </Flex>
        </Section>

        {/* Spacer with Divider */}
        <Section title="Spacer with Divider">
          <Flex>
            <Text variant="h3" color="secondary">
              Section 1
            </Text>
            <Text variant="body" color="primary">
              Some content here
            </Text>
            <Spacer size="lg" divider />
            <Text variant="h3" color="secondary">
              Section 2
            </Text>
            <Text variant="body" color="primary">
              More content here
            </Text>
            <Spacer size="md" divider />
            <Text variant="h3" color="secondary">
              Section 3
            </Text>
            <Text variant="body" color="primary">
              Final content
            </Text>
          </Flex>
        </Section>

        {/* Layout */}
        <Section title="Flex Layout">
          <View style={{ gap: SPACING.md }}>
            <View>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Row with gap
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <View style={[styles.box, { backgroundColor: COLORS.primary }]} />
                <View style={[styles.box, { backgroundColor: COLORS.secondary }]} />
                <View style={[styles.box, { backgroundColor: COLORS.success }]} />
              </View>
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Column with gap
              </Text>
              <View style={{ flexDirection: 'column', gap: SPACING.md }}>
                <View style={[styles.box, { backgroundColor: COLORS.primary }]} />
                <View style={[styles.box, { backgroundColor: COLORS.secondary }]} />
                <View style={[styles.box, { backgroundColor: COLORS.success }]} />
              </View>
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Background Colors
              </Text>
              <View style={{ gap: SPACING.sm }}>
                <Flex backgroundColor="primary" padding="md">
                  <Text variant="body" color="primary">
                    Primary Background (20% opacity)
                  </Text>
                </Flex>
                <Flex backgroundColor="secondary" padding="md">
                  <Text variant="body" color="secondary">
                    Secondary Background (20% opacity)
                  </Text>
                </Flex>
                <Flex backgroundColor="white" padding="md">
                  <Text variant="body" color="primary">
                    White Background
                  </Text>
                </Flex>
                <Flex backgroundColor="transparent" padding="md">
                  <Text variant="body" color="primary">
                    Transparent Background
                  </Text>
                </Flex>
              </View>
            </View>
          </View>
        </Section>

        {/* Image Container */}
        <Section title="Image Container">
          <View style={{ gap: SPACING.lg }}>
            <View>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Loading State
              </Text>
              <View style={{ width: 200 }}>
                <ImageContainer
                  isLoading={true}
                  accessibilityLabel="Loading image"
                  aspectRatio={1}
                  borderRadius="md"
                />
              </View>
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Placeholder (No Image)
              </Text>
              <View style={{ width: 200 }}>
                <ImageContainer
                  accessibilityLabel="No image available"
                  aspectRatio={1}
                  borderRadius="md"
                  placeholderText="No image"
                />
              </View>
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                With Valid Image
              </Text>
              <View style={{ width: 200 }}>
                <ImageContainer
                  source="https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400"
                  accessibilityLabel="Sample bird photo"
                  aspectRatio={1}
                  borderRadius="md"
                />
              </View>
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Different Aspect Ratios
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' }}>
                <View style={{ width: 150 }}>
                  <Text variant="caption" color="secondary">
                    1:1 (Square)
                  </Text>
                  <ImageContainer
                    accessibilityLabel="Square placeholder"
                    aspectRatio={1}
                    borderRadius="sm"
                  />
                </View>
                <View style={{ width: 150 }}>
                  <Text variant="caption" color="secondary">
                    16:9 (Wide)
                  </Text>
                  <ImageContainer
                    accessibilityLabel="Wide placeholder"
                    aspectRatio={16 / 9}
                    borderRadius="sm"
                  />
                </View>
                <View style={{ width: 150 }}>
                  <Text variant="caption" color="secondary">
                    4:3
                  </Text>
                  <ImageContainer
                    accessibilityLabel="4:3 placeholder"
                    aspectRatio={4 / 3}
                    borderRadius="sm"
                  />
                </View>
              </View>
            </View>
          </View>
        </Section>
      </View>
    </ScrollView>
  );

  // BirdNet Components Tab Content
  const birdnetComponentsContent = (
    <ScrollView showsVerticalScrollIndicator={true}>
      <View style={styles.tabContentPadding}>
        {/* Interactive Recording Button */}
        <Section title="Interactive Recording Button">
          <InteractiveRecordingDemo />
          <Spacer size="md" divider />
          <Text variant="caption" color="secondary" style={{ textAlign: 'center' }}>
            Fully interactive - simulates recording timer up to 15 seconds
          </Text>
        </Section>

        {/* Static Recording Button States */}
        <Section title="Recording Button States (Static)">
          <Flex alignItems="center">
            <Text variant="h3" color="secondary" style={styles.exampleLabel}>
              Not Recording
            </Text>
            <Spacer />

            <Text variant="h3" color="secondary" style={styles.exampleLabel}>
              Recording (5s / 15s)
            </Text>
          </Flex>
        </Section>

        {/* Analysis States */}
        <Section title="Analysis">
          <Flex>
            <Text variant="caption" color="secondary" style={styles.exampleLabel}>
              Analysis component requires audio recording integration
            </Text>
            <Text variant="caption" color="secondary">
              See the main app for full recording → analysis flow
            </Text>
          </Flex>
        </Section>

        {/* Results */}
        <Section title="Results">
          <View style={{ gap: SPACING.lg }}>
            <View>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Multiple Results (3 birds)
              </Text>
              <Results results={mockBirds} />
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Single Result (1 bird)
              </Text>
              <Results results={singleBird} />
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Text variant="h3" color="secondary" style={styles.exampleLabel}>
                Empty State (0 birds)
              </Text>
              <Results results={[]} />
            </View>
          </View>
        </Section>

        {/* Error States */}
        <Section title="Error Display">
          <Flex>
            <ErrorDisplay message="Network timeout. Please check your connection." />
            <ErrorDisplay message="No microphone access. Please enable in settings." />
            <ErrorDisplay message="Service temporarily unavailable. Try again later." />
          </Flex>
        </Section>

        {/* Warning States */}
        <Section title="Warning Display">
          <Flex>
            <WarningDisplay message="Low confidence results. Try recording in a quieter environment." />
            <WarningDisplay message="Audio quality is low. Move closer to the bird." />
          </Flex>
        </Section>
      </View>
    </ScrollView>
  );

  // Complete Screens Tab Content
  const completeScreensContent = (
    <ScrollView showsVerticalScrollIndicator={true}>
      <View style={styles.tabContentPadding}>
        {/* Home Screen - Initial State */}
        <Section title="Home Screen - Initial State">
          <Card>
            <Flex>
              <Header />
              <Instructions />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - Recording */}
        <Section title="Home Screen - Recording (5s / 15s)">
          <Card>
            <Flex>
              <Header />
              <Instructions />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - With Recording (Ready to Analyze) */}
        <Section title="Home Screen - Ready to Analyze">
          <Card>
            <Flex>
              <Header />
              <AudioPlayer
                audioUri="mock://audio.mp3"
                deleteRecording={async () => logger.log('Delete recording')}
              />
              <Button
                variant="primary"
                size="lg"
                fullWidth={true}
                text="Find Birds"
                onPress={() => logger.log('Analyze')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Find birds"
                accessibilityHint="Double tap to identify bird species in your recording"
              />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - Analyzing */}
        <Section title="Home Screen - Analyzing">
          <Card>
            <Flex>
              <Header />
              <AudioPlayer
                audioUri="mock://audio.mp3"
                deleteRecording={async () => logger.log('Delete recording')}
              />
              <Button
                variant="primary"
                size="lg"
                fullWidth={true}
                text="Finding..."
                loading={true}
                onPress={() => {}}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Finding birds"
                accessibilityState={{ busy: true }}
              />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - Success with Results */}
        <Section title="Home Screen - Results Found (3 birds)">
          <Card>
            <Flex>
              <Header />
              <Results results={mockBirds} />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - Success with Single Result */}
        <Section title="Home Screen - Results Found (1 bird)">
          <Card>
            <Flex>
              <Header />
              <Results results={singleBird} />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - No Birds Found */}
        <Section title="Home Screen - No Birds Found">
          <Card>
            <Flex>
              <Header />
              <WarningDisplay message="No bird species detected. Try recording again in a different location or time." />
              <AudioPlayer
                audioUri="mock://audio.mp3"
                deleteRecording={async () => logger.log('Delete recording')}
              />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - Analysis Error */}
        <Section title="Home Screen - Analysis Error">
          <Card>
            <Flex>
              <Header />
              <ErrorDisplay message="Could not find birds. Please try again." />
              <AudioPlayer
                audioUri="mock://audio.mp3"
                deleteRecording={async () => logger.log('Delete recording')}
              />
              <Button
                variant="primary"
                size="lg"
                fullWidth={true}
                text="Try Again"
                onPress={() => logger.log('Try again')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Try again"
              />
            </Flex>
          </Card>
        </Section>

        {/* Home Screen - Network Error */}
        <Section title="Home Screen - Network Error">
          <Card>
            <Flex>
              <Header />
              <ErrorDisplay message="Network timeout. Please check your connection and try again." />
              <Button
                variant="secondary"
                size="lg"
                fullWidth={true}
                text="Retry"
                onPress={() => logger.log('Retry')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Retry"
              />
            </Flex>
          </Card>
        </Section>

        {/* Padding at bottom for scroll */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );

  const tabs = [
    { id: 'ui', label: 'UI Components', content: uiComponentsContent },
    { id: 'birdnet', label: 'BirdNet', content: birdnetComponentsContent },
    { id: 'screens', label: 'Complete Screens', content: completeScreensContent },
  ];

  return (
    <SafeArea edges={['top']}>
      {/* Header */}
      <Flex padding="lg">
        <ThemeToggle size="lg" showLabel={true} />
      </Flex>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTabId="ui" />
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  tabContentPadding: {
    padding: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
  },
  subtitle: {
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  sectionContent: {
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  exampleLabel: {
    marginBottom: SPACING.sm,
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  screenDivider: {
    marginVertical: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
  },
  screenDividerText: {
    textAlign: 'center',
  },
});
