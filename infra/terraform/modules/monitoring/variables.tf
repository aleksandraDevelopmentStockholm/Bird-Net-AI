# Monitoring Module Variables

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "lambda_function_name" {
  description = "Main Lambda function name"
  type        = string
}

variable "api_gateway_name" {
  description = "API Gateway REST API name"
  type        = string
}

variable "api_key_id" {
  description = "API Gateway API Key ID"
  type        = string
}

variable "api_log_group_name" {
  description = "API Gateway CloudWatch Log Group name"
  type        = string
}
