# AWS Provider Configuration
# Configures the AWS provider with region and optional profile settings
#
# Authentication methods (in order of precedence):
#   1. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
#   2. AWS profile specified via aws_profile variable
#   3. Default AWS CLI profile (~/.aws/credentials)

provider "aws" {
  region = "eu-north-1"
  # Only set profile if explicitly provided via TF_VAR_aws_profile or -var
  # Otherwise uses environment variables (AWS_ACCESS_KEY_ID) or default profile
  profile = var.aws_profile
}
