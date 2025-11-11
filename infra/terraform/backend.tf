# Backend Configuration
# Stores Terraform state in S3 with DynamoDB locking to prevent concurrent modifications
# The state file path (key) is set during initialization via:
#   terraform init -backend-config="key=dev/terraform.tfstate"
#
# For different environments:
#   dev:     terraform init -backend-config="key=dev/terraform.tfstate"
#   staging: terraform init -backend-config="key=staging/terraform.tfstate"
#   prod:    terraform init -backend-config="key=prod/terraform.tfstate"

terraform {
  backend "s3" {
    bucket         = "birdnet-terraform-state-234495745033"
    region         = "eu-north-1"
    dynamodb_table = "birdnet-terraform-locks"
    encrypt        = true
    # key will be set per workspace: use -backend-config="key=dev/terraform.tfstate"
  }
}
