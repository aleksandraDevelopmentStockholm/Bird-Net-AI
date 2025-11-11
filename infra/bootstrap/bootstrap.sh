#!/bin/bash
# Terraform Bootstrap Script
# Creates S3 bucket and DynamoDB table for Terraform state management
# Run this ONCE per AWS account before using the main Terraform configuration

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGION="${1:-eu-north-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Terraform Backend Bootstrap                      ║${NC}"
echo -e "${BLUE}║     Creates S3 bucket and DynamoDB table             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ Error: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Error: Terraform is not installed${NC}"
    echo "Install it from: https://www.terraform.io/downloads"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Error: AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "$REGION")

echo -e "${GREEN}✅ AWS Account: ${ACCOUNT_ID}${NC}"
echo -e "${GREEN}✅ Region: ${AWS_REGION}${NC}"
echo ""

# Confirmation prompt
echo -e "${YELLOW}⚠️  This will create:${NC}"
echo "   • S3 Bucket: birdnet-terraform-state-${ACCOUNT_ID}"
echo "   • DynamoDB Table: birdnet-terraform-locks"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Bootstrap cancelled${NC}"
    exit 0
fi

# Change to bootstrap directory
cd "$SCRIPT_DIR"

# Initialize Terraform (using local backend)
echo -e "${BLUE}📦 Initializing Terraform...${NC}"
terraform init

# Plan the changes
echo -e "${BLUE}📋 Planning bootstrap resources...${NC}"
terraform plan -var="region=${AWS_REGION}"

# Apply confirmation
echo ""
read -p "Apply these changes? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Bootstrap cancelled${NC}"
    exit 0
fi

# Apply the configuration
echo -e "${BLUE}🚀 Creating backend resources...${NC}"
terraform apply -auto-approve -var="region=${AWS_REGION}"

# Display outputs
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Bootstrap Complete!                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
terraform output -raw backend_config

echo -e "${BLUE}💾 Bootstrap state saved locally at:${NC}"
echo "   ${SCRIPT_DIR}/terraform.tfstate"
echo ""
echo -e "${YELLOW}⚠️  Keep this state file safe! It tracks your backend resources.${NC}"
echo ""
