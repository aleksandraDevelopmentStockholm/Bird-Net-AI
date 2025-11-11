# API Module Variables

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "allowed_origin" {
  description = "CORS allowed origin"
  type        = string
}

variable "lambda_function_name" {
  description = "Main Lambda function name"
  type        = string
}

variable "lambda_function_invoke_arn" {
  description = "Main Lambda function invoke ARN"
  type        = string
}
