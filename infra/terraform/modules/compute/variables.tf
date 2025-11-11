# Compute Module Variables

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "region" {
  description = "AWS Region"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for Lambda functions"
  type        = list(string)
}

variable "lambda_security_group_id" {
  description = "Security group ID for Lambda functions"
  type        = string
}

variable "efs_access_point_arn" {
  description = "EFS Access Point ARN"
  type        = string
}

variable "model_bucket_name" {
  description = "S3 bucket name for models"
  type        = string
}

variable "model_bucket_arn" {
  description = "S3 bucket ARN for models"
  type        = string
}

variable "allowed_origin" {
  description = "CORS allowed origin"
  type        = string
}

variable "s3_vpc_endpoint_id" {
  description = "S3 VPC Endpoint ID (for Lambda dependencies)"
  type        = string
}
