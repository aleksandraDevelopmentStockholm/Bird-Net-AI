# Root Output Values
# Export useful information from all modules

# Storage Outputs
output "model_bucket_name" {
  description = "S3 bucket name for models"
  value       = module.storage.model_bucket_name
}

output "efs_file_system_id" {
  description = "EFS File System ID"
  value       = module.storage.efs_file_system_id
}

# Compute Outputs
output "lambda_function_name" {
  description = "Main Lambda function name"
  value       = module.compute.lambda_function_name
}

output "setup_lambda_name" {
  description = "EFS setup Lambda function name"
  value       = module.compute.setup_lambda_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for Lambda container image"
  value       = module.compute.ecr_repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = module.compute.ecr_repository_name
}

output "ecr_setup_repository_url" {
  description = "ECR repository URL for Setup Lambda container image"
  value       = module.compute.ecr_setup_repository_url
}

output "ecr_setup_repository_name" {
  description = "ECR repository name for Setup Lambda"
  value       = module.compute.ecr_setup_repository_name
}

output "main_placeholder_image_uri" {
  description = "Placeholder image URI for main Lambda function"
  value       = module.compute.main_placeholder_image_uri
}

output "setup_placeholder_image_uri" {
  description = "Placeholder image URI for setup Lambda function"
  value       = module.compute.setup_placeholder_image_uri
}

# API Outputs
output "api_url" {
  description = "API Gateway URL"
  value       = module.api.api_url
}

output "api_key" {
  description = "API Key for authentication"
  value       = module.api.api_key
  sensitive   = true
}

output "api_gateway_url" {
  description = "Complete API Gateway URL"
  value       = module.api.api_gateway_url
}

output "test_endpoint_url" {
  description = "Test endpoint URL"
  value       = module.api.test_endpoint_url
}

output "health_endpoint_url" {
  description = "Health endpoint URL"
  value       = module.api.health_endpoint_url
}

output "identify_endpoint_url" {
  description = "Identify endpoint URL"
  value       = module.api.identify_endpoint_url
}

# Monitoring Outputs
output "cloudwatch_dashboard_url" {
  description = "URL to CloudWatch Dashboard"
  value       = module.monitoring.cloudwatch_dashboard_url
}

output "cloudwatch_logs_url" {
  description = "URL to CloudWatch Logs for API Gateway"
  value       = module.monitoring.cloudwatch_logs_url
}

output "log_insights_query_errors" {
  description = "CloudWatch Logs Insights query to find errors"
  value       = module.monitoring.log_insights_query_errors
}

output "log_insights_query_performance" {
  description = "CloudWatch Logs Insights query for performance analysis"
  value       = module.monitoring.log_insights_query_performance
}

output "log_insights_query_api_key_usage" {
  description = "CloudWatch Logs Insights query to analyze API key usage patterns"
  value       = module.monitoring.log_insights_query_api_key_usage
}
