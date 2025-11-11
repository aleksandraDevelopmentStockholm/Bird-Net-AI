# API Module Outputs

# Data source for region (needed for URL outputs)
data "aws_region" "current" {}

output "api_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.birdnet_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "api_key" {
  description = "API Key for authentication"
  value       = aws_api_gateway_api_key.api_key.value
  sensitive   = true
}

output "api_gateway_url" {
  description = "Complete API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.birdnet_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.api_stage.stage_name}"
}

output "test_endpoint_url" {
  description = "Test endpoint URL"
  value       = "https://${aws_api_gateway_rest_api.birdnet_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.api_stage.stage_name}/test"
}

output "health_endpoint_url" {
  description = "Health endpoint URL"
  value       = "https://${aws_api_gateway_rest_api.birdnet_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.api_stage.stage_name}/health"
}

output "identify_endpoint_url" {
  description = "Identify endpoint URL"
  value       = "https://${aws_api_gateway_rest_api.birdnet_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.api_stage.stage_name}/identify-bird"
}

output "api_key_id" {
  description = "API Gateway API Key ID"
  value       = aws_api_gateway_api_key.api_key.id
}

output "api_log_group_name" {
  description = "API Gateway CloudWatch Log Group name"
  value       = aws_cloudwatch_log_group.api_log_group.name
}
