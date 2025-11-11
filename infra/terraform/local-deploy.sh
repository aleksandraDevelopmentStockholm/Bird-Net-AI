#!/bin/bash
set -e

# Local deployment helper script with placeholder image support
# Usage: ./local-deploy.sh [environment] [aws-profile-name]
#
# This script deploys infrastructure with automatic placeholder images,
# then optionally builds and pushes the real application images.
#
# Environment variables (optional):
#   BIRDNET_ENV - Environment name (dev, staging, prod)
#   AWS_PROFILE - AWS CLI profile to use
#   AWS_REGION  - AWS region (default: eu-north-1)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env file if it exists
if [ -f "$SCRIPT_DIR/../.env" ]; then
  echo "📋 Loading configuration from .env file..."
  export $(grep -v '^#' "$SCRIPT_DIR/../.env" | xargs)
  echo ""
fi

# Priority: CLI arg > ENV var > default
ENVIRONMENT="${1:-${BIRDNET_ENV:-dev}}"
AWS_PROFILE="${2:-${AWS_PROFILE:-}}"

echo "🚀 Local Deployment for $ENVIRONMENT environment"
echo ""

# Set AWS profile if provided
if [ -n "$AWS_PROFILE" ]; then
    echo "Using AWS profile: $AWS_PROFILE"
    export AWS_PROFILE="$AWS_PROFILE"
    PROFILE_ARG="-var aws_profile=$AWS_PROFILE"
else
    echo "Using default AWS credentials"
    PROFILE_ARG=""
fi

echo ""
echo "Step 1: Initialize Terraform"
terraform init -backend-config="key=${ENVIRONMENT}/terraform.tfstate"

echo ""
echo "Step 2: Terraform Plan"
terraform plan -var-file="${ENVIRONMENT}.tfvars" $PROFILE_ARG

echo ""
read -p "Do you want to apply these changes? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "Step 4: Terraform Apply (with automatic placeholder images)"
echo "         This will build and push placeholder images automatically"
terraform apply -var-file="${ENVIRONMENT}.tfvars" $PROFILE_ARG

echo ""
echo "✅ Infrastructure deployed with placeholder images!"
echo ""
read -p "Do you want to build and deploy the real application images now? (yes/no): " BUILD_REAL

if [ "$BUILD_REAL" = "yes" ]; then
    echo ""
    echo "Step 5: Build and Push Real Docker Images"
    ./build-and-push-images.sh "$ENVIRONMENT" eu-north-1 "$AWS_PROFILE"

    echo ""
    echo "Step 6: Update Lambda Functions with Real Images"
    ECR_MAIN=$(terraform output -raw ecr_repository_url)
    ECR_SETUP=$(terraform output -raw ecr_setup_repository_url)

    aws lambda update-function-code \
      --function-name birdnet-efs-setup-$ENVIRONMENT \
      --image-uri "$ECR_SETUP:latest" \
      ${AWS_PROFILE:+--profile $AWS_PROFILE}

    aws lambda update-function-code \
      --function-name birdnet-api-$ENVIRONMENT \
      --image-uri "$ECR_MAIN:latest" \
      ${AWS_PROFILE:+--profile $AWS_PROFILE}

    echo "✅ Lambda functions updated with real images!"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Upload model files:"
echo "   BUCKET=\$(terraform output -raw model_bucket_name)"
echo "   aws s3 sync ../model-data/model/ s3://\$BUCKET/model-data/model/"
echo ""
echo "2. Trigger EFS setup:"
echo "   aws lambda invoke --function-name birdnet-efs-setup-$ENVIRONMENT \\"
echo "     --cli-binary-format raw-in-base64-out \\"
echo "     --payload '{\"RequestType\":\"Create\"}' /tmp/response.json"
echo ""
echo "3. Test the API:"
echo "   API_URL=\$(terraform output -raw api_url)"
echo "   curl \$API_URL/health"
