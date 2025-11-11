# Bootstrap Outputs

output "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.id
}

output "state_bucket_arn" {
  description = "ARN of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.arn
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table for state locking"
  value       = aws_dynamodb_table.terraform_locks.id
}

output "backend_config" {
  description = "Backend configuration to use in your main Terraform config"
  value = <<-EOT

  ✅ Bootstrap Complete!

  Add this to your main Terraform configuration's backend block:

  terraform {
    backend "s3" {
      bucket         = "${aws_s3_bucket.terraform_state.id}"
      key            = "dev/terraform.tfstate"  # Change per environment
      region         = "${var.region}"
      dynamodb_table = "${aws_dynamodb_table.terraform_locks.id}"
      encrypt        = true
    }
  }

  Then initialize your main Terraform configuration:

  cd ../terraform
  terraform init -backend-config="key=dev/terraform.tfstate"

  EOT
}
