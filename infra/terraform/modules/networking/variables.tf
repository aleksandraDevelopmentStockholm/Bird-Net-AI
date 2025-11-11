# Networking Module Variables

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "create_vpc" {
  description = "Whether to create a new VPC or use existing infrastructure"
  type        = bool
}

variable "vpc_cidr" {
  description = "CIDR block for VPC (only used if create_vpc is true)"
  type        = string
}

variable "existing_vpc_id" {
  description = "Existing VPC ID to use (required if create_vpc is false)"
  type        = string
  default     = null
}

variable "existing_subnet_ids" {
  description = "Existing subnet IDs for Lambda and EFS (required if create_vpc is false)"
  type        = list(string)
  default     = null
}

variable "availability_zones" {
  description = "Availability zones for subnets (only used if create_vpc is true)"
  type        = list(string)
}
