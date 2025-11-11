# GitHub Actions - Reusable Composite Actions

This directory contains reusable composite actions for app build and testing workflows.

## Directory Structure

```
.github/actions/
├── setup-node-pnpm/           # Node.js + pnpm setup with caching
└── setup-expo-eas/            # Expo & EAS CLI setup
```

## Available Actions

### 📦 setup-node-pnpm

Configures Node.js, pnpm with caching, and installs dependencies.

**Inputs:**

- `node-version` (optional, default: `18`): Node.js version
- `pnpm-version` (optional, default: `9`): pnpm version
- `install-dependencies` (optional, default: `true`): Whether to install dependencies
- `enable-cache` (optional, default: `true`): Whether to enable pnpm cache
- `working-directory` (optional, default: `.`): Working directory for installation

**Example:**

```yaml
- name: Setup Node & pnpm
  uses: ./.github/actions/setup-node-pnpm

# Or with custom options:
- name: Setup Node & pnpm (no cache)
  uses: ./.github/actions/setup-node-pnpm
  with:
    enable-cache: false
```

---

### 🚀 setup-expo-eas

Configures Expo and EAS CLI with authentication.

**Inputs:**

- `expo-token` (required): Expo authentication token
- `eas-version` (optional, default: `latest`): EAS CLI version

**Example:**

```yaml
- name: Setup Expo & EAS
  uses: ./.github/actions/setup-expo-eas
  with:
    expo-token: ${{ secrets.EXPO_TOKEN }}
```

---

## Benefits of This Structure

### ✅ **DRY (Don't Repeat Yourself)**

- Eliminates duplicated setup code across workflows
- Single source of truth for Node.js, pnpm, and Expo configuration

### 🔒 **Consistency**

- Standardized versions and configurations across all builds
- Predictable CI/CD behavior

### 🚀 **Maintainability**

- Changes propagate to all workflows automatically
- Clear separation of concerns
- Self-documenting structure

---

## Workflow Examples

### App Build

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - uses: ./.github/actions/setup-expo-eas
        with:
          expo-token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --profile preview --platform all
```

### E2E Testing

```yaml
jobs:
  e2e-test:
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - uses: ./.github/actions/setup-expo-eas
        with:
          expo-token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build:download --platform android --fingerprint ${{ inputs.fingerprint }}
      - run: pnpm test:e2e:ci
```

---

## Testing Changes

Before using updated actions:

1. **Local validation:**

   ```bash
   # Validate action syntax
   yamllint .github/actions/*/action.yml
   ```

2. **Test in GitHub Actions:**
   - Trigger workflow manually via workflow_dispatch
   - Verify logs for each action step
   - Ensure builds complete successfully

---

## Contributing

When adding new actions:

1. Create new directory under `.github/actions/`
2. Add `action.yml` with clear inputs/outputs
3. Update this README with documentation
4. Test thoroughly in dev environment
5. Update workflows to use the new action

---

## Troubleshooting

### Action Not Found

```
Error: Can't find 'action.yml', 'action.yaml' or 'Dockerfile'
```

**Solution:** Ensure the action directory contains `action.yml` (not `action.yaml`)

### Permission Denied

```
Error: Resource not accessible by integration
```

**Solution:** Check that required secrets are configured:
- `EXPO_TOKEN` - for EAS CLI authentication
- `EXPO_PUBLIC_EAS_PROJECT_ID` - for project identification
- API credentials for your environment

### Build Failures

**Solution:**
- Verify all dependencies are in `package.json`
- Check that pnpm lockfile is committed
- Ensure EAS project is properly configured
- Review build logs in Expo dashboard
