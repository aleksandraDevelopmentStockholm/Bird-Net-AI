import { COLORS } from '@/constants/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useSegments } from 'expo-router';
import { Tabs, TabSlot, TabList, TabTrigger } from 'expo-router/ui';
import { StyleSheet, Pressable, Platform } from 'react-native';
import { SafeArea } from '@/components/ui/Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabButton } from '@/components/ui/TabButton';
import { DevMenu } from '@/components/dev/DevMenu';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { logger } from '@/utils/logger';

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 90,
    paddingTop: 30,
    paddingBottom: 10,
  },
  tabTrigger: {
    flex: 1,
  },
});

// Helper function to trigger haptic feedback on tab press
const triggerTabHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export default function TabLayout() {
  const { isDark } = useTheme();
  const [devMenuVisible, setDevMenuVisible] = useState(false);
  const segments = useSegments();
  const currentTab = segments[1] || 'index';
  const insets = useSafeAreaInsets();

  // Enable keyboard shortcut to open dev menu on web (Cmd+D or Ctrl+D)
  useEffect(() => {
    if (!__DEV__ || Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+D (Mac) or Ctrl+D (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
        event.preventDefault();
        logger.log('⌨️ Keyboard shortcut detected - opening dev menu');
        triggerTabHaptic();
        setDevMenuVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const themedTabBarStyle = {
    ...styles.tabBar,
    backgroundColor: isDark ? COLORS.dark.card : COLORS.white,
    borderTopColor: isDark ? COLORS.dark.border : COLORS.gray[200],
    color: isDark ? COLORS.dark.text : COLORS.gray[800],
    paddingBottom: Math.max(insets.bottom, 10), // Respect safe area, minimum 10px
  };

  return (
    <SafeArea edges={['top']}>
      <Tabs style={{ flex: 1 }}>
        <TabSlot style={{ flex: 1 }} />
        <TabList style={themedTabBarStyle}>
          <TabTrigger name="index" href="/" testID="home-tab" asChild>
            <Pressable
              style={styles.tabTrigger}
              onPressIn={triggerTabHaptic}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <TabButton
                icon="home"
                label="Home"
                isActive={currentTab === 'index'}
                color={themedTabBarStyle.color}
              />
            </Pressable>
          </TabTrigger>
          <TabTrigger name="recordings" href="/recordings" testID="recordings-tab" asChild>
            <Pressable
              style={styles.tabTrigger}
              onPressIn={triggerTabHaptic}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <TabButton
                icon="audiotrack"
                label="Recordings"
                isActive={currentTab === 'recordings'}
                color={themedTabBarStyle.color}
              />
            </Pressable>
          </TabTrigger>
          {__DEV__ && (
            <>
              <TabTrigger name="playground" href="/playground" testID="playground-tab" asChild>
                <Pressable
                  style={styles.tabTrigger}
                  onPressIn={triggerTabHaptic}
                  hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                >
                  <TabButton
                    icon="science"
                    label="Playground"
                    isActive={currentTab === 'playground'}
                    color={themedTabBarStyle.color}
                  />
                </Pressable>
              </TabTrigger>
              <Pressable
                style={styles.tabTrigger}
                onPress={() => setDevMenuVisible(true)}
                onPressIn={triggerTabHaptic}
                testID="development-tab"
                hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              >
                <TabButton icon="bug-report" label="DEV" variant="primary" />
              </Pressable>
            </>
          )}
        </TabList>
      </Tabs>
      {devMenuVisible && <DevMenu setDevMenuVisible={setDevMenuVisible} visible={devMenuVisible} />}
    </SafeArea>
  );
}
