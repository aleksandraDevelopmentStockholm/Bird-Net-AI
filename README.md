# BirdNet 🐦

> **⚠️ Work in Progress** - This project is actively under development. Features and documentation may be incomplete or subject to change.

A React Native mobile app for identifying bird species by their sounds, powered by AI.

## Overview

BirdNet allows you to:

- **Record** bird sounds using your phone's microphone
- **Identify** bird species using AI-powered analysis
- **View** detailed information about detected birds with confidence scores
- **Save** and replay your recordings

Built with React Native and Expo, with a serverless AWS backend for real-time bird identification.

## Features

- 🎙️ **Audio Recording** - High-quality bird sound capture
- 🤖 **AI Identification** - Powered by BirdNET neural network
- 📊 **Confidence Scores** - See how confident the AI is in each identification
- 💾 **Recording History** - Save and replay past recordings
- 🌍 **Serverless Backend** - Deploy to any AWS region for low-latency access
- ⚡ **Offline Development** - Mock API for rapid development
- 🐛 **Developer Menu** - In-app dev tools (shake to open on mobile, Cmd+D on web)
- 🎨 **Component Playground** - Test UI components in isolation (`/playground`)

## Tech Stack

**Frontend:**

- React Native with Expo
- TypeScript
- Expo Router (file-based routing)
- expo-av (audio recording/playback)

**Backend:**

- AWS Lambda (Node.js 22 + Docker)
- Amazon EFS (model storage)
- Amazon S3 (model files)
- API Gateway (REST API)
- Terraform (infrastructure as code)

**Testing:**

- Maestro (E2E testing)
- GitHub Actions (CI/CD)

## Project Structure

```
BirdNet/
├── src/              # Application source code
│   ├── app/         # Application screens (Expo Router)
│   ├── components/  # Reusable React components
│   ├── utils/       # Utility functions and services
│   ├── hooks/       # Custom React hooks
│   ├── constants/   # App constants
│   └── assets/      # Images, fonts, models
├── infra/           # Infrastructure & deployment
│   ├── terraform/   # AWS infrastructure as code
│   ├── lambda/      # Lambda function source
│   ├── scripts/     # Deployment scripts
│   └── model-data/  # Bird data & models
├── ios/             # iOS native code
├── android/         # Android native code
├── docs/            # Documentation
├── test-server/     # Mock API for testing
└── .maestro/        # E2E tests
```

---

# 📱 Frontend: Mobile App Development

Everything you need to develop, test, and build the React Native mobile app.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** - Fast package manager: `npm install -g pnpm`
- **Expo CLI** - For running the mobile app
- **Git** - For cloning the repository
- **iOS Simulator** (macOS only) - Included with Xcode
- **Android Emulator** - Install via Android Studio

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/aleksandraDevelopmentStockholm/BirdNet.git
cd BirdNet

# Install dependencies
pnpm install
```

### 2. Start Test Server (Optional)

For development without AWS backend deployment:

```bash
# Terminal 1: Start mock API server
cd test-server
pnpm install
pnpm start

# Terminal 2: Start development server (in a new terminal)
cd BirdNet
pnpm start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser (limited audio support)

The app will automatically use mock mode when the test server is running. You can also toggle mock mode using the Developer Menu (shake device or press Cmd+D).

### 3. Configuration

BirdNet supports multiple environment configurations using `.env` files:

**Environment Files:**

- `.env.<environment>` - Environment-specific config (e.g., `.env.dev`, `.env.prod`)
- `.env` - Active environment (copy from your environment file)

**Setup with Mock API (No Backend Required):**

For development without deploying the AWS backend, use mock mode:

```bash
# Create .env file
echo "EXPO_PUBLIC_MOCK_MODE=true" > .env

# Start the app
pnpm start
```

### 4. Setup with Real API:

