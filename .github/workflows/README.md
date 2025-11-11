# BirdNet CI/CD Workflows

GitHub Actions workflows for automating BirdNet mobile app builds and end-to-end testing.

## Prerequisites

To use these workflows, ensure you have:

- **GitHub Account** with repository access
- **Expo Account** - Sign up at [expo.dev](https://expo.dev)
- **EAS CLI** installed locally - `npm install -g eas-cli`
- **GitHub Secrets configured** - See [Setup](#initial-setup)

**For E2E testing:**

- **Maestro Cloud** access (or local Maestro setup)
- **Mock API server** configured in `test-server/`

## Available Workflows

### 1. **App Build** (`app-build.yml`)

Builds mobile app for iOS and/or Android using Expo Application Services (EAS).

**Triggers:** Manual dispatch only

**What it does:**

- Builds app with specified profile (development/preview/production)
- Dynamic secret selection based on profile
- Posts build summary with configuration details

**Parameters:**

- `profile`: development/preview/production
- `platform`: all/ios/android

**Usage:**

```bash
# Preview build for all platforms
gh workflow run "App Build" -f profile=preview -f platform=all

# Production iOS build
gh workflow run "App Build" -f profile=production -f platform=ios

# Development build for testing
gh workflow run "App Build" -f profile=development -f platform=android
```

**Profile differences:**

- `development`: Uses dev secrets (`BIRDNET_API_URL_DEV`)
- `preview`: Uses dev secrets, suitable for testing
- `production`: Uses prod secrets (`BIRDNET_API_URL`)

---

### 2. **E2E Test** (`e2e-test.yml`)

Runs end-to-end tests on iOS or Android using Maestro.

**Triggers:** Manual dispatch only

**What it does:**

- Downloads or builds app based on `build_mode`
- Sets up iOS Simulator or Android Emulator
- Starts mock BirdNET API server
- Runs Maestro E2E tests
- Uploads test results

**Parameters:**

- `platform`: ios/android
- `build_mode`: existing/new
- `fingerprint`: Build fingerprint (required for existing mode)

**Usage:**

```bash
# Test existing Android build
gh workflow run "E2E Test" \
  -f platform=android \
  -f build_mode=existing \
  -f fingerprint="abc123..."

# Build and test iOS
gh workflow run "E2E Test" \
  -f platform=ios \
  -f build_mode=new
```

---

## Initial Setup

### Step 1: Add GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

#### Required Secrets

| Secret Name                  | Description               | Where to get it                          |
| ---------------------------- | ------------------------- | ---------------------------------------- |
| `EXPO_TOKEN`                 | Expo authentication token | `npx eas login && npx eas whoami --json` |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project ID            | From `app.json` or Expo dashboard        |

#### Environment-Specific Secrets

| Secret Name           | Environment | Description       |
| --------------------- | ----------- | ----------------- |
| `BIRDNET_API_URL_DEV` | Development | Dev API endpoint  |
| `BIRDNET_API_KEY_DEV` | Development | Dev API key       |
| `BIRDNET_API_URL`     | Production  | Prod API endpoint |
| `BIRDNET_API_KEY`     | Production  | Prod API key      |

**To get Expo Token:**

```bash
npx eas login
npx eas whoami --json
# Copy the value from the "authToken" field
```

---

### Step 2: Test the Setup

Run a test build to verify everything works:

```bash
# Quick preview build
gh workflow run "App Build" -f profile=preview -f platform=all

# Monitor the workflow
gh run watch
```

---

## Workflow Examples

### Building Apps

**Development build (for testing):**

```bash
gh workflow run "App Build" -f profile=development -f platform=all
```

**Preview build (for stakeholders):**

```bash
gh workflow run "App Build" -f profile=preview -f platform=ios
```

**Production build (for app stores):**

```bash
gh workflow run "App Build" -f profile=production -f platform=all
```

### Running Tests

**Test latest build:**

```bash
# Get the latest build fingerprint
eas build:list --platform=android --limit=1

# Run tests
gh workflow run "E2E Test" \
  -f platform=android \
  -f build_mode=existing \
  -f fingerprint="<fingerprint-from-above>"
```

**Build and test in one go:**

```bash
gh workflow run "E2E Test" \
  -f platform=ios \
  -f build_mode=new
```

---

## Monitoring

### View Workflow Status

**Via GitHub CLI:**

```bash
# List recent runs
gh run list --workflow="App Build"

# Watch a running workflow
gh run watch

# View logs
gh run view <run-id> --log
```

**Via GitHub UI:**

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. Click on a specific run to see details

### Build Results

After a successful build:

- Build URLs are posted in workflow summary
- Download links expire after 30 days
- Install on device via Expo Go or direct install

---

## Troubleshooting

### App Build Workflows

#### Build Failed on EAS

**Check:**

1. `EXPO_TOKEN` secret is valid and not expired
2. `EXPO_PUBLIC_EAS_PROJECT_ID` matches your project
3. Build profile exists in `eas.json`
4. No syntax errors in `app.json` or `app.config.js`

**View detailed build logs:**

```bash
eas build:list --platform=ios
eas build:view <build-id>
```

#### Wrong API URL Used

The workflow automatically selects secrets based on profile:

- `development`/`preview` → `BIRDNET_API_URL_DEV`
- `production` → `BIRDNET_API_URL`

**Verify in build summary:**
The workflow posts which environment secrets were used.

### E2E Test Workflows

#### Emulator Won't Boot

**Android:**

```bash
# List available emulators
emulator -list-avds

# Check Android SDK installation
sdkmanager --list
```

**iOS:**

```bash
# List available simulators
xcrun simctl list devices available

# Boot specific simulator
xcrun simctl boot <device-udid>
```

#### Mock Server Not Ready

The workflow waits 30 seconds for the mock server to start.

**Check:**

1. `test-server/` dependencies are listed in package.json
2. Port 3001 is not in use
3. Server logs for startup errors

#### Tests Fail on Device

**Common causes:**

1. App not installed correctly
2. Mock server not accessible from emulator
3. Maestro test files have errors

**Debug locally:**

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run tests locally
cd .maestro
maestro test recording-flow-mock-success.yaml
```

---

## Security Best Practices

### Secrets Management

✅ **DO:**

- Use GitHub Secrets for all credentials
- Rotate `EXPO_TOKEN` regularly
- Use separate API keys for dev/staging/prod
- Review workflow runs for exposed secrets

❌ **DON'T:**

- Commit credentials to git
- Share `EXPO_TOKEN` publicly
- Log sensitive values in workflow output
- Use production secrets in development builds

### Build Security

✅ **Recommendations:**

- Enable branch protection on `main`
- Require PR reviews before merging
- Use signed commits for production builds
- Audit workflow changes before merging

---

## Local Development

You can still build and test locally without GitHub Actions:

### Local Builds

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build locally
eas build --profile preview --platform all --local
```

### Local Testing

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Start mock server
cd test-server && pnpm start

# Run tests (in another terminal)
cd .maestro
maestro test recording-flow-mock-success.yaml
```

---

## Additional Resources

- **Testing Guide:** [`../../docs/TESTING.md`](../../docs/TESTING.md)
- **App Versioning:** See main README - [App Versioning section](../../README.md#app-versioning)
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Maestro Docs:** https://maestro.mobile.dev/

---

## Need Help?

**Common questions:**

1. **"Which build profile should I use?"**
   - Development: For local testing
   - Preview: For sharing with testers
   - Production: For app store submission

2. **"How do I get build URLs?"**
   - Check workflow summary in GitHub Actions
   - Or run: `eas build:list --platform=ios`

3. **"Can I trigger builds from pull requests?"**
   - Not automatically - workflows are manual only
   - This prevents accidental builds and reduces costs

4. **"How do I test without building?"**
   - Use `build_mode=existing` in E2E workflow
   - Much faster (~5 min vs ~15 min)

---

**Last updated:** 2025-10-31
