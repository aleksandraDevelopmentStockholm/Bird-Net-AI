import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider';
import { RecordingProvider } from '@/contexts/RecordingContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { TestConfig } from '@/utils/testConfig';
import { COLORS } from '@/constants/ui';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import '@/utils/errorSuppression'; // Suppress known React Native warnings
import { logger } from '@/utils/logger';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    ...MaterialIcons.font,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded || fontError) {
        // Add a small delay to ensure fonts are truly ready for rendering
        await new Promise((resolve) => setTimeout(resolve, 100));
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // Handle deep links for test configuration
  useEffect(() => {
    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      // Only process and log URLs with mock mode parameters
      if (url.includes('?mockMode=') || url.includes('&mockMode=')) {
        logger.log('📱 Deep link received:', url);
        TestConfig.configureFromUrl(url);
      }
    });

    // Handle URL when app is opened from a link
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('?mockMode=') || url.includes('&mockMode='))) {
        logger.log('📱 Initial URL:', url);
        TestConfig.configureFromUrl(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RecordingProvider>
            <ThemedStack />
          </RecordingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
