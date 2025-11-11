# Root Main Configuration
# Orchestrates all infrastructure modules

# Networking Module - VPC, subnets, security groups, VPC endpoints
module "networking" {
  source = "./modules/networking"

  environment         = var.environment
  create_vpc          = var.create_vpc
  vpc_cidr            = var.vpc_cidr
  existing_vpc_id     = var.existing_vpc_id
  existing_subnet_ids = var.existing_subnet_ids
  availability_zones  = var.availability_zones
}

# Storage Module - S3 and EFS
module "storage" {
  source = "./modules/storage"

  environment           = var.environment
  account_id            = data.aws_caller_identity.current.account_id
  subnet_ids            = module.networking.subnet_ids
  efs_security_group_id = module.networking.efs_security_group_id
  create_vpc            = var.create_vpc
  existing_subnet_ids   = var.existing_subnet_ids
}

# Compute Module - ECR, Lambda functions, IAM roles
module "compute" {
  source = "./modules/compute"

  environment              = var.environment
  account_id               = data.aws_caller_identity.current.account_id
  region                   = data.aws_region.current.name
  subnet_ids               = module.networking.subnet_ids
  lambda_security_group_id = module.networking.lambda_security_group_id
  efs_access_point_arn     = module.storage.efs_access_point_arn
  model_bucket_name        = module.storage.model_bucket_name
  model_bucket_arn         = module.storage.model_bucket_arn
  allowed_origin           = var.allowed_origin
  s3_vpc_endpoint_id       = module.networking.s3_vpc_endpoint_id
}

# API Module - API Gateway
module "api" {
  source = "./modules/api"

  environment                = var.environment
  allowed_origin             = var.allowed_origin
  lambda_function_name       = module.compute.lambda_function_name
  lambda_function_invoke_arn = module.compute.lambda_function_invoke_arn
}

# Monitoring Module - CloudWatch dashboards and alarms
module "monitoring" {
  source = "./modules/monitoring"

  environment          = var.environment
  lambda_function_name = module.compute.lambda_function_name
  api_gateway_name     = "birdnet-api-${var.environment}"
  api_key_id           = module.api.api_key_id
  api_log_group_name   = module.api.api_log_group_name
}
