import { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/ui';
import { PressableContainer } from '@/components/ui/PressableContainer';
import { TestConfig } from '@/utils/testConfig';
import { useThemedColors } from '@/components/theme';

export const DevMenu = ({
  visible,
  setDevMenuVisible,
}: {
  visible: boolean;
  setDevMenuVisible: (visible: boolean) => void;
}) => {
  if (__DEV__) {
    return <DevOpenMenu visible={visible} setDevMenuVisible={setDevMenuVisible} />;
  }
  return null;
};

const MOCK_SCENARIOS = [
  {
    id: 'success',
    label: 'Success (3 birds)',
    description: 'Returns 3 bird detections with varying confidence',
  },
  { id: 'error', label: 'API Error', description: 'Simulates HTTP 500 server error' },
  { id: 'no_results', label: 'No Results', description: 'Empty results - no birds detected' },
  { id: 'single_result', label: 'Single Result', description: 'Returns only 1 bird detection' },
  {
    id: 'proxy',
    label: 'Proxy to Real API',
    description: 'Forwards request to real AWS API with payload.json audio',
  },
] as const;

function DevOpenMenu({
  visible,
  setDevMenuVisible,
}: {
  visible: boolean;
  setDevMenuVisible: (visible: boolean) => void;
}) {
  const colors = useThemedColors();
  const [mockMode, setMockMode] = useState(TestConfig.isMockMode());
  const [selectedScenario, setSelectedScenario] = useState(TestConfig.getMockScenario());

  const handleClose = () => {
    setDevMenuVisible(false);
  };

  const handleToggleMockMode = (enabled: boolean) => {
    TestConfig.setMockMode(enabled);
    setMockMode(enabled);
  };

  const handleScenarioChange = (scenario: string) => {
    TestConfig.setMockScenario(scenario as any);
    setSelectedScenario(scenario as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="bug-report" size={24} color={COLORS.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Developer Menu</Text>
          </View>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close developer menu"
            accessibilityHint="Double tap to close the developer menu"
          >
            <MaterialIcons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Mock Mode Toggle */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Mock API Server</Text>
              <Switch
                value={mockMode}
                onValueChange={handleToggleMockMode}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
            <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
              {mockMode ? '✅ Using mock server at localhost:3001' : '⚠️ Using real BirdNET API'}
            </Text>
            {!mockMode && (
              <Text style={[styles.warningText, { color: COLORS.warning }]}>
                💡 Enable mock mode to test without network calls or API costs
              </Text>
            )}
          </View>

          {/* Mock Scenarios */}
          {mockMode && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Scenarios</Text>
              <Text
                style={[styles.sectionDescription, { color: colors.textMuted, marginBottom: 12 }]}
              >
                Choose which mock response to return
              </Text>

              {MOCK_SCENARIOS.map((scenario) => (
                <PressableContainer
                  key={scenario.id}
                  variant={selectedScenario === scenario.id ? 'selected' : 'bordered'}
                  padding="md"
                  borderRadius={8}
                  style={{ marginBottom: 8 }}
                  onPress={() => handleScenarioChange(scenario.id)}
                >
                  <View style={styles.scenarioContent}>
                    <View style={styles.scenarioHeader}>
                      <Text style={[styles.scenarioLabel, { color: colors.text }]}>
                        {scenario.label}
                      </Text>
                      {selectedScenario === scenario.id && (
                        <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                      )}
                    </View>
                    <Text style={[styles.scenarioDescription, { color: colors.textMuted }]}>
                      {scenario.description}
                    </Text>
                  </View>
                </PressableContainer>
              ))}
            </View>
          )}

          {/* Instructions */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Use</Text>
            <View style={styles.instructionsList}>
              <Text style={[styles.instruction, { color: colors.textMuted }]}>
                📱 <Text style={{ fontWeight: '600' }}>Mobile:</Text> Tap the 🐛 button or shake
                your device
              </Text>
              <Text style={[styles.instruction, { color: colors.textMuted }]}>
                💻 <Text style={{ fontWeight: '600' }}>Web:</Text> Press Cmd+D (Mac) or Ctrl+D
                (Windows/Linux), or click the 🐛 button
              </Text>
              <Text style={[styles.instruction, { color: colors.textMuted }]}>
                🔄 Toggle mock mode to switch between real and fake API
              </Text>
              <Text style={[styles.instruction, { color: colors.textMuted }]}>
                🎯 Select scenarios to test different responses
              </Text>
              <Text style={[styles.instruction, { color: colors.textMuted }]}>
                🚀 Changes take effect immediately - just record audio!
              </Text>
            </View>
          </View>

          {/* Server Status */}
          {mockMode && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Mock Server Setup</Text>
              <Text style={[styles.instruction, { color: colors.textMuted }]}>
                Make sure the mock server is running:
              </Text>
              <View
                style={[
                  styles.codeBlock,
                  { backgroundColor: colors.isDark ? COLORS.gray[900] : COLORS.gray[100] },
                ]}
              >
                <Text
                  style={[
                    styles.codeText,
                    { color: colors.isDark ? COLORS.gray[300] : COLORS.gray[700] },
                  ]}
                >
                  cd test-server && pnpm start
                </Text>
              </View>
              <Text style={[styles.instruction, { color: colors.textMuted, marginTop: 8 }]}>
                Expected: Server running on http://localhost:3001
              </Text>
              {selectedScenario === 'proxy' && (
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: colors.isDark
                        ? COLORS.primary + '20'
                        : COLORS.primary + '10',
                      borderColor: COLORS.primary,
                      marginTop: 12,
                    },
                  ]}
                >
                  <Text style={[styles.instruction, { color: colors.text }]}>
                    💡 <Text style={{ fontWeight: '600' }}>Proxy Mode:</Text> Using payload.json
                    audio data to call real AWS API
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    // Import shadow from UI constants
    ...SHADOWS.floating,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  scenarioContent: {
    gap: 4,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scenarioLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  scenarioDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  instructionsList: {
    gap: 8,
  },
  instruction: {
    fontSize: 14,
    lineHeight: 20,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
});
