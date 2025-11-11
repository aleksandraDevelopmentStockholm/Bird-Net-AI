# Compute Module
# Manages ECR repositories, Lambda functions, and IAM roles

# ECR Repository for Main Lambda Container Image
resource "aws_ecr_repository" "birdnet_lambda" {
  name                 = "birdnet-lambda-${var.environment}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "birdnet-lambda-${var.environment}"
    Environment = var.environment
  }
}

# ECR Repository for Setup Lambda Container Image
resource "aws_ecr_repository" "birdnet_setup_lambda" {
  name                 = "birdnet-setup-lambda-${var.environment}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "birdnet-setup-lambda-${var.environment}"
    Environment = var.environment
  }
}

# Lifecycle policy to keep only recent images
resource "aws_ecr_lifecycle_policy" "birdnet_lambda" {
  repository = aws_ecr_repository.birdnet_lambda.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 3 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 3
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "birdnet_setup_lambda" {
  repository = aws_ecr_repository.birdnet_setup_lambda.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 3 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 3
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Local values for placeholder image URIs
locals {
  placeholder_tag             = "placeholder-initial"
  main_placeholder_image_uri  = "${aws_ecr_repository.birdnet_lambda.repository_url}:${local.placeholder_tag}"
  setup_placeholder_image_uri = "${aws_ecr_repository.birdnet_setup_lambda.repository_url}:${local.placeholder_tag}"
}

# Build and push placeholder image for main Lambda
resource "null_resource" "build_push_main_placeholder" {
  depends_on = [aws_ecr_repository.birdnet_lambda]

  provisioner "local-exec" {
    command = <<-EOT
      set -e

      # Navigate to lambda directory
      cd ${path.module}/../../lambda

      # Authenticate Docker to ECR
      aws ecr get-login-password --region ${var.region} | \
        docker login --username AWS --password-stdin ${var.account_id}.dkr.ecr.${var.region}.amazonaws.com

      # Build placeholder image (without BuildKit for Lambda compatibility)
      DOCKER_BUILDKIT=0 docker build --platform linux/amd64 -f Dockerfile.placeholder -t birdnet-placeholder:latest .

      # Tag and push to main Lambda repository
      docker tag birdnet-placeholder:latest ${local.main_placeholder_image_uri}
      docker push ${local.main_placeholder_image_uri}

      echo "Placeholder image pushed: ${local.main_placeholder_image_uri}"
    EOT
  }
}

# Build and push placeholder image for setup Lambda
resource "null_resource" "build_push_setup_placeholder" {
  depends_on = [aws_ecr_repository.birdnet_setup_lambda]

  provisioner "local-exec" {
    command = <<-EOT
      set -e

      # Navigate to lambda directory
      cd ${path.module}/../../lambda

      # Authenticate Docker to ECR
      aws ecr get-login-password --region ${var.region} | \
        docker login --username AWS --password-stdin ${var.account_id}.dkr.ecr.${var.region}.amazonaws.com

      # Build placeholder image (without BuildKit for Lambda compatibility)
      DOCKER_BUILDKIT=0 docker build --platform linux/amd64 -f Dockerfile.placeholder -t birdnet-placeholder:latest .

      # Tag and push to setup Lambda repository
      docker tag birdnet-placeholder:latest ${local.setup_placeholder_image_uri}
      docker push ${local.setup_placeholder_image_uri}

      echo "Placeholder image pushed: ${local.setup_placeholder_image_uri}"
    EOT
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_execution_role" {
  name = "birdnet-lambda-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
  }
}

# IAM Policy attachments
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# S3 Access Policy
resource "aws_iam_role_policy" "s3_access" {
  name = "S3Access"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.model_bucket_arn,
          "${var.model_bucket_arn}/*"
        ]
      }
    ]
  })
}

# EFS Access Policy
resource "aws_iam_role_policy" "efs_access" {
  name = "EFSAccess"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientWrite",
          "elasticfilesystem:ClientRootAccess"
        ]
        Resource = var.efs_access_point_arn
      }
    ]
  })
}

# ECR Access Policy - Required for Lambda to pull container images
resource "aws_iam_role_policy" "ecr_access" {
  name = "ECRAccess"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
        Resource = [
          aws_ecr_repository.birdnet_lambda.arn,
          aws_ecr_repository.birdnet_setup_lambda.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      }
    ]
  })
}

# EFS Setup Lambda Function (Container Image)
resource "aws_lambda_function" "efs_setup" {
  depends_on = [
    aws_ecr_repository.birdnet_setup_lambda,
    null_resource.build_push_setup_placeholder,
    aws_iam_role_policy.ecr_access
  ]

  function_name = "birdnet-efs-setup-${var.environment}"
  role          = aws_iam_role.lambda_execution_role.arn
  package_type  = "Image"
  # Use Lambda-compatible placeholder image for initial deployment
  # Built with DOCKER_BUILDKIT=0 to ensure Docker Image Manifest V2 format
  # Will be updated by Lambda deployment workflow with production image
  image_uri   = local.setup_placeholder_image_uri
  timeout     = 300
  memory_size = 512

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  file_system_config {
    arn              = var.efs_access_point_arn
    local_mount_path = "/mnt/efs"
  }

  environment {
    variables = {
      MODEL_BUCKET_NAME = var.model_bucket_name
    }
  }

  tags = {
    Environment = var.environment
  }

  # Lifecycle to prevent replacement when image changes
  # This allows deployments to update the image without Terraform reverting it
  lifecycle {
    ignore_changes = [image_uri]
  }
}

# Main BirdNET Lambda Function (Container Image)
resource "aws_lambda_function" "birdnet_main" {
  depends_on = [
    aws_lambda_function.efs_setup,
    aws_ecr_repository.birdnet_lambda,
    null_resource.build_push_main_placeholder,
    aws_iam_role_policy.ecr_access
  ]

  function_name = "birdnet-api-${var.environment}"
  role          = aws_iam_role.lambda_execution_role.arn
  package_type  = "Image"
  # Use Lambda-compatible placeholder image for initial deployment
  # Built with DOCKER_BUILDKIT=0 to ensure Docker Image Manifest V2 format
  # Will be updated by Lambda deployment workflow with production image
  image_uri   = local.main_placeholder_image_uri
  timeout     = 90
  memory_size = 3008

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  file_system_config {
    arn              = var.efs_access_point_arn
    local_mount_path = "/mnt/efs"
  }

  environment {
    variables = {
      ALLOWED_ORIGIN = var.allowed_origin
      ENVIRONMENT    = var.environment
    }
  }

  tags = {
    Environment = var.environment
  }

  # Lifecycle to prevent replacement when image changes
  # This allows deployments to update the image without Terraform reverting it
  lifecycle {
    ignore_changes = [image_uri]
  }
}

# Trigger EFS setup (Custom Resource equivalent)
resource "aws_lambda_invocation" "efs_setup_trigger" {
  depends_on = [var.s3_vpc_endpoint_id]

  function_name = aws_lambda_function.efs_setup.function_name

  input = jsonencode({
    RequestType       = "Create"
    StackId           = "terraform-stack"
    RequestId         = "terraform-request"
    LogicalResourceId = "EFSSetupResource"
    ResponseURL       = "https://httpbin.org/put" # Dummy URL for Terraform
  })
}
