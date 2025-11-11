#!/bin/bash

# Build and push real application Docker images to ECR
# Usage: ./build-and-push-images.sh [environment] [region] [aws-profile]
#
# Environment variables (optional):
#   BIRDNET_ENV - Environment name (dev, staging, prod)
#   AWS_REGION  - AWS region (default: eu-north-1)
#   AWS_PROFILE - AWS CLI profile to use

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env file if it exists
if [ -f "$SCRIPT_DIR/../.env" ]; then
  echo "Loading configuration from .env file..."
  export $(grep -v '^#' "$SCRIPT_DIR/../.env" | xargs)
fi

# Priority: CLI arg > ENV var > default
ENVIRONMENT="${1:-${BIRDNET_ENV:-dev}}"
REGION="${2:-${AWS_REGION:-eu-north-1}}"
AWS_PROFILE="${3:-${AWS_PROFILE:-}}"

echo "🐳 Building and Pushing Lambda Container Images..."
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Get ECR repository URLs from Terraform (works with both local and remote state)
echo "📋 Reading ECR repository URLs from Terraform state..."
ECR_MAIN=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
ECR_SETUP=$(terraform output -raw ecr_setup_repository_url 2>/dev/null || echo "")

if [ -z "$ECR_MAIN" ] || [ -z "$ECR_SETUP" ]; then
    echo "❌ ECR repositories not found. Run 'terraform apply' first"
    exit 1
fi

echo "✅ Main Lambda ECR: $ECR_MAIN"
echo "✅ Setup Lambda ECR: $ECR_SETUP"
echo ""

# Build AWS CLI commands with or without profile
if [ -n "$AWS_PROFILE" ]; then
    AWS_CMD="aws --profile $AWS_PROFILE"
    echo "Using AWS profile: $AWS_PROFILE"
else
    AWS_CMD="aws"
    echo "Using default AWS credentials"
fi

# Get AWS account ID
ACCOUNT_ID=$($AWS_CMD sts get-caller-identity --query Account --output text)

# Login to ECR
echo "🔐 Logging into ECR..."
$AWS_CMD ecr get-login-password --region "$REGION" | \
    docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

cd ../lambda

# Build and push Setup Lambda image
echo ""
echo "🔨 Building Setup Lambda image..."
DOCKER_BUILDKIT=0 docker build --platform linux/amd64 -f Dockerfile.setup -t birdnet-setup-lambda:latest .

SETUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "🏷️  Tagging Setup Lambda image..."
docker tag birdnet-setup-lambda:latest "$ECR_SETUP:latest"
docker tag birdnet-setup-lambda:latest "$ECR_SETUP:$SETUP_TIMESTAMP"

echo "📤 Pushing Setup Lambda image to ECR..."
docker push "$ECR_SETUP:latest"
docker push "$ECR_SETUP:$SETUP_TIMESTAMP"

# Build and push Main Lambda image
echo ""
echo "🔨 Building Main Lambda image..."
DOCKER_BUILDKIT=0 docker build --platform linux/amd64 -f Dockerfile -t birdnet-lambda:latest .

MAIN_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "🏷️  Tagging Main Lambda image..."
docker tag birdnet-lambda:latest "$ECR_MAIN:latest"
docker tag birdnet-lambda:latest "$ECR_MAIN:$MAIN_TIMESTAMP"

echo "📤 Pushing Main Lambda image to ECR..."
docker push "$ECR_MAIN:latest"
docker push "$ECR_MAIN:$MAIN_TIMESTAMP"

cd ..

echo ""
echo "✅ Both images pushed successfully!"
echo "Setup Lambda: $ECR_SETUP:latest"
echo "Main Lambda: $ECR_MAIN:latest"
