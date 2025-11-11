# Lambda Functions

This directory contains the Lambda function source code and Docker configurations for the BirdNET serverless backend.

## Overview

BirdNet uses **Docker container images** for Lambda functions, deployed via AWS ECR. This approach supports larger dependencies (like TensorFlow.js) that exceed Lambda's ZIP deployment limits.

## Files

### Lambda Function Source

- **`birdnet-handler.js`** - Main BirdNET API handler with TensorFlow inference
  - Handles `/health` and `/identify-bird` endpoints
  - Loads BirdNET models from EFS (`/mnt/efs`)
  - Performs bird identification using TensorFlow.js
  - ~1.5GB deployed size with dependencies

- **`setup-efs.js`** - EFS setup Lambda function
  - Copies models from S3 to EFS
  - Creates directory structure on EFS
  - Triggered automatically during Terraform deployment
  - ~100MB deployed size

### Docker Configurations

- **`Dockerfile`** - Production image for main BirdNET API
  - Node.js 22 on Amazon Linux 2023
  - Includes TensorFlow.js and audio processing dependencies
  - Uses Lambda Web Adapter for request handling

- **`Dockerfile.setup`** - Production image for EFS setup function
  - Lighter weight (~100MB)
  - AWS SDK for S3 operations
  - File system utilities

- **`Dockerfile.placeholder`** - Minimal placeholder image
  - Used for initial Terraform deployment
  - Returns "Placeholder Lambda" response
  - Replaced by real images after deployment
  - Allows Terraform to create Lambda functions before real code is ready

### Configuration

- **`package.json`** - Node.js dependencies
- **`pnpm-lock.yaml`** - Locked dependency versions
- **`.dockerignore`** - Files excluded from Docker builds

## Deployment Architecture

```
┌─────────────────┐
│   Terraform     │
└────────┬────────┘
         │ 1. Creates ECR repositories
         │ 2. Builds & pushes placeholder images
         │ 3. Creates Lambda functions
         ▼
┌─────────────────┐
│   ECR Repos     │
│  (placeholder)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lambda Functions│
│  (placeholder)  │
└─────────────────┘

Later (manual or CI/CD):
┌─────────────────┐
│ Build real      │
│ Docker images   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ECR Repos     │
│ (production)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lambda Functions│
│  (production)   │
└─────────────────┘
```

## Building Docker Images

### Manual Build (Development)

```bash
cd infra/terraform

# Build and push images for a specific environment
./build-and-push-images.sh <environment> <region>

# Examples:
# ./build-and-push-images.sh dev eu-north-1
# ./build-and-push-images.sh prod us-east-1
```

This script:

1. Authenticates Docker with ECR
2. Builds Docker images from `infra/lambda/`
3. Tags images with `:latest`
4. Pushes to ECR repositories

### Update Lambda Functions

After building new images, update the Lambda functions:

```bash
# Get ECR repository URLs from Terraform
cd infra/terraform
API_IMAGE=$(terraform output -raw ecr_repository_url)
SETUP_IMAGE=$(terraform output -raw ecr_setup_repository_url)

# Update Lambda functions
aws lambda update-function-code \
  --function-name birdnet-api-<environment> \
  --image-uri $API_IMAGE:latest

aws lambda update-function-code \
  --function-name birdnet-efs-setup-<environment> \
  --image-uri $SETUP_IMAGE:latest

# Wait for update to complete
aws lambda wait function-updated \
  --function-name birdnet-api-<environment>
```

**Note:** Terraform uses `lifecycle { ignore_changes = [image_uri] }`, so manual Lambda updates won't be reverted by Terraform.

## Dependencies

### Main API Handler (`birdnet-handler.js`)

- `@tensorflow/tfjs-node` - TensorFlow.js with Node.js bindings
- `@tensorflow/tfjs-converter` - Model loading
- `aws-sdk` - AWS service interactions (included in Lambda runtime)
- Node.js 22+ runtime

### EFS Setup (`setup-efs.js`)

- `aws-sdk` - S3 and CloudFormation SDK
- `fs`, `path` - File system operations
- Node.js 22+ runtime

## Model Files on EFS

The EFS setup Lambda copies these files from S3 to `/mnt/efs/`:

