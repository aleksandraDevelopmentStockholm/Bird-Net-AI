# Terraform Bootstrap

One-time setup that creates the S3 bucket and DynamoDB table for Terraform state management.

**Run once per AWS account** before deploying infrastructure. For complete documentation, see [../terraform/README.md](../terraform/README.md#step-1-bootstrap-backend-one-time-setup)

## Prerequisites

- **AWS CLI** configured: `aws configure`
- **Terraform** (v1.5+): [Download](https://www.terraform.io/downloads)
- **AWS Permissions**: S3 buckets, DynamoDB tables, bucket policies

## Quick Start

```bash
# Automated (recommended)
./bootstrap.sh

# Or manual
terraform init
terraform apply
```

## What Gets Created

| Resource       | Name                                   | Purpose                         | Cost      |
| -------------- | -------------------------------------- | ------------------------------- | --------- |
| S3 Bucket      | `birdnet-terraform-state-{account-id}` | Stores Terraform state          | ~$1/month |
| DynamoDB Table | `birdnet-terraform-locks`              | Prevents concurrent deployments | Included  |

## Next Steps

After bootstrap completes, deploy the infrastructure:

```bash
cd ../terraform
terraform init -backend-config="key=<environment>/terraform.tfstate"
terraform apply -var-file="<environment>.tfvars"

# Example for dev environment:
# terraform init -backend-config="key=dev/terraform.tfstate"
# terraform apply -var-file="dev.tfvars"
```

## Complete Guide

For detailed information including multi-account setup, troubleshooting, and state management, see: **[../terraform/README.md](../terraform/README.md)**
