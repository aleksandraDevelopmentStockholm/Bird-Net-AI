# BirdNET Infrastructure

Complete deployment guide for BirdNET's AWS Lambda backend using Terraform with support for multiple environments.

## Prerequisites

Before deploying infrastructure, you need:

- ✅ **AWS Account** - See [AWS Account Setup](#aws-account-setup) below
- ✅ **AWS CLI configured** - See setup instructions below
- ✅ **Terraform** (v1.5+) - [Download](https://www.terraform.io/downloads)
- ✅ **Docker** - For building Lambda container images: [Download](https://www.docker.com/get-started)
- ✅ **Git** - Repository cloned locally

**Knowledge Prerequisites:**

- Basic understanding of AWS services (Lambda, S3, VPC)
- Familiarity with Terraform workflow (init, plan, apply)
- Command line/terminal usage

## AWS Account Setup

### 1. Create AWS Account

If you don't have an AWS account:

1. Go to [aws.amazon.com](https://aws.amazon.com) → **Create an AWS Account**
2. Follow the signup process (requires credit card)
3. Choose the **Free Tier** (12 months of free services)

**Cost:** ~$5-15/month for development after free tier. Set up billing alerts in AWS Console.

### 2. Install AWS CLI

**macOS:**

```bash
brew install awscli
```

**Linux:**

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Windows:**
Download from [AWS CLI MSI installer](https://awscli.amazonaws.com/AWSCLIV2.msi)

**Verify:**

```bash
aws --version  # Should show aws-cli/2.x.x
```

### 3. Create IAM User with Permissions

**Important:** Don't use root account credentials. Create a dedicated IAM user.

#### Option 1: Custom Policy (Recommended - Least Privilege)

Create a policy with only the required permissions for BirdNET:

1. Sign in to [AWS Console](https://console.aws.amazon.com)
2. Go to **IAM** → **Policies** → **Create policy**
3. Click **JSON** tab
4. Copy the contents from `infra/terraform/birdnet-deployer-policy.json` and paste it
5. Click **Next**
6. Policy name: `BirdNetDeployerPolicy`
7. Click **Create policy**

Now create the user:

1. Go to **IAM** → **Users** → **Create user**
2. Username: `birdnet-deployer`
3. Click **Next**
4. **Attach policies directly** → Search for `BirdNetDeployerPolicy`
5. Select it → Click **Next** → **Create user**

#### Option 2: AdministratorAccess (Quick Setup)

For quick setup, you can use full admin access:

1. Go to **IAM** → **Users** → **Create user**
2. Username: `birdnet-deployer`
3. Click **Next**
4. **Attach policies:** Select **AdministratorAccess**
5. Click **Next** → **Create user**

**Note:** Option 1 is more secure as it limits permissions to only what BirdNET needs.

### 4. Create Access Keys

1. Select your user in IAM
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Choose **Command Line Interface (CLI)**
5. Check the confirmation box → **Create access key**
6. **Save the credentials** (you won't see them again!)

### 5. Configure AWS CLI

```bash
aws configure --profile birdnet-<environment>

# Prompts:
# AWS Access Key ID: [paste from step 4]
# AWS Secret Access Key: [paste from step 4]
# Default region: eu-north-1  (or your preferred region)
# Default output format: json
```

**Verify:**

```bash
export AWS_PROFILE=birdnet-<environment>
aws sts get-caller-identity

# Should output your account details
```

### 6. Multiple Environments (Optional)

For multiple environments (dev, staging, prod):

```bash
# Configure separate profiles
aws configure --profile birdnet-dev
aws configure --profile birdnet-staging
aws configure --profile birdnet-prod

# Switch between them
export AWS_PROFILE=birdnet-dev
```

See [Environment Isolation](#environment-isolation--aws-workspaces) for details on managing multiple environments.

## 📋 Quick Links

- **App Workflows:** [../../.github/workflows/README.md](../../.github/workflows/README.md)
- **Bootstrap Only:** [../bootstrap/README.md](../bootstrap/README.md)
- **Testing Guide:** [../../.maestro/README.md](../../.maestro/README.md)
- **Main README:** [../../README.md](../../README.md) - Includes security and secrets management

## 🏗️ Architecture

```
┌──────────────────────┐
│   Bootstrap          │  ← One-time setup (creates S3 + DynamoDB)
│  (infra/bootstrap)   │
│                      │
│ Creates:             │
│ • S3 bucket          │
│ • DynamoDB table     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Main Terraform      │  ← Infrastructure deployment
│ (infra/terraform)    │
│                      │
│ Uses backend         │
│ created above        │
└──────────────────────┘
```

## 📁 Module Structure

This infrastructure is organized into **5 specialized modules** for better organization and reusability:

```
terraform/
├── modules/
│   ├── networking/        # VPC, subnets, security groups, VPC endpoints
│   ├── storage/          # S3 buckets, EFS filesystem, mount targets
│   ├── compute/          # ECR, Lambda functions, IAM roles
│   ├── api/              # API Gateway, endpoints, rate limiting
│   └── monitoring/       # CloudWatch dashboards and alarms
│
├── backend.tf            # S3 backend configuration
├── main.tf               # Orchestrates all modules
├── variables.tf          # Input variables
├── outputs.tf            # Exported values
├── moved.tf              # State migration mappings
└── <environment>.tfvars  # Environment-specific config (e.g., dev.tfvars, prod.tfvars)
```

### Module Benefits

- ✅ **Separation of Concerns** - Each module manages a specific infrastructure domain
- ✅ **Reusability** - Modules can be used across different environments
- ✅ **Clear Dependencies** - Module inputs/outputs make dependencies explicit
- ✅ **Easier Testing** - Test modules independently
- ✅ **Team Collaboration** - Different teams can own different modules

## 📊 Infrastructure Components

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   S3 Bucket │    │     EFS     │    │   Lambda    │
│   (Models)  │───▶│ (Fast Load) │───▶│  (Docker)   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                    ┌─────────────┐
                                    │ API Gateway │
                                    │   (REST)    │
                                    └─────────────┘
```

The BirdNET infrastructure is organized into **5 specialized modules**:

### Networking Module

- **VPC** - Isolated network (conditional creation based on `create_vpc`)
- **Subnets** - Multi-AZ private subnets for high availability
- **Security Groups** - Lambda and EFS access control
- **VPC Endpoints** - Private S3 access (reduces egress costs)
- **Internet Gateway** - For outbound traffic from Lambda
- **Route Tables** - Network routing configuration

### Storage Module

- **S3 Bucket** - Model file storage with lifecycle rules and versioning
- **EFS Filesystem** - Fast model loading and caching (shared across Lambda instances)
- **Mount Targets** - Multi-AZ EFS access points
- **Access Points** - EFS access configuration for Lambda

### Compute Module

- **ECR Repositories** - Docker image storage for Lambda containers
- **Lambda Functions**:
  - `birdnet-api-{env}` - Main bird identification API (~1.5GB with TensorFlow.js)
  - `birdnet-efs-setup-{env}` - EFS initialization and model sync (~100MB)
- **IAM Roles** - Least-privilege access policies
- **Placeholder Images** - Automatic bootstrapping for initial deployment
- **Lambda Layers** - Shared dependencies (if needed)

### API Module

- **API Gateway** - REST API with CORS support
- **Rate Limiting** - Throttling (5 req/sec for bird identification)
- **API Keys** - Authentication and quota management
- **Request Validation** - JSON schema validation for inputs
- **Usage Plans** - API key association and limits
- **Stage Configuration** - Deployment stages

### Monitoring Module

- **CloudWatch Dashboard** - Visual metrics and graphs (`BirdNET-API-{env}`)
- **CloudWatch Alarms** - Proactive alerting for:
  - High error rates (API & Lambda)
  - High request rates (potential DDoS attacks)
  - Long execution times (approaching 15min timeout)
  - EFS connection failures
- **Log Groups** - Centralized logging with retention policies
- **Metrics** - Custom metrics for application monitoring

## 🌍 Environment Isolation & AWS Workspaces

### Understanding Environments

Each environment (dev, staging, prod) gets:

- ✅ **Separate state file** in S3: `<environment>/terraform.tfstate`
- ✅ **Own AWS resources** (VPCs, Lambdas, EFS, etc.)
- ✅ **Own configuration file**: `<environment>.tfvars`
- ✅ **Independent deployments** - changes in one don't affect others
- ✅ **(Optional) Own AWS account** for complete isolation

### Switching Between AWS Accounts/Profiles

When working with multiple environments, you need to switch between AWS accounts or profiles. **Always verify which account you're using before deploying.**

#### Configure AWS Profiles

Set up multiple AWS profiles for different environments:

```bash
# Configure profiles for each environment
aws configure --profile birdnet-dev
aws configure --profile birdnet-staging
aws configure --profile birdnet-prod
```

You'll be prompted to enter:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `eu-north-1`)
- Default output format (e.g., `json`)

#### Switch Between Environments

**Method 1: Export AWS_PROFILE (Recommended)**

```bash
# Set profile for current terminal session
export AWS_PROFILE=birdnet-dev

# Verify you're using the correct account
aws sts get-caller-identity

# Deploy to dev
cd infra/terraform
terraform init -backend-config="key=dev/terraform.tfstate"
terraform apply -var-file="dev.tfvars"
```

**Method 2: Use --profile flag**

```bash
# Use profile per command
aws s3 ls --profile birdnet-prod
terraform apply -var-file="prod.tfvars"  # Uses AWS_PROFILE if set
```

**Method 3: Set AWS_DEFAULT_PROFILE**

```bash
export AWS_DEFAULT_PROFILE=birdnet-staging
```

#### Complete Workflow Example

```bash
# 1. Switch to dev environment
export AWS_PROFILE=birdnet-dev
aws sts get-caller-identity  # Verify account

# 2. Deploy to dev
cd infra/terraform
terraform init -backend-config="key=dev/terraform.tfstate"
terraform apply -var-file="dev.tfvars"

# 3. Switch to prod environment
export AWS_PROFILE=birdnet-prod
aws sts get-caller-identity  # Verify account

# 4. Deploy to prod
terraform init -backend-config="key=prod/terraform.tfstate"
terraform apply -var-file="prod.tfvars"
```

#### Best Practices

- ⚠️ **Always verify your AWS account** before deploying: `aws sts get-caller-identity`
- ✅ Use **clear, descriptive profile names** (e.g., `birdnet-dev`, `birdnet-prod`)
- ✅ **Set AWS_PROFILE at the start** of deployment scripts to prevent accidents
- ✅ Consider using **separate AWS accounts** for production (complete isolation)
- ✅ Use **AWS Organizations** to manage multiple accounts
- ✅ Add account verification to your deployment scripts:
  ```bash
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  echo "Deploying to AWS Account: $ACCOUNT_ID"
  read -p "Is this correct? (y/n) " -n 1 -r
  ```

## 🚀 Deployment Guide

This guide walks you through deploying the complete BirdNET infrastructure from scratch.

### Overview

The deployment process has **4 main steps**:

1. **Bootstrap** - Create Terraform backend (S3 + DynamoDB) - _one-time per AWS account_
2. **Deploy Infrastructure** - Create AWS resources (VPC, Lambda, EFS, API Gateway)
3. **Upload Models** - Copy bird identification models to S3
4. **Test Deployment** - Verify the API is working

### Network Setup

The deployment will create a new isolated VPC for your BirdNET infrastructure.

**What Terraform will create:**

- New isolated VPC with configurable CIDR block (default: `10.1.0.0/16`)
- 2 private subnets across different availability zones (for high availability)
- Internet Gateway and route tables (for Lambda internet access)
- Security groups and VPC endpoints
- All application resources (Lambda, EFS, S3, API Gateway, etc.)

**Configuration:** Ensure `create_vpc = true` in your `<environment>.tfvars` file (this is the default).

**Note:** If you have specific networking requirements or need to integrate with existing infrastructure, you can set `create_vpc = false` and provide your own VPC details, but this requires advanced AWS networking knowledge and is not covered in this guide.

### Environment Configuration

Before deploying, create your environment-specific configuration file:

**1. Copy the example file for your environment:**

```bash
# For development
cp dev.tfvars.example dev.tfvars

# For production
cp prod.tfvars.example prod.tfvars
```

**2. Review and customize the configuration:**

The example files contain sensible defaults for each environment:

- **Development** (`dev.tfvars`): Creates a new VPC with standard configuration
- **Production** (`prod.tfvars`): Configured for existing VPC (update VPC/subnet IDs)

**3. Update production values (if deploying to production):**

```bash
# Edit prod.tfvars and replace placeholder values:
existing_vpc_id     = "vpc-YOUR_ACTUAL_VPC_ID"
existing_subnet_ids = ["subnet-ID1", "subnet-ID2"]
allowed_origin      = "https://your-domain.com"
```

**Important:** The `.tfvars` files are git-ignored to protect your infrastructure configuration. Never commit them to version control.

### Step 1: Bootstrap Backend (One-Time Setup)

Bootstrap creates the S3 bucket and DynamoDB table that Terraform uses to store state and coordinate deployments.

**When to run:** Once per AWS account (dev, staging, prod)

**What gets created:**

- S3 bucket: `birdnet-terraform-state-{account-id}` (stores Terraform state)
- DynamoDB table: `birdnet-terraform-locks` (prevents concurrent deployments)

**Cost:** < $1/month

#### Run Bootstrap

```bash
cd infra/bootstrap
./bootstrap.sh
```

The script will verify your AWS credentials and create the backend resources.

<details>
<summary>Alternative: Manual bootstrap with Terraform</summary>

```bash
cd infra/bootstrap
terraform init
terraform plan
terraform apply
```

</details>

<details>
<summary>Bootstrapping multiple AWS accounts</summary>

If you're using separate AWS accounts for different environments:

```bash
# Environment 1
export AWS_PROFILE=<environment>-account
cd infra/bootstrap
./bootstrap.sh

# Environment 2
export AWS_PROFILE=<environment>-account
./bootstrap.sh
```

Each account gets its own state bucket and lock table.

</details>

### Step 2: Deploy Infrastructure

Now deploy the main infrastructure: VPC, Lambda, EFS, S3, API Gateway, and monitoring.

#### Configure Environment

First, review and customize your environment configuration:

```bash
cd infra/terraform
cat <environment>.tfvars
```

Key settings to review:

- `create_vpc` - Set to `true` to create a new VPC, or `false` to use existing
- `allowed_origin` - CORS origin for API (use `*` for development)
- `environment` - Environment name (e.g., dev, staging, prod)

#### Deploy

```bash
cd infra/terraform

# Initialize Terraform with backend
terraform init -backend-config="key=<environment>/terraform.tfstate"

# Preview what will be created
terraform plan -var-file="<environment>.tfvars"

# Deploy infrastructure
terraform apply -var-file="<environment>.tfvars"
```

**What gets created:**

- ✅ VPC and networking (if `create_vpc = true`)
- ✅ S3 bucket for model storage
- ✅ EFS filesystem for fast model loading
- ✅ ECR repositories for Lambda Docker images
- ✅ Lambda functions (with placeholder images)
- ✅ API Gateway with rate limiting
- ✅ CloudWatch dashboards and alarms

**Time:** ~10-15 minutes for full deployment

#### Save API Credentials

After deployment completes, save the API credentials:

```bash
# Get API endpoint
terraform output api_url

# Get API key (sensitive)
terraform output api_key
```

Add these to your app's `.env` file:

```bash
EXPO_PUBLIC_BIRDNET_API_URL="<api_url from terraform>"
EXPO_PUBLIC_BIRDNET_API_KEY="<api_key from terraform>"
```

### Step 3: Upload Models

Upload the bird identification models to S3:

```bash
cd infra
./upload-models-to-s3.sh <environment>
```

This script uploads model files from `infra/model-data/` to your S3 bucket.

The EFS setup Lambda will automatically copy models from S3 to EFS during the first deployment. If you need to trigger it manually:

```bash
aws lambda invoke \
  --function-name birdnet-efs-setup-<environment> \
  --cli-binary-format raw-in-base64-out \
  --payload '{"RequestType":"Create"}' \
  /tmp/setup-response.json

cat /tmp/setup-response.json
```

### Step 4: Test Deployment

Verify your deployment is working:

```bash
# Get API URL
API_URL=$(cd infra/terraform && terraform output -raw api_url)

# Health check
curl $API_URL/health

# Expected response:
# {"status":"ok","version":"1.0.0","modelLoaded":true}
```

If you see `"modelLoaded": false`, the models may still be copying to EFS. Wait a few minutes and try again.

For more comprehensive verification, see [Deployment Verification](#-deployment-verification).

### Step 5: Deploy Real Lambda Images

The initial deployment uses placeholder Lambda images. To deploy the real bird identification code:

```bash
cd infra

# Build and push Docker images
./build-and-push-images.sh <environment> <region>

# Update Lambda functions
aws lambda update-function-code \
  --function-name birdnet-efs-setup-<environment> \
  --image-uri $(cd terraform && terraform output -raw ecr_setup_repository_url):latest

aws lambda update-function-code \
  --function-name birdnet-api-<environment> \
  --image-uri $(cd terraform && terraform output -raw ecr_repository_url):latest

# Wait for update to complete
aws lambda wait function-updated \
  --function-name birdnet-api-<environment>
```

**Note:** Terraform uses `lifecycle { ignore_changes = [image_uri] }`, so it won't revert your image updates.

---

## 🔄 Updating Your Deployment

### When to Use Each Update Method

**Use Terraform (`terraform apply`)** for:

- ✅ Infrastructure changes (VPC, EFS, API Gateway config, etc.)
- ✅ Lambda configuration (memory, timeout, environment variables)
- ✅ Production deployments
- ✅ Any changes that need to be tracked in infrastructure-as-code

**Use Direct Lambda Update (`aws lambda update-function-code`)** for:

- ✅ Rapid code iteration during development
- ✅ Quick bug fixes without full infrastructure deployment
- ✅ Testing code changes before committing

### Update Infrastructure (Recommended)

**Use this for all infrastructure changes and production deployments:**

```bash
cd infra/terraform

# Edit configuration if needed
nano <environment>.tfvars

# Preview changes
terraform plan -var-file="<environment>.tfvars"

# Apply changes
terraform apply -var-file="<environment>.tfvars"
```

This is the **recommended approach** as it keeps your infrastructure state consistent and version-controlled.

### Update Lambda Code Only (Development Iteration)

**Use this for rapid code iteration during development:**

```bash
cd infra

# Build and push new Docker images
./build-and-push-images.sh <environment> <region>

# Update Lambda function directly
aws lambda update-function-code \
  --function-name birdnet-api-<environment> \
  --image-uri $(cd terraform && terraform output -raw ecr_repository_url):latest

# Wait for update to complete
aws lambda wait function-updated \
  --function-name birdnet-api-<environment>
```

**Important Notes:**

- ⚠️ This bypasses Terraform but is safe because the Lambda functions use `lifecycle { ignore_changes = [image_uri] }`
- ⚠️ Only use for code changes, not configuration changes
- ⚠️ For production deployments, prefer using Terraform or a proper CI/CD pipeline

### Update Models

To upload new model files:

```bash
cd infra
./upload-models-to-s3.sh <environment>

# Trigger EFS update
aws lambda invoke \
  --function-name birdnet-efs-setup-<environment> \
  --cli-binary-format raw-in-base64-out \
  --payload '{"RequestType":"Update"}' \
  /tmp/setup-response.json
```

## 🔧 Configuration Variables

### Core Variables

| Variable         | Description                         | Default |
| ---------------- | ----------------------------------- | ------- |
| `environment`    | Environment name (dev/staging/prod) | `dev`   |
| `allowed_origin` | CORS origin for API                 | `*`     |

### VPC Configuration

| Variable              | Description                                   | Default                          |
| --------------------- | --------------------------------------------- | -------------------------------- |
| `create_vpc`          | Create new VPC or use existing                | `false`                          |
| `vpc_cidr`            | CIDR block for new VPC                        | `10.0.0.0/16`                    |
| `availability_zones`  | AZs for subnets                               | `["eu-north-1a", "eu-north-1b"]` |
| `existing_vpc_id`     | Existing VPC ID (if `create_vpc = false`)     | -                                |
| `existing_subnet_ids` | Existing subnet IDs (if `create_vpc = false`) | -                                |

## 📤 Terraform Outputs

After deployment, access useful information:

```bash
terraform output api_url              # API Gateway endpoint
terraform output api_key              # API authentication key (sensitive)
terraform output model_bucket_name    # S3 bucket for models
terraform output efs_file_system_id   # EFS file system ID
terraform output ecr_repository_url   # ECR repo for main Lambda
```

## 🔐 Backend Configuration

The Terraform backend is configured to use S3 (created during bootstrap):

```hcl
terraform {
  backend "s3" {
    bucket         = "birdnet-terraform-state-{YOUR-ACCOUNT-ID}"
    region         = "eu-north-1"
    dynamodb_table = "birdnet-terraform-locks"
    encrypt        = true
    # key set per environment: dev/terraform.tfstate
  }
}
```

The `key` parameter is set during `terraform init`:

```bash
terraform init -backend-config="key=dev/terraform.tfstate"
```

## 📊 Deployment Verification

Check deployment status:

**Using Terraform:**

```bash
cd infra/terraform
terraform output
terraform show
```

**In AWS Console:**

- CloudWatch Dashboard: `BirdNET-API-{env}`
- API Gateway: Test endpoints
- Lambda: View function logs in CloudWatch

**Testing the API:**

```bash
API_URL=$(terraform output -raw api_url)

# Health check
curl $API_URL/health

# Should return: {"status":"ok","version":"1.0.0"}
```

## 📋 Monitoring & Logs

### CloudWatch Dashboard

After deployment, view your CloudWatch dashboard:

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Navigate to **Dashboards** → `BirdNET-API-<environment>`

The dashboard shows:

- API Gateway request count and latency
- Lambda invocations and errors
- Lambda duration and memory usage
- EFS connection metrics

### Viewing Lambda Logs

**Quick log access:**

```bash
# Tail main API logs in real-time
aws logs tail /aws/lambda/birdnet-api-<environment> --follow

# Tail EFS setup logs
aws logs tail /aws/lambda/birdnet-efs-setup-<environment> --follow

# View recent errors
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "ERROR"

# View logs from last hour
aws logs tail /aws/lambda/birdnet-api-<environment> --since 1h
```

**Common debugging commands:**

```bash
# Check if EFS setup completed successfully
aws logs filter-log-events \
  --log-group-name /aws/lambda/birdnet-efs-setup-<environment> \
  --filter-pattern "Models copied successfully"

# Check for cold starts
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "INIT_START"

# View Lambda performance metrics
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "REPORT"
```

### CloudWatch Alarms

The monitoring module creates alarms for:

- **High error rate** - Triggers when error rate exceeds threshold
- **High request rate** - Indicates potential DDoS or API abuse
- **Long execution times** - Lambda approaching timeout
- **EFS connection failures** - Model loading issues

**View alarms:**

```bash
# List all alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix "BirdNET-<environment>"

# Check alarm status
aws cloudwatch describe-alarms \
  --alarm-names "BirdNET-<environment>-api-errors"
```

### API Gateway Logs

API Gateway logs (if enabled) are in:

- Log group: `/aws/apigateway/birdnet-<environment>`

```bash
# View API Gateway logs
aws logs tail /aws/apigateway/birdnet-<environment> --follow
```

### Complete Logging Guide

For comprehensive logging documentation including:

- Filter patterns and search
- Log retention management
- Export to S3
- CloudWatch Insights queries

See: **[Lambda Functions README - Viewing Logs](../lambda/README.md#viewing-logs)**

## 🔄 Module Refactoring

The infrastructure is organized into modules for better organization and reusability.

### First Deployment After Refactoring

When you run Terraform for the first time after the module refactoring:

```bash
terraform plan  # Will show "has moved to module.X" messages
terraform apply # Migrates state, no infrastructure changes
```

This is safe and expected - Terraform is just updating internal state tracking to reflect the new module structure.

## 🆘 Troubleshooting

### Common Issues

**"Error acquiring state lock"**

**Cause:** Previous deployment didn't release the lock (crashed or cancelled)

**Fix:**

```bash
# Get lock ID from error message
terraform force-unlock <LOCK_ID>
```

**"Backend not initialized"**

**Cause:** Bootstrap hasn't been run for this AWS account

**Fix:**

```bash
cd ../bootstrap
./bootstrap.sh
```

**"Module not found"**

**Cause:** Terraform modules not initialized

**Fix:**

```bash
terraform init
```

**"VPC validation failed"**

**Fix:**

- Check `create_vpc` setting in your tfvars
- If `false`, ensure `existing_vpc_id` and `existing_subnet_ids` are set

### Debugging Tips

**View detailed logs:**

```bash
TF_LOG=DEBUG terraform plan
```

**Check AWS credentials:**

```bash
aws sts get-caller-identity
```

**Validate configuration:**

```bash
terraform validate
terraform fmt -check
```

## 🧹 Cleanup

To destroy an environment:

```bash
# Always verify which environment you're targeting
cd infra/terraform
terraform init -backend-config="key=<environment>/terraform.tfstate"

# Review what will be destroyed
terraform plan -destroy -var-file="<environment>.tfvars"

# Destroy infrastructure
terraform destroy -var-file="<environment>.tfvars"
```

**Important:**

- Each environment has isolated state
- VPC resources created by Terraform will be destroyed
- Existing VPCs won't be affected
- Always double-check the environment before destroying!

## 📝 Summary

| Task                              | Method                        | Frequency            |
| --------------------------------- | ----------------------------- | -------------------- |
| Create backend (S3/DynamoDB)      | Command line (`bootstrap.sh`) | Once per AWS account |
| Deploy infrastructure             | Terraform CLI                 | As needed            |
| Update Lambda code                | Docker + AWS CLI              | As needed            |
| Add new environment               | Bootstrap + tfvars            | Once per environment |
| State migration after refactoring | Automatic (moved blocks)      | Handled by first run |

## 📚 Additional Documentation

- **[birdnet-deployer-policy.json](birdnet-deployer-policy.json)** - Least-privilege IAM policy for deployment
- **[../bootstrap/README.md](../bootstrap/README.md)** - Bootstrap details only
- **[../../.github/workflows/README.md](../../.github/workflows/README.md)** - App build & test workflows
- **[../../.maestro/README.md](../../.maestro/README.md)** - E2E testing guide
- **[../../README.md#security--secrets-management](../../README.md#security--secrets-management)** - Security best practices

---

**Questions?** Check the docs above or open an issue in the repository.
