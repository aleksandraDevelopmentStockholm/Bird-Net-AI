# BirdNet CI/CD & Testing Guide

Complete guide for building, testing, and running GitHub Actions workflows for the BirdNet mobile app.

## Table of Contents

- [Quick Start](#quick-start)
- [Available Workflows](#available-workflows)
- [Testing Methods](#testing-methods)
- [Local Development](#local-development)
- [GitHub Actions Setup](#github-actions-setup)
- [Running Workflows Locally with Act](#running-workflows-locally-with-act)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Daily Development
```bash
pnpm test-server &    # Start mock API
pnpm android:dev      # Run app
pnpm test:e2e         # Run E2E tests
```

### For CI/CD (No EAS Quota)
```bash
# Android
gh workflow run e2e-android-docker.yml

# iOS
gh workflow run e2e-ios-native.yml
```

### For Production Releases
```bash
gh workflow run e2e-test.yml -f platform=all -f build_mode=new
```

---

## Available Workflows

### 1. App Build (`app-build.yml`) - EAS Builds

Builds mobile app for iOS and/or Android using Expo Application Services.

**Triggers:** Manual dispatch only

**Parameters:**
- `profile`: development/preview/production
- `platform`: all/ios/android

**Usage:**
```bash
# Preview build for Android
gh workflow run app-build.yml -f profile=preview -f platform=android

# Production build for all platforms
gh workflow run app-build.yml -f profile=production -f platform=all
```

**What it does:**
- Builds app with EAS
- Selects secrets based on profile (dev vs prod)
- Posts build summary with download links

---

### 2. E2E Test - Android Docker (`e2e-android-docker.yml`) ⭐ RECOMMENDED

Runs E2E tests with Docker-built Android APK - **no EAS quota consumed!**

**Triggers:** Manual dispatch only

**Usage:**
```bash
# Run Android E2E tests with Docker build
gh workflow run e2e-android-docker.yml
gh run watch
```

**What it does:**
1. Builds Android APK in Docker container
2. Starts mock API server
3. Launches Android emulator
4. Runs Maestro E2E tests
5. Uploads test results

**Benefits:**
- ✅ No EAS quota consumption
- ✅ Free (GitHub Actions minutes only)
- ✅ Perfect for PR validation
- ✅ Full control over build
- ✅ Runs on Linux (ubuntu-latest)

**Limitations:**
- Android only
- Not for production builds

---

### 3. E2E Test - iOS Native (`e2e-ios-native.yml`) 🍎 NEW

Runs E2E tests with natively-built iOS app - **no EAS quota consumed!**

**Triggers:** Manual dispatch only

**Usage:**
```bash
# Run iOS E2E tests with native build
gh workflow run e2e-ios-native.yml
gh run watch
```

**What it does:**
1. Builds iOS .app using Xcode on macOS runner
2. Starts mock API server
3. Launches iOS Simulator
4. Runs Maestro E2E tests
5. Uploads test results

**Benefits:**
- ✅ No EAS quota consumption
- ✅ Free (GitHub Actions minutes only)
- ✅ Perfect for PR validation
- ✅ Full control over build

**Limitations:**
- Requires macOS runner (slower than Linux)
- Not for production builds

---

### 4. E2E Test - EAS Build (`e2e-test.yml`)

Runs E2E tests with EAS-built apps (production-like builds).

**Triggers:** Manual dispatch only

**Parameters:**
- `platform`: ios/android
- `build_mode`: existing/new
- `fingerprint`: Build fingerprint (required for existing mode)

**Usage:**
```bash
# Test with new EAS build
gh workflow run e2e-test.yml -f platform=android -f build_mode=new

# Test with existing build
gh workflow run e2e-test.yml \\
  -f platform=ios \\
  -f build_mode=existing \\
  -f fingerprint=abc123
```

**When to use:**
- Final validation before releases
- Testing iOS (requires EAS)
- Production-like build testing

---

## Testing Methods

You have **four ways** to test your app:

### 1. Local Development Testing ⚡ FASTEST

**Best for:** Daily development, debugging

```bash
# Terminal 1: Start mock server
pnpm test-server

# Terminal 2: Run app
pnpm android:dev  # or pnpm ios:dev

# Terminal 3: Run tests
pnpm test:e2e
```

**Time:** ~30 seconds
**Cost:** Free
**Setup:** Requires local emulator/simulator

---

### 2. Docker Build Testing 🐳 RECOMMENDED FOR CI

**Best for:** PR validation, testing without EAS

**GitHub Actions:**
```bash
# Android
gh workflow run e2e-android-docker.yml

# iOS
gh workflow run e2e-ios-native.yml
```

**Time:** 15-20 min (first), 5-10 min (cached)
**Cost:** Free (GitHub Actions minutes)

**Note:** Docker builds work best in GitHub Actions. For local testing, use the local development method above.

---

### 3. EAS Build Testing 🏭 PRODUCTION-LIKE

**Best for:** Final validation, releases, iOS testing

```bash
gh workflow run e2e-test.yml -f platform=all -f build_mode=new
```

**Time:** 20-25 min
**Cost:** GitHub Actions minutes + EAS quota

---

---

## Comparison Table

| Method | Speed | Cost | Platform | Best For |
|--------|-------|------|----------|----------|
| **Local** | ⚡ 30s | Free | iOS/Android | Daily dev |
| **Docker CI** | 🐌 15min | Free | Android | PRs, CI/CD |
| **EAS CI** | 🐢 25min | EAS quota | iOS/Android | Releases |

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm
- Android Studio (for Android) or Xcode (for iOS)
- Maestro CLI: `curl -Ls "https://get.maestro.mobile.dev" | bash`

### Running Tests Locally

1. **Start mock API server:**
   ```bash
   pnpm test-server
   ```
   Server runs on `http://localhost:3001`

2. **Configure environment:**
   - Android emulator: Update `.env.dev` to use `http://10.0.2.2:3001`
   - iOS simulator: Use `http://localhost:3001`

3. **Run app:**
   ```bash
   pnpm android:dev  # or pnpm ios:dev
   ```

4. **Run tests:**
   ```bash
   pnpm test:e2e
   ```

---

## GitHub Actions Setup

### Step 1: Configure Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### Required Secrets

| Secret | Description | How to get |
|--------|-------------|------------|
| `EXPO_TOKEN` | Expo auth token | `npx eas login && npx eas whoami --json` |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project ID | From your project config |
| `BIRDNET_API_URL_DEV` | Dev API endpoint | Your dev API URL |
| `BIRDNET_API_KEY_DEV` | Dev API key | Your dev API key |
| `BIRDNET_API_URL` | Prod API endpoint | Your prod API URL |
| `BIRDNET_API_KEY` | Prod API key | Your prod API key |

**Get Expo Token:**
```bash
npx eas login
npx eas whoami --json
# Copy the "authToken" value
```

### Step 2: Set Default Repository

```bash
gh repo set-default your-username/your-repo-name
```

### Step 3: Test Workflows

```bash
# Test E2E (free, no EAS)
gh workflow run e2e-android-docker.yml  # Android
gh workflow run e2e-ios-native.yml     # iOS

# Monitor
gh run watch

# View results
gh run list --workflow=e2e-docker.yml
```

---

## Troubleshooting

### Local Testing

**Problem:** Mock server not accessible

**Solution:**
```bash
# Android emulator uses special IP
# Update .env.dev:
EXPO_PUBLIC_BIRDNET_API_URL=http://10.0.2.2:3001

# iOS simulator uses localhost:
EXPO_PUBLIC_BIRDNET_API_URL=http://localhost:3001
```

**Problem:** Maestro can't find app

**Solution:**
```bash
# Verify app is running
adb devices  # Android
xcrun simctl list  # iOS

# Check app is installed
adb shell pm list packages | grep aiapp
```

---

### Docker Builds

**Problem:** Build fails or times out

**Solution:**
```bash
# Check Docker resources
# Docker Desktop → Settings → Resources
# Recommended: 4GB RAM minimum

# Clear cache
docker system prune -a

# Verify Dockerfile
./test-docker-build.sh build
```

**Problem:** APK not created

**Solution:**
```bash
# Run build step-by-step
docker run -it birdnet-app:test bash
# Inside container:
pnpm expo prebuild --platform android
cd android
./gradlew assembleRelease --stacktrace
```

---

### GitHub Actions

**Problem:** Workflow not found

**Solution:**
```bash
# Make sure workflow is pushed
git add .github/workflows/e2e-docker.yml
git commit -m "Add Docker E2E workflow"
git push

# Verify in GitHub
gh workflow list
```

**Problem:** Secrets not configured

**Solution:**
```bash
# Set via CLI
gh secret set EXPO_PUBLIC_EAS_PROJECT_ID -b"your-project-id"

# Or via GitHub UI
# Settings → Secrets and variables → Actions
```

**Problem:** Build fails with "No EAS project found"

**Solution:**
- Verify `EXPO_PUBLIC_EAS_PROJECT_ID` secret is set correctly
- Check `EXPO_TOKEN` is valid (not expired)

---

## Recommended Workflow Strategy

### During Development
```bash
# Fast iteration
pnpm test-server &
pnpm android:dev
pnpm test:e2e
```

### Before Pull Request
```bash
# Push and run on GitHub
git push origin feature-branch
gh workflow run e2e-android-docker.yml  # Android
gh workflow run e2e-ios-native.yml     # iOS
```

### Before Release
```bash
# Use EAS for production-like builds
gh workflow run e2e-test.yml -f platform=all -f build_mode=new
```

---

## File Structure

```
.
├── .github/
│   ├── workflows/
│   │   ├── app-build.yml              # EAS builds
│   │   ├── e2e-test.yml               # E2E with EAS
│   │   ├── e2e-android-docker.yml     # E2E Android (Docker, no EAS)
│   │   ├── e2e-ios-native.yml         # E2E iOS (Native, no EAS)
│   │   └── README.md                  # This file
│   └── actions/
│       └── setup-node-pnpm/        # Composite action
├── .maestro/                        # E2E test flows
├── test-server/                     # Mock API server
└── Dockerfile.android               # Docker build config (NEW!)
```

---

## Additional Resources

### Tools
- **EAS CLI:** https://docs.expo.dev/build/introduction/
- **Maestro:** https://maestro.mobile.dev/
- **GitHub CLI:** https://cli.github.com/

### Documentation
- **Expo Docs:** https://docs.expo.dev/
- **React Native:** https://reactnative.dev/
- **GitHub Actions:** https://docs.github.com/en/actions

---

## Summary

You have **four powerful testing methods**:

1. **Local testing** (⚡ fastest) - for daily development
2. **Docker builds** (🐳 free) - for PR validation in CI
3. **EAS builds** (🏭 production) - for releases

**Best practice:**
- Use **local** for development (instant feedback)
- Use **Docker** for PRs (free, fast, runs in CI)
- Use **EAS** for releases (production-quality)

Your testing is now faster, cheaper, and more flexible! 🚀

---

**Questions?** Check the troubleshooting section above or review the workflow files for implementation details.

**Last updated:** 2025-11-18
