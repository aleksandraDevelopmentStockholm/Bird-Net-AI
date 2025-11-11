# Storage Module Outputs

output "model_bucket_name" {
  description = "S3 bucket name for models"
  value       = aws_s3_bucket.model_bucket.bucket
}

output "model_bucket_arn" {
  description = "S3 bucket ARN for models"
  value       = aws_s3_bucket.model_bucket.arn
}

output "efs_file_system_id" {
  description = "EFS File System ID"
  value       = aws_efs_file_system.birdnet_efs.id
}

output "efs_access_point_arn" {
  description = "EFS Access Point ARN"
  value       = aws_efs_access_point.models_ap.arn
}

output "efs_mount_target_ids" {
  description = "EFS Mount Target IDs"
  value       = aws_efs_mount_target.birdnet_efs_mt[*].id
}
