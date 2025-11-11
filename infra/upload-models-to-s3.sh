#!/bin/bash

# Upload BirdNET model files to S3
# This script uploads the model files required by the Lambda function
# Usage: ./upload-models-to-s3.sh [environment] [bucket-name]
#
# Environment variables (optional):
#   BIRDNET_ENV - Environment name (dev, staging, prod)
#   AWS_REGION  - AWS region (default: eu-north-1)

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env file if it exists
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo "Loading configuration from .env file..."
  export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Priority: CLI arg > ENV var > default to 'dev' (safest)
ENVIRONMENT="${1:-${BIRDNET_ENV:-dev}}"
BUCKET="${2:-}"
REGION="${AWS_REGION:-eu-north-1}"

MODEL_DIR="$SCRIPT_DIR/model-data/model"

# If bucket not provided, try to get it from Terraform
if [ -z "$BUCKET" ]; then
  cd "$SCRIPT_DIR/terraform"
  BUCKET=$(terraform output -raw model_bucket_name 2>/dev/null || echo "")
  cd "$SCRIPT_DIR"

  if [ -z "$BUCKET" ]; then
    echo "❌ Error: Could not determine S3 bucket name"
    echo "Usage: $0 [environment] [bucket-name]"
    echo "Or run from terraform directory where outputs are available"
    exit 1
  fi
fi

echo "🚀 Uploading BirdNET v2.4 model files to S3..."
echo "  Environment: $ENVIRONMENT"
echo "  Source: $MODEL_DIR"
echo "  Bucket: s3://$BUCKET"
echo ""

cd "$MODEL_DIR"

# Check if files exist
if [ ! -f "model.json" ] || [ ! -f "labels.json" ]; then
  echo "❌ Error: Model files not found in $MODEL_DIR"
  exit 1
fi

# Upload model JSON files
echo "📤 Uploading model.json..."
aws s3 cp model.json "s3://$BUCKET/models/model/model.json" --region "$REGION"

echo "📤 Uploading labels.json..."
aws s3 cp labels.json "s3://$BUCKET/models/model/labels.json" --region "$REGION"

# Upload binary shard files
echo "📤 Uploading binary shards..."
shard_count=0
for file in group1-shard*.bin; do
  if [ -f "$file" ]; then
    echo "  → $file"
    aws s3 cp "$file" "s3://$BUCKET/models/model/$file" --region "$REGION"
    ((shard_count++))
  fi
done

echo ""
echo "✅ Upload complete!"
echo "  Uploaded: 2 JSON files + $shard_count binary shards"
echo ""
echo "📋 Next step: Trigger EFS setup Lambda to copy files to EFS"
echo "  Run: aws lambda invoke --function-name birdnet-efs-setup-$ENVIRONMENT --region $REGION \\"
echo "    --cli-binary-format raw-in-base64-out \\"
echo "    --payload '{\"RequestType\":\"Create\"}' /tmp/response.json"
