# Networking Module
# Manages VPC, subnets, security groups, and VPC endpoints

# Data source for current AWS region
data "aws_region" "current" {}

# VPC Resources (conditional creation)
resource "aws_vpc" "main" {
  count = var.create_vpc ? 1 : 0

  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "birdnet-vpc-${var.environment}"
    Environment = var.environment
    Project     = "birdnet"
  }
}

resource "aws_subnet" "private" {
  count = var.create_vpc ? 2 : 0

  vpc_id            = aws_vpc.main[0].id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "birdnet-private-${count.index}-${var.environment}"
    Environment = var.environment
    Project     = "birdnet"
  }
}

resource "aws_internet_gateway" "main" {
  count = var.create_vpc ? 1 : 0

  vpc_id = aws_vpc.main[0].id

  tags = {
    Name        = "birdnet-igw-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  count = var.create_vpc ? 1 : 0

  vpc_id = aws_vpc.main[0].id

  tags = {
    Name        = "birdnet-private-rt-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "private" {
  count = var.create_vpc ? 2 : 0

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[0].id
}

# Local values to unify VPC references
locals {
  vpc_id     = var.create_vpc ? try(aws_vpc.main[0].id, null) : var.existing_vpc_id
  subnet_ids = var.create_vpc ? try(aws_subnet.private[*].id, []) : coalesce(var.existing_subnet_ids, [])
}

# Validation checks
resource "terraform_data" "validate_vpc_config" {
  lifecycle {
    precondition {
      condition = (
        var.create_vpc ? true : (
          var.existing_vpc_id != null &&
          var.existing_subnet_ids != null &&
          length(coalesce(var.existing_subnet_ids, [])) >= 2
        )
      )
      error_message = "When create_vpc is false, you must provide existing_vpc_id and at least 2 existing_subnet_ids for high availability."
    }
  }
}

# Security Groups
resource "aws_security_group" "lambda_sg" {
  name_prefix = "birdnet-lambda-sg-${var.environment}-"
  description = "Security group for Lambda"
  vpc_id      = local.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "birdnet-lambda-sg-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_security_group" "efs_sg" {
  name_prefix = "birdnet-efs-sg-${var.environment}-"
  description = "Security group for EFS"
  vpc_id      = local.vpc_id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda_sg.id]
  }

  tags = {
    Name        = "birdnet-efs-sg-${var.environment}"
    Environment = var.environment
  }
}

# VPC Endpoints

# Get route tables for the VPC
data "aws_route_tables" "vpc_route_tables" {
  vpc_id = local.vpc_id
}

# S3 VPC Endpoint for Lambda to access S3 without NAT Gateway
resource "aws_vpc_endpoint" "s3" {
  vpc_id          = local.vpc_id
  service_name    = "com.amazonaws.${data.aws_region.current.name}.s3"
  route_table_ids = data.aws_route_tables.vpc_route_tables.ids

  tags = {
    Name        = "birdnet-s3-endpoint-${var.environment}"
    Environment = var.environment
  }
}