```
/mnt/efs/
├── models/
│   ├── model.json              # TensorFlow.js model definition
│   ├── group1-shard1of13.bin   # Model weights (13 shards)
│   ├── group1-shard2of13.bin
│   ├── ...
│   ├── group1-shard13of13.bin
│   ├── labels.json             # Bird species labels
│   └── mdata/                  # Metadata model files
│       ├── model.json
│       └── group1-shard*.bin (8 shards)
```

## API Endpoints

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "modelLoaded": true
}
```

### POST /identify-bird

Analyze audio and identify bird species.

**Request:**

```json
{
  "audio": "base64-encoded-audio-data",
  "sampleRate": 48000,
  "confidenceThreshold": 0.1
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "species": "Turdus merula",
      "commonName": "Common Blackbird",
      "confidence": 0.87,
      "timestamp": 1234567890
    }
  ]
}
```

## Environment Variables

Lambda functions use these environment variables:

### Main API (`birdnet-api-<env>`)

- `ALLOWED_ORIGIN` - CORS allowed origin
- `ENVIRONMENT` - Environment name (dev, staging, prod)

### EFS Setup (`birdnet-efs-setup-<env>`)

- `MODEL_BUCKET_NAME` - S3 bucket containing model files

## Local Testing

### Test EFS Setup Function

```bash
cd infra/lambda

# Install dependencies
pnpm install

# Run setup function locally
node setup-efs.js
```

### Test Main API Function

```bash
cd infra/lambda

# Install dependencies
pnpm install

# Test with sample audio
node -e 'require("./birdnet-handler.js").handler({
  httpMethod: "GET",
  path: "/health"
})'
```

## Viewing Logs

Lambda functions automatically send logs to CloudWatch Logs. Here's how to view them:

### CloudWatch Log Groups

Each Lambda function has its own log group:

- **Main API**: `/aws/lambda/birdnet-api-<environment>`
- **EFS Setup**: `/aws/lambda/birdnet-efs-setup-<environment>`

### View Recent Logs (AWS CLI)

**Tail logs in real-time:**

```bash
# Main API logs
aws logs tail /aws/lambda/birdnet-api-<environment> --follow

# EFS Setup logs
aws logs tail /aws/lambda/birdnet-efs-setup-<environment> --follow

# Tail logs since 10 minutes ago
aws logs tail /aws/lambda/birdnet-api-<environment> --since 10m --follow

# Tail logs since specific time
aws logs tail /aws/lambda/birdnet-api-<environment> --since 2024-01-01T00:00:00 --follow
```

**View logs without following:**

```bash
# Last 100 lines
aws logs tail /aws/lambda/birdnet-api-<environment>

# Last 50 lines
aws logs tail /aws/lambda/birdnet-api-<environment> -n 50

# Logs from the last hour
aws logs tail /aws/lambda/birdnet-api-<environment> --since 1h
```

### Filter Logs

**Filter by pattern:**

```bash
# Filter for errors
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "ERROR"

# Filter for specific request ID
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "abc-123-request-id"

# Filter for successful identifications
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "Bird identified"

# Filter for cold starts
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "INIT_START"
```

**Complex filters:**

```bash
# Show errors and warnings
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "?ERROR ?WARN"

# Show specific status codes
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "[..., status_code=500]"
```

### Search Log History

For searching older logs, use `filter-log-events`:

```bash
# Search last 24 hours
aws logs filter-log-events \
  --log-group-name /aws/lambda/birdnet-api-<environment> \
  --start-time $(date -u -d '24 hours ago' +%s)000 \
  --filter-pattern "ERROR"

# Search specific time range
aws logs filter-log-events \
  --log-group-name /aws/lambda/birdnet-api-<environment> \
  --start-time 1704067200000 \
  --end-time 1704153600000 \
  --filter-pattern "ERROR"

# Export to file
aws logs filter-log-events \
  --log-group-name /aws/lambda/birdnet-api-<environment> \
  --filter-pattern "ERROR" \
  > lambda-errors.json
