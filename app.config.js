require('dotenv').config();
const packageJson = require('./package.json');

module.exports = {
  name: process.env.APP_NAME,
  slug: process.env.APP_SLUG,
  version: packageJson.version,
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  scheme: process.env.APP_SLUG,
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: process.env.IOS_BUNDLE_ID,
    buildNumber: '1',
    supportsTablet: true,
    infoPlist: {
      NSMicrophoneUsageDescription:
        'This app needs access to your microphone to record bird sounds for identification.',
      UIFileSharingEnabled: true,
      LSSupportsOpeningDocumentsInPlace: true,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: process.env.ANDROID_PACKAGE,
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './src/assets/images/android-adaptive-foreground.png',
      backgroundImage: './src/assets/images/android-adaptive-background.png',
      monochromeImage: './src/assets/images/android-adaptive-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
    ],
  },
  web: {
    output: 'static',
    favicon: './src/assets/images/favicon.png',
  },
  assetBundlePatterns: ['src/assets/models/**'],
  plugins: [
    'expo-router',
    'expo-dev-client',
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
};
