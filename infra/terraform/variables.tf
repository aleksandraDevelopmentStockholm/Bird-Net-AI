# Input Variables
# Define all configurable parameters for the BirdNet infrastructure

# AWS Configuration
variable "aws_profile" {
  description = "AWS profile to use (optional - leave null to use default credentials)"
  type        = string
  default     = null # null = use environment variables or default profile
}

# Environment Configuration
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev" # Safer default - production should be explicitly specified
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Application Configuration
variable "allowed_origin" {
  description = "CORS allowed origin for client app"
  type        = string
  default     = "*"
}

# VPC Configuration
variable "create_vpc" {
  description = "Whether to create a new VPC or use existing infrastructure"
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "CIDR block for VPC (only used if create_vpc is true)"
  type        = string
  default     = "10.0.0.0/16"
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
  default     = ["eu-north-1a", "eu-north-1b"]
}
