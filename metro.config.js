const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias for cleaner imports
config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, './src'),
};

// Enable require.context for Storybook
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Add resolver configuration for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add pnpm support for proper node_modules resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'), // For pnpm global modules
];

// Ensure proper resolution of dependencies
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
