# Storage Module Variables

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for EFS mount targets"
  type        = list(string)
}

variable "efs_security_group_id" {
  description = "Security group ID for EFS"
  type        = string
}

variable "create_vpc" {
  description = "Whether VPC was created (affects mount target count)"
  type        = bool
}

variable "existing_subnet_ids" {
  description = "Existing subnet IDs (if not creating VPC)"
  type        = list(string)
  default     = null
}
