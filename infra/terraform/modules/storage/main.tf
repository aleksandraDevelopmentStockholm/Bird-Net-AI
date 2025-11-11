# Storage Module
# Manages S3 buckets and EFS filesystems

# S3 Bucket for model storage
resource "aws_s3_bucket" "model_bucket" {
  bucket        = "birdnet-models-${var.environment}-${var.account_id}"
  force_destroy = true

  tags = {
    Name        = "birdnet-models-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "model_bucket_pab" {
  bucket = aws_s3_bucket.model_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# EFS File System
resource "aws_efs_file_system" "birdnet_efs" {
  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"
  encrypted        = true

  tags = {
    Name        = "birdnet-efs-${var.environment}"
    Environment = var.environment
  }
}

# EFS Mount Targets
resource "aws_efs_mount_target" "birdnet_efs_mt" {
  count           = var.create_vpc ? 2 : length(coalesce(var.existing_subnet_ids, []))
  file_system_id  = aws_efs_file_system.birdnet_efs.id
  subnet_id       = var.subnet_ids[count.index]
  security_groups = [var.efs_security_group_id]
}

# EFS Access Point for models
resource "aws_efs_access_point" "models_ap" {
  file_system_id = aws_efs_file_system.birdnet_efs.id

  posix_user {
    gid = 1000
    uid = 1000
  }

  root_directory {
    path = "/lambda"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }

  tags = {
    Name        = "birdnet-efs-ap-${var.environment}"
    Environment = var.environment
  }
}
