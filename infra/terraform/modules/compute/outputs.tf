# Compute Module Outputs

output "ecr_repository_url" {
  description = "ECR repository URL for Lambda container image"
  value       = aws_ecr_repository.birdnet_lambda.repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.birdnet_lambda.name
}

output "ecr_setup_repository_url" {
  description = "ECR repository URL for Setup Lambda container image"
  value       = aws_ecr_repository.birdnet_setup_lambda.repository_url
}

output "ecr_setup_repository_name" {
  description = "ECR repository name for Setup Lambda"
  value       = aws_ecr_repository.birdnet_setup_lambda.name
}

output "main_placeholder_image_uri" {
  description = "Placeholder image URI for main Lambda function"
  value       = local.main_placeholder_image_uri
}

output "setup_placeholder_image_uri" {
  description = "Placeholder image URI for setup Lambda function"
  value       = local.setup_placeholder_image_uri
}

output "lambda_function_name" {
  description = "Main Lambda function name"
  value       = aws_lambda_function.birdnet_main.function_name
}

output "lambda_function_arn" {
  description = "Main Lambda function ARN"
  value       = aws_lambda_function.birdnet_main.arn
}

output "lambda_function_invoke_arn" {
  description = "Main Lambda function invoke ARN"
  value       = aws_lambda_function.birdnet_main.invoke_arn
}

output "setup_lambda_name" {
  description = "EFS setup Lambda function name"
  value       = aws_lambda_function.efs_setup.function_name
}