Deploy the backend (see [Infrastructure Deployment](#infrastructure-backend-deployment) below), then add the credentials to your `.env` file:

```bash
EXPO_PUBLIC_BIRDNET_API_URL="<your-api-url>"
EXPO_PUBLIC_BIRDNET_API_KEY="<your-api-key>"
EXPO_PUBLIC_MOCK_MODE=false
```

## Security & Secrets Management

### Environment Variables

The app uses environment variables for configuration. **Never commit `.env` files to git.**

**App Configuration (.env):**

```bash
# BirdNet API
EXPO_PUBLIC_BIRDNET_API_URL=<your-api-url>
EXPO_PUBLIC_BIRDNET_API_KEY=<your-api-key>

# Mock Mode (for testing)
EXPO_PUBLIC_MOCK_MODE=false
EXPO_PUBLIC_MOCK_SCENARIO=success
```

**Protected Files (Already in .gitignore):**

- ✅ `.env*` - All environment files
- ✅ `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` - Apple certificates
- ✅ `*.jks` - Android keystores
- ✅ `terraform.tfvars` - Terraform variables

**Safe to Commit (Not Sensitive):**

- ✅ EAS Project ID: `7f5c5a22-ec1e-4d08-8ce1-5fcebc227fa6`
- ✅ Bundle Identifier: `com.amalesa.aiApp`
- ✅ App Scheme: `aiapp`
- ✅ AWS Region: `eu-north-1`

### Pre-Commit Security Checklist

Before committing, verify:

- [ ] No `.env` files committed
- [ ] No API keys in code
- [ ] No AWS credentials in code
- [ ] No Apple certificates committed
- [ ] All workflows use `${{ secrets.* }}`

**Audit Command:**

```bash
# Check for potential secrets in git history
git log -p | grep -i "password\|secret\|api[_-]key\|token"
```

**If Secrets Are Leaked:**

1. **Rotate immediately** - Change all exposed credentials
2. **Remove from history** - Use `git filter-branch` or BFG Repo-Cleaner
3. **Notify team** - Alert anyone with access
4. **Review access** - Check logs for unauthorized usage

## Development

### Run Locally

```bash
# Start Expo dev server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

### Run with Mock API

For faster development and testing without the real backend:

```bash
# Terminal 1: Start mock server
cd test-server && pnpm start

# Terminal 2: Start app (in another terminal)
pnpm start
```

### Developer Menu

An in-app developer menu is available for easy mock API toggling:

**How to open:**

- 📱 **Mobile**: Shake your device
- 💻 **Web**: Press `Cmd+D` (Mac) or `Ctrl+D` (Windows/Linux)

**Features:**

- Toggle mock mode on/off without rebuilding
- Select test scenarios (success, error, no results, single result)
- View mock server setup instructions
- Changes take effect immediately

**Quick workflow:**

1. Start mock server: `cd test-server && pnpm start`
2. Open DevMenu (shake device or press Cmd+D)
3. Toggle mock mode ON
4. Select a test scenario
5. Record audio and see mock results instantly

### Component Playground

The app includes a Component Playground for testing components in isolation during development.

**Access:** Navigate to `/playground` in your app

**Features:**

- All UI components with different states
- Interactive examples (buttons, inputs, etc.)
- BirdNet-specific components (Results, Analysis, Errors)
- Typography and layout examples
- Mock data for testing

**Location:** `app/playground.tsx`

## Testing

For detailed testing documentation, see [.maestro/README.md](.maestro/README.md)

## Troubleshooting

### Common Issues

**Metro bundler cache issues:**

```bash
# Clear Metro cache
pnpm start --clear

# Or manually
rm -rf node_modules/.cache
```

**iOS build fails:**

```bash
# Clean iOS build
cd ios && pod deintegrate && pod install && cd ..

# Clean Xcode build
cd ios && xcodebuild clean && cd ..
```

**Android build fails:**

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

**Environment variables not loading:**

```bash
# Restart Metro with cache clear
pnpm start --clear

# Verify .env file exists
cat .env
```

**Audio recording not working:**

- Check permissions in `app.config.js`
- iOS: Ensure microphone usage description is set
- Android: Ensure RECORD_AUDIO permission is requested

**Fast Refresh not working:**

- Save the file again
- Press `r` in Metro to reload
- Check for syntax errors in console

## Building the App

### Build Profiles

**Development** - For testing and debugging:

```bash
pnpm build:dev:ios        # iOS development build
pnpm build:dev:android    # Android development build
```

**Preview** - For internal testing (TestFlight, internal tracks):

```bash
pnpm build:preview:ios      # iOS preview build (TestFlight)
pnpm build:preview:android  # Android preview build
```

**Note:** iOS TestFlight distribution requires an Apple Developer Program membership (1,050 SEK/year). See [TestFlight Deployment Guide](.maestro/README.md#testflight-deployment-ios) for complete setup instructions.

**Production** - For App Store/Play Store release:

```bash
pnpm build:prod:ios      # iOS production build
pnpm build:prod:android  # Android production build
```

### EAS Secrets (For Builds)

Set these using EAS CLI:

```bash
# Login to EAS
eas login

# Create secrets
eas secret:create --scope project --name APPLE_ID --value "your-email@example.com"
eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
eas secret:create --scope project --name APPLE_TEAM_ID --value "ABCD123456"
```

### App Versioning

BirdNet uses semantic versioning with automatic build number management.

**Version Format:**

- **Version**: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- **Build Number**: Integer that increments with each build

**Update Version:**

```bash
# Bug fix (1.0.0 → 1.0.1)
pnpm version:patch

# New feature (1.0.0 → 1.1.0)
pnpm version:minor

# Breaking change (1.0.0 → 2.0.0)
pnpm version:major
```

**Increment Build Numbers:**

Before each production build:

```bash
# Increment both iOS and Android
pnpm build:increment

# Or individually
pnpm build:increment:ios
pnpm build:increment:android
```

**Typical Release Workflow:**

```bash
# 1. Bump version
pnpm version:minor

# 2. Increment build numbers
pnpm build:increment

# 3. Commit changes
git add package.json app.config.js
git commit -m "chore: bump version to 1.1.0"

# 4. Tag release
git tag v1.1.0
git push --tags

# 5. Build for production
pnpm build:prod:ios && pnpm build:prod:android
```

## CI/CD & Testing

BirdNet uses GitHub Actions for automated builds and E2E testing with **four powerful testing methods**:

### Quick Start

**For Daily Development:**
```bash
pnpm test-server &    # Start mock API
pnpm android:dev      # Run app
pnpm test:e2e         # Run E2E tests
```

**For CI/CD (No EAS Quota):**
```bash
gh workflow run e2e-android-docker.yml  # Android
gh workflow run e2e-ios-native.yml     # iOS
```

**For Production Releases:**
```bash
gh workflow run e2e-test.yml -f platform=all -f build_mode=new
```

### Available Workflows

| Workflow | Purpose | EAS Quota | Platform |
|----------|---------|-----------|----------|
| **e2e-android-docker.yml** ⭐ | E2E with Docker build | No | Android |
| **e2e-ios-native.yml** 🍎 | E2E with native build | No | iOS |
| **e2e-test.yml** | E2E with EAS build | Yes | iOS/Android |
| **app-build.yml** | App builds (EAS) | Yes | iOS/Android |

**Why separate workflows?** Android uses Docker (Linux), iOS uses native Xcode builds (macOS) - both skip EAS quota!

### Complete Documentation

**📖 [.github/workflows/README.md](.github/workflows/README.md)** - Complete guide with:

- All workflow details and usage
- Local testing with Maestro
- Docker build testing
- Running workflows locally with Act
- GitHub Actions setup
- Troubleshooting guide

### Quick Examples

```bash
# E2E tests (free, no EAS!)
gh workflow run e2e-android-docker.yml  # Android
gh workflow run e2e-ios-native.yml     # iOS

# Build app with EAS
gh workflow run app-build.yml -f profile=preview -f platform=all
```

---

# 🏗️ Infrastructure Backend Deployment

Deploy the AWS serverless backend for bird identification.

## Quick Overview

The backend infrastructure includes:

- **API Gateway** - REST API with CORS and rate limiting
- **Lambda Functions** - Bird identification API (~1.5GB with TensorFlow.js)
- **EFS** - Fast model loading and caching
- **S3** - Model file storage
- **CloudWatch** - Monitoring and logging
- **VPC** (optional) - Network isolation

**Cost:** ~50-160 SEK/month for development

See the [Architecture](#architecture) section below for the complete system diagram.

## Deploy Backend

For complete deployment instructions, see: **[infra/terraform/README.md](infra/terraform/README.md)**

The guide includes step-by-step instructions for infrastructure deployment, multi-environment setup, VPC configuration, security best practices, troubleshooting, and more.

---

## Documentation

- **[Testing Guide](.maestro/README.md)** - E2E testing with Maestro
- **[Infrastructure Guide](infra/terraform/README.md)** - AWS deployment and backend configuration

## Future Improvements

This project is under active development. Here are planned improvements:

### Testing

- [ ] **Unit Tests** - Add comprehensive unit tests for utility modules (rateLimiter, birdnetService, recordingStorage)
- [ ] **Integration Tests** - Test API integration and data flow
- [ ] **Component Tests** - Test React Native components in isolation

### Features

- [ ] **AsyncStorage Persistence for Daily Quota Tracker** - The daily API quota tracker currently uses in-memory storage, which resets on app restart. Implementing AsyncStorage would provide persistent quota tracking across app sessions.
- [ ] **Offline Mode** - Cache bird identifications for offline viewing
- [ ] **Social Features** - Share recordings and identifications with friends
- [ ] **Bird Encyclopedia** - Browse all supported bird species with images and sounds

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `maestro test .maestro/`
5. Commit: `git commit -m "feat: add your feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

## Architecture

```
┌────────────────┐
│  Mobile App    │
│ (React Native) │
└──────┬─────────┘
       │ HTTPS
       ▼
┌──────────────┐    ┌──────────┐    ┌──────────┐
│ API Gateway  │───▶│  Lambda  │───▶│   EFS    │
│   (REST)     │    │ (Docker) │    │ (Models) │
└──────────────┘    └──────────┘    └──────────┘
                           │
                           ▼
                    ┌──────────┐
                    │    S3    │
                    │ (Models) │
                    └──────────┘
```

## API

The BirdNET backend provides:

- `GET /health` - Health check and model status
- `POST /identify-bird` - Analyze audio and identify bird species

See [Infrastructure Guide](infra/terraform/README.md) for deployment details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

This project is open source and free to use. You are responsible for your own AWS costs and infrastructure.

## Acknowledgments

- **BirdNET** - Bird identification AI model
- **Expo** - React Native development platform
- **Maestro** - Mobile E2E testing framework
