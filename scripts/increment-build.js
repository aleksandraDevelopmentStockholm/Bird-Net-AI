#!/usr/bin/env node

/**
 * Increments build numbers for iOS and Android
 * Usage:
 *   node scripts/increment-build.js
 *   node scripts/increment-build.js ios
 *   node scripts/increment-build.js android
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'app.config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

const platform = process.argv[2] || 'both';

let updatedContent = configContent;

if (platform === 'both' || platform === 'ios') {
  // Increment iOS buildNumber
  updatedContent = updatedContent.replace(/buildNumber:\s*'(\d+)'/, (_match, buildNumber) => {
    const newBuildNumber = parseInt(buildNumber, 10) + 1;
    console.log(`📱 iOS: ${buildNumber} → ${newBuildNumber}`);
    return `buildNumber: '${newBuildNumber}'`;
  });
}

if (platform === 'both' || platform === 'android') {
  // Increment Android versionCode
  updatedContent = updatedContent.replace(/versionCode:\s*(\d+)/, (_match, versionCode) => {
    const newVersionCode = parseInt(versionCode, 10) + 1;
    console.log(`🤖 Android: ${versionCode} → ${newVersionCode}`);
    return `versionCode: ${newVersionCode}`;
  });
}

fs.writeFileSync(configPath, updatedContent, 'utf8');
console.log('✅ Build numbers updated in app.config.js');
