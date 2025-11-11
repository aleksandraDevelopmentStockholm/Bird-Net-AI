# Maestro E2E Tests

Complete guide for E2E testing the BirdNet app using Maestro and GitHub Actions.

## Overview

BirdNet uses **Maestro** for end-to-end testing with a **two-tier testing strategy**:

- **Local Development**: Fast, reliable tests using a mock API server
- **CI/CD Pipeline**: Integration tests using the real BirdNET API

This approach provides fast feedback during development while ensuring production readiness before deployment.

## Prerequisites

**Required:**

- **Node.js** (v18+) and **pnpm** installed
- **Maestro CLI** - `curl -Ls "https://get.maestro.mobile.dev" | bash`
- **Java 11+** - Required by Maestro: `brew install openjdk@11`
- **iOS Simulator** (macOS only) or **Android Emulator**

**For CI/CD testing:**

- **EAS CLI** - `npm install -g eas-cli`
- **Expo Account** - Sign up at [expo.dev](https://expo.dev)
- **GitHub Account** with repository access
- **Deployed BirdNET API** for integration tests

## Testing Strategy

### Local Development (Mock API)

**When to use:** During development for fast feedback

**Benefits:**

- ✅ Fast - No network latency or API rate limits
- ✅ Reliable - No external dependencies
- ✅ Flexible - Easy to test error scenarios
- ✅ Standard Practice - Industry-standard approach

**Setup:**

```bash
cd test-server && pnpm install && pnpm start
```

### CI/CD Pipeline (Real API)

**When to use:** Pre-deployment validation

**Benefits:**

- ✅ End-to-end validation
- ✅ Real-world scenarios
- ✅ Catch integration issues

**Runs via:** GitHub Actions on PR or manual trigger

## Quick Start

### 1. Install Dependencies

```bash
# Install mock server dependencies (one-time)
cd test-server && pnpm install && cd ..
```

### 2. Run All Tests

```bash
# Terminal 1: Start mock server
cd test-server && pnpm start

# Terminal 2: Run tests
pnpm test:e2e
```

### 3. Run Specific Tests

```bash
# All mock tests
maestro test .maestro/recording-flow-mock*.yaml

# Error handling tests
maestro test .maestro/recording-flow-mock-*-error.yaml

# Specific test
maestro test .maestro/recording-flow-mock-auth-error.yaml

# Manual integration test (requires real API)
maestro test .maestro/manual/recording-flow-api-proxy.yaml
```

### 4. Run with CI Output

```bash
pnpm test:e2e:ci
```

### Available Scripts

```bash
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:ci           # Run with JUnit output (for CI)
pnpm build:dev:ios         # Build development app (iOS)
pnpm build:dev:android     # Build development app (Android)
```

## Test Files Overview

### Basic Tests

- `home.yaml` - App launches and main tabs are visible
- `navigation.yaml` - Navigation between tabs
- `delete-recording.yaml` - Recording deletion functionality

### Recording Flow Tests (Success Scenarios)

- `recording-flow-mock.yaml` - Multiple bird detections
- `recording-flow-mock-single.yaml` - Single bird detection
- `recording-flow-mock-no-results.yaml` - No birds detected

### Error Handling Tests

- `recording-flow-mock-auth-error.yaml` - 401 authentication error
- `recording-flow-mock-forbidden-error.yaml` - 403 forbidden error
- `recording-flow-mock-rate-limit.yaml` - 429 rate limiting error
- `recording-flow-mock-server-error.yaml` - 500 server error
- `recording-flow-mock-error.yaml` - Generic error handling

### Integration Tests

- `manual/recording-flow-api-proxy.yaml` - Real API integration (requires credentials)

## Mock Server Scenarios

The mock server supports these scenarios for comprehensive testing:

| Scenario                 | HTTP Status | Description                                   |
| ------------------------ | ----------- | --------------------------------------------- |
| `success`                | 200         | Normal response with multiple bird detections |
| `single_result`          | 200         | Single bird detection                         |
| `no_results`             | 200         | No birds detected                             |
| `auth_error`             | 401         | Authentication failed                         |
| `forbidden_error`        | 403         | Access forbidden                              |
| `rate_limit_error`       | 429         | Too many requests                             |
| `server_error` / `error` | 500         | Server error                                  |
| `proxy`                  | varies      | Forward request to real API                   |

**Usage in tests:**

```yaml
- openLink: 'aiapp://?mockMode=true&mockScenario=auth_error'
```

## Writing New Tests

### Basic Test Structure

```yaml
appId: com.anonymous.aiapp
---
- launchApp
- assertVisible: 'Expected Text'
- tapOn: 'Button Label'
- inputText: 'Some input'
- assertVisible: 'Result Text'
```

### Common Maestro Commands

```yaml
# Navigation
- launchApp
- tapOn: 'Button Text'
- swipe:
    direction: UP

# Assertions
- assertVisible: 'Text or ID'
- assertNotVisible: 'Hidden Element'

# Input
- inputText: 'Text to type'
- tapOn:
    id: 'element-id'

# Waits
- waitForAnimationToEnd
- wait: 2000 # milliseconds
```

### Testing Error Scenarios

Use mock scenarios to test error handling:

```yaml
# Test authentication error
- openLink: 'aiapp://?mockMode=true&mockScenario=auth_error'
- tapOn: 'Record'
- assertVisible: 'Authentication failed'
```

### Test Guidelines

Each test should:

1. **Start with `appId` declaration** - Identifies the app
2. **Use `launchApp`** - Ensures fresh state
3. **Include clear assertions** - Verifies expected behavior
4. **Test one user flow** - Keeps tests focused
5. **Use descriptive names** - Makes purpose clear

## Best Practices

### Test Organization

- ✅ One user flow per test file
- ✅ Use descriptive file names (e.g., `recording-flow-mock-auth-error.yaml`)
- ✅ Group related tests with naming patterns
- ✅ Keep tests independent (no shared state)

### Writing Reliable Tests

- ✅ Always use `launchApp` to start fresh
- ✅ Add waits for animations: `waitForAnimationToEnd`
- ✅ Use specific text/IDs in assertions
- ✅ Test both happy paths and error scenarios
- ✅ Keep tests fast (< 60 seconds each)

### When to Use Each Approach

**Use Mock API for:**

- ✅ Local development
- ✅ Fast feedback loops
- ✅ Error scenario testing
- ✅ Pull request validation

**Use Real API for:**

- ✅ Pre-release validation
- ✅ Integration testing
- ✅ Performance testing
- ✅ Production readiness checks

## Building for Tests

### Local Builds

```bash
# iOS development build
pnpm build:dev:ios

# Android development build
pnpm build:dev:android
```

### EAS Cloud Builds

The development profile is configured in `eas.json`:

```json
{
  "build": {
    "development": {
      "distribution": "internal",
      "developmentClient": true
    }
  }
}
```

## TestFlight Deployment (iOS)

TestFlight is Apple's platform for distributing beta versions of your iOS app to testers before releasing to the App Store.

### Prerequisites

**Important:** TestFlight requires an **Apple Developer Program membership** (1,050 SEK/year or $99/year per account).

- **Apple Developer Account** - Paid membership (1,050 SEK/year or $99/year)
- **App Store Connect** access
- **Bundle Identifier** registered in your Apple Developer account
- **EAS CLI** installed and configured

**Note:** Unlike Android (which allows free internal testing), iOS beta testing through TestFlight requires this paid membership. There is no free alternative for distributing iOS test builds to external testers.

### Building for TestFlight

Use the preview profile to create TestFlight-compatible builds:

```bash
# Build for TestFlight
pnpm build:preview:ios

# Or directly with EAS
eas build --profile preview --platform ios
```

The preview profile is configured in `eas.json` to automatically submit to TestFlight after a successful build.

### Automatic Submission to TestFlight

To enable automatic submission after builds:

**1. Configure Apple credentials in EAS:**

```bash
eas secret:create --scope project --name APPLE_ID --value "your-apple-id@example.com"
eas secret:create --scope project --name ASC_APP_ID --value "your-app-id"
eas secret:create --scope project --name APPLE_TEAM_ID --value "ABCD123456"
```

**2. Update `eas.json` to include auto-submit:**

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "autoSubmit": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**3. Build and submit:**

```bash
pnpm build:preview:ios
```

EAS will automatically:

1. Build your app
2. Upload to App Store Connect
3. Submit to TestFlight
4. Make it available to your testers (after Apple's automated review)

### Manual Submission to TestFlight

If you prefer manual submission:

```bash
# 1. Build the app
pnpm build:preview:ios

# 2. Submit to TestFlight manually
eas submit --platform ios --latest
```

### Adding TestFlight Testers

**In App Store Connect:**

1. Go to **App Store Connect** → Your App → **TestFlight**
2. Click **Internal Testing** or **External Testing**
3. Click the **+** button to add testers
4. Enter email addresses of your testers
5. They'll receive an invitation email with instructions

**Internal Testing** (up to 100 testers):

- Immediate distribution
- No Apple review required
- Best for your team and close collaborators

**External Testing** (up to 10,000 testers):

- Requires Apple review (usually 24-48 hours)
- Can be used for public beta testing
- More comprehensive testing audience

### Testing the TestFlight Build

After testers receive the invitation:

1. They install the **TestFlight app** from the App Store
2. Accept the invitation in the TestFlight app
3. Install and test your app
4. Provide feedback through TestFlight

### Cost Considerations

- **Apple Developer Program**: 1,050 SEK/year ($99/year) - required
- **EAS builds**: Free tier includes limited builds/month
- **TestFlight**: Free once you have Apple Developer membership

**Budget-Friendly Alternative for Development:**

- Use development builds (`pnpm build:dev:ios`) for local testing
- These can be installed directly without TestFlight
- Only use TestFlight/preview builds when you need to distribute to external testers

## Running on GitHub Actions

### Trigger E2E Test Workflow

**Via CLI:**

```bash
gh workflow run "E2E Test" \
  -f platform=android \
  -f build_mode=new \
  -f use_mock=true
```

**Via GitHub UI:** Actions → E2E Test → Run workflow

### Workflow Parameters

- `platform`: `ios` or `android`
- `build_mode`: `new` (create fresh build) or `existing` (use existing fingerprint)
- `use_mock`: `true` (mock API) or `false` (real API)
- `fingerprint`: Required if `build_mode=existing`

### GitHub Secrets Setup

Configure in **Settings → Secrets → Actions**:

| Secret                       | Description          | Required For |
| ---------------------------- | -------------------- | ------------ |
| `EXPO_TOKEN`                 | Expo authentication  | EAS builds   |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project ID       | EAS builds   |
| `BIRDNET_API_URL_<ENV>`      | BirdNET API endpoint | Real API     |
| `BIRDNET_API_KEY_<ENV>`      | BirdNET API key      | Real API     |

**Get Expo Token:**

```bash
npx eas login
npx eas whoami --json  # Copy "authToken" value
```

## Troubleshooting

### Common Issues

**App doesn't launch:**

- Verify `appId` matches bundle identifier in `app.config.js`
- Ensure app is installed on simulator/emulator
- Try rebuilding: `pnpm build:dev:ios` or `pnpm build:dev:android`

**Elements not found:**

- Check exact text strings in components
- Use accessibility labels or testID props
- Inspect app with: `maestro studio`

**Flaky tests:**

- Add `waitForAnimationToEnd` after navigation
- Use explicit waits: `wait: 1000`
- Verify timing-dependent assertions

**Mock server not responding:**

- Ensure server is running: `cd test-server && pnpm start`
- Check server logs for errors
- Test endpoint: `curl http://localhost:3000/health`

**Error tests failing:**

- Verify error messages match `src/utils/birdnetService.ts`
- Check mock server scenarios in `test-server/mock-api.js`
- Ensure app displays user-friendly error messages

### Debugging Tools

**Maestro Studio (Interactive Mode):**

```bash
maestro studio
# Explore app interactively
# View element hierarchy
# Test commands in real-time
```

**Verbose Output:**

```bash
# Run with debug logging
maestro test .maestro/navigation.yaml --debug

# Record test run
maestro test .maestro/navigation.yaml --record
```

**Debug Mock Server:**

```bash
# Check server health
curl http://localhost:3000/health

# Test scenario
curl -X POST http://localhost:3000/identify-bird?scenario=auth_error \
  -H "Content-Type: application/json" \
  -d '{"audio": "test"}'
```

### Maestro CLI Issues

```bash
# Reinstall Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Check version
maestro --version

# Verify Java is installed
java -version
```

### EAS Build Failures

- Check GitHub Actions logs for detailed errors
- Verify Expo token: `eas whoami`
- Ensure EAS project ID is correct in secrets
- Check build quota: `eas build:list`

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Command Reference](https://maestro.mobile.dev/api-reference/commands)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