```

### View Logs in AWS Console

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Navigate to **Logs** → **Log groups**
3. Click on `/aws/lambda/birdnet-api-<environment>`
4. Select a log stream (most recent is at the top)
5. View logs with timestamps

**Or use Lambda Console:**

1. Go to [Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click on your function (e.g., `birdnet-api-<environment>`)
3. Click **Monitor** tab
4. Click **View logs in CloudWatch**

### Understanding Log Structure

**Lambda execution logs include:**

```
START RequestId: abc-123-def-456 Version: $LATEST
2024-01-01T12:00:00.000Z  abc-123-def-456  INFO  Model loaded from /mnt/efs
2024-01-01T12:00:01.500Z  abc-123-def-456  INFO  Bird identified: Common Blackbird (0.87)
END RequestId: abc-123-def-456
REPORT RequestId: abc-123-def-456
  Duration: 1500.00 ms
  Billed Duration: 1500 ms
  Memory Size: 3008 MB
  Max Memory Used: 2456 MB
  Init Duration: 3000.00 ms  # Only on cold starts
```

### Common Log Patterns

**Cold start:**

```bash
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "INIT_START"
```

**Errors:**

```bash
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "ERROR"
```

**Long execution times:**

```bash
# Find executions over 5 seconds (5000ms)
aws logs filter-log-events \
  --log-group-name /aws/lambda/birdnet-api-<environment> \
  --filter-pattern "[..., duration>5000]"
```

**Memory usage:**

```bash
aws logs tail /aws/lambda/birdnet-api-<environment> --filter-pattern "REPORT"
```

**EFS mount issues:**

```bash
aws logs tail /aws/lambda/birdnet-efs-setup-<environment> --filter-pattern "ENOENT"
```

### Log Retention

By default, logs are retained according to CloudWatch settings. To check retention:

```bash
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/birdnet \
  --query 'logGroups[*].[logGroupName,retentionInDays]' \
  --output table
```

To change retention (via Terraform or AWS CLI):

```bash
# Set 30-day retention
aws logs put-retention-policy \
  --log-group-name /aws/lambda/birdnet-api-<environment> \
  --retention-in-days 30
```

### Export Logs

**Export to S3:**

```bash
# Create export task
aws logs create-export-task \
  --log-group-name /aws/lambda/birdnet-api-<environment> \
  --from $(date -u -d '7 days ago' +%s)000 \
  --to $(date -u +%s)000 \
  --destination s3://my-log-bucket/lambda-logs/ \
  --destination-prefix birdnet-api-<environment>
```

**Download logs locally:**

```bash
# Get last 1000 log events
aws logs get-log-events \
  --log-group-name /aws/lambda/birdnet-api-<environment> \
  --log-stream-name 2024/01/01/[$LATEST]abc123 \
  --limit 1000 \
  > lambda-logs.json
```

### CloudWatch Insights Queries

For advanced log analysis, use CloudWatch Insights:

```bash
# Open CloudWatch Insights
# Run this query:
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

**Query examples:**

```sql
-- Average execution duration
fields @duration
| stats avg(@duration), max(@duration), min(@duration)

-- Error rate over time
filter @type = "REPORT"
| stats count(@type) as invocations by bin(5m)

-- Cold start analysis
filter @type = "REPORT"
| fields @initDuration
| filter @initDuration > 0
| stats count() as coldStarts, avg(@initDuration) as avgColdStart
```

## Troubleshooting

### Image too large

If Docker images exceed ECR limits:

- Check `.dockerignore` is excluding unnecessary files
- Use multi-stage builds to reduce final image size
- Remove development dependencies in production

### Lambda timeout

If Lambda functions timeout:

- Check EFS mount is working: `ls /mnt/efs/models/`
- Verify models are copied to EFS (check CloudWatch logs)
- Increase Lambda timeout in Terraform (`timeout` parameter)

### Models not loading

If model loading fails:

1. Check EFS setup Lambda logs: `aws logs tail /aws/lambda/birdnet-efs-setup-<env>`
2. Verify models in S3: `aws s3 ls s3://birdnet-models-<env>-<account>/`
3. Check EFS mount targets are healthy in AWS Console
4. Manually trigger EFS setup:
   ```bash
   aws lambda invoke \
     --function-name birdnet-efs-setup-<env> \
     --payload '{"RequestType":"Create"}' \
     /tmp/response.json
   ```

### Container image errors

If Lambda can't pull ECR images:

- Verify IAM role has ECR permissions (defined in `modules/compute/main.tf`)
- Check ECR repository exists and has images: `aws ecr describe-images --repository-name birdnet-lambda-<env>`
- Ensure Lambda is in same region as ECR
