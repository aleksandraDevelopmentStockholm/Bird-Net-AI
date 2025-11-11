# BirdNET Infrastructure

This directory contains all infrastructure code for deploying BirdNET to AWS.

## Quick Start

### 1. Setup Environment Configuration (Optional but Recommended)

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
BIRDNET_ENV=dev
AWS_REGION=eu-north-1
# AWS_PROFILE=your-profile-name  # Uncomment if using named AWS profiles
```

**Benefits of using `.env`:**

- No need to pass environment/region to every script
- Consistent configuration across all scripts
- Easy to switch between environments
- CLI arguments still override if needed

### 2. Deploy Infrastructure

```bash
cd terraform
./local-deploy.sh  # Uses .env values or defaults to dev
```

Or without `.env`:

```bash
cd terraform
./local-deploy.sh dev  # Explicitly specify environment
```

## Configuration Priority

All scripts follow this priority order:

1. **CLI Arguments** (highest priority)
2. **Environment Variables** (from `.env` or shell)
3. **Defaults** (safest fallback - usually `dev`)

Example:

```bash
# Uses dev from .env (if set), otherwise defaults to dev
./upload-models-to-s3.sh

# Overrides .env and uses prod
./upload-models-to-s3.sh prod

# Uses BIRDNET_ENV from shell environment
export BIRDNET_ENV=staging
./upload-models-to-s3.sh
```

## Directory Structure

```
infra/
├── .env.example          # Template for local configuration
├── .env                  # Your local config (git-ignored)
├── lambda/               # Lambda function source code
│   ├── Dockerfile        # Main Lambda image
│   ├── Dockerfile.setup  # Setup Lambda image
│   └── Dockerfile.placeholder  # Bootstrap placeholder
├── model-data/           # BirdNET model files
├── terraform/            # Terraform infrastructure code
│   ├── *.tf             # Terraform configuration files
│   ├── local-deploy.sh  # Interactive deployment script
│   └── build-and-push-images.sh  # Build real application images
└── upload-models-to-s3.sh  # Model upload utility
```

## Scripts

### `terraform/local-deploy.sh`

Interactive deployment script with automatic placeholder images.

```bash
# Uses .env configuration
./local-deploy.sh

# Override with CLI args
./local-deploy.sh prod my-aws-profile
```

### `terraform/build-and-push-images.sh`

Builds and pushes real application Docker images to ECR.

```bash
# Uses .env configuration
./build-and-push-images.sh

# Override with CLI args
./build-and-push-images.sh dev eu-north-1 my-profile
```

### `upload-models-to-s3.sh`

Uploads BirdNET model files to S3.

```bash
# Uses .env configuration
./upload-models-to-s3.sh

# Override with CLI args
./upload-models-to-s3.sh prod
```

## Environment Variables

| Variable      | Description                         | Default      |
| ------------- | ----------------------------------- | ------------ |
| `BIRDNET_ENV` | Environment name (dev/staging/prod) | `dev`        |
| `AWS_REGION`  | AWS region                          | `eu-north-1` |
| `AWS_PROFILE` | AWS CLI profile name                | _(none)_     |

## More Documentation

See `terraform/README.md` for detailed Terraform documentation, including:

- Infrastructure architecture
- VPC configuration
- Placeholder image system
- Deployment workflows
- Troubleshooting

## CI/CD with GitHub Actions

GitHub Actions workflows in `.github/workflows/` handle automated deployments.
The placeholder image system allows infrastructure and application code to be deployed independently.

### Available Workflows

| Workflow                    | Purpose                                                           | When to Use                                                       |
| --------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Deploy Dev Infrastructure` | Deploy/update AWS infrastructure (VPC, Lambda, API Gateway, etc.) | First-time setup or infrastructure changes                        |
| `Deploy Lambda (Dev)`       | Build and deploy application Docker images                        | After code changes to Lambda functions                            |
| `Upload Models (Dev)`       | Upload model files to S3 and setup EFS                            | After infrastructure is deployed (one-time or when models update) |

### Deployment Order (First Time)

1. **Deploy Infrastructure** → Creates AWS resources with placeholder Lambda images
2. **Deploy Lambda** → Replaces placeholder images with real application code
3. **Upload Models** → Uploads models to S3 and copies to EFS for Lambda access
4. **Test API** → Verify deployment works

### Subsequent Updates

**Code changes only:**

```bash
# Run "Deploy Lambda (Dev)" workflow
# Tests automatically via GitHub Actions
```

**Infrastructure changes:**

```bash
# Run "Deploy Dev Infrastructure" workflow
# Optionally run "Deploy Lambda (Dev)" if Lambda config changed
```

**Model updates:**

```bash
# Run "Upload Models (Dev)" workflow
```

### Local vs GitHub Actions

**Local deployment** (`./local-deploy.sh`):

- Interactive with prompts
- Good for development and testing
- Requires local Docker and AWS credentials
- Builds placeholder images locally

**GitHub Actions**:

- Automated and reproducible
- Good for team environments
- Builds images in CI/CD environment
- Can require approval gates for production

For detailed GitHub Actions setup, see [`.github/workflows/SETUP.md`](../.github/workflows/SETUP.md).
