# Resource Moved Blocks
# These blocks tell Terraform that resources have moved to modules
# This prevents destroy/create cycles during module refactoring

# Networking Module Moves
moved {
  from = aws_vpc.main
  to   = module.networking.aws_vpc.main
}

moved {
  from = aws_subnet.private
  to   = module.networking.aws_subnet.private
}

moved {
  from = aws_internet_gateway.main
  to   = module.networking.aws_internet_gateway.main
}

moved {
  from = aws_route_table.private
  to   = module.networking.aws_route_table.private
}

moved {
  from = aws_route_table_association.private
  to   = module.networking.aws_route_table_association.private
}

moved {
  from = aws_security_group.lambda_sg
  to   = module.networking.aws_security_group.lambda_sg
}

moved {
  from = aws_security_group.efs_sg
  to   = module.networking.aws_security_group.efs_sg
}

moved {
  from = aws_vpc_endpoint.s3
  to   = module.networking.aws_vpc_endpoint.s3
}

# Storage Module Moves
moved {
  from = aws_s3_bucket.model_bucket
  to   = module.storage.aws_s3_bucket.model_bucket
}

moved {
  from = aws_s3_bucket_public_access_block.model_bucket_pab
  to   = module.storage.aws_s3_bucket_public_access_block.model_bucket_pab
}

moved {
  from = aws_efs_file_system.birdnet_efs
  to   = module.storage.aws_efs_file_system.birdnet_efs
}

moved {
  from = aws_efs_mount_target.birdnet_efs_mt
  to   = module.storage.aws_efs_mount_target.birdnet_efs_mt
}

moved {
  from = aws_efs_access_point.models_ap
  to   = module.storage.aws_efs_access_point.models_ap
}

# Compute Module Moves
moved {
  from = aws_ecr_repository.birdnet_lambda
  to   = module.compute.aws_ecr_repository.birdnet_lambda
}

moved {
  from = aws_ecr_lifecycle_policy.birdnet_lambda
  to   = module.compute.aws_ecr_lifecycle_policy.birdnet_lambda
}

moved {
  from = aws_ecr_repository.birdnet_setup_lambda
  to   = module.compute.aws_ecr_repository.birdnet_setup_lambda
}

moved {
  from = aws_ecr_lifecycle_policy.birdnet_setup_lambda
  to   = module.compute.aws_ecr_lifecycle_policy.birdnet_setup_lambda
}

moved {
  from = null_resource.build_push_main_placeholder
  to   = module.compute.null_resource.build_push_main_placeholder
}

moved {
  from = null_resource.build_push_setup_placeholder
  to   = module.compute.null_resource.build_push_setup_placeholder
}

moved {
  from = aws_iam_role.lambda_execution_role
  to   = module.compute.aws_iam_role.lambda_execution_role
}

moved {
  from = aws_iam_role_policy_attachment.lambda_basic_execution
  to   = module.compute.aws_iam_role_policy_attachment.lambda_basic_execution
}

moved {
  from = aws_iam_role_policy_attachment.lambda_vpc_access
  to   = module.compute.aws_iam_role_policy_attachment.lambda_vpc_access
}

moved {
  from = aws_iam_role_policy.s3_access
  to   = module.compute.aws_iam_role_policy.s3_access
}

moved {
  from = aws_iam_role_policy.efs_access
  to   = module.compute.aws_iam_role_policy.efs_access
}

moved {
  from = aws_iam_role_policy.ecr_access
  to   = module.compute.aws_iam_role_policy.ecr_access
}

moved {
  from = aws_lambda_function.birdnet_main
  to   = module.compute.aws_lambda_function.birdnet_main
}

moved {
  from = aws_lambda_function.efs_setup
  to   = module.compute.aws_lambda_function.efs_setup
}

moved {
  from = aws_lambda_invocation.efs_setup_trigger
  to   = module.compute.aws_lambda_invocation.efs_setup_trigger
}

# API Module Moves
moved {
  from = aws_iam_role.api_gateway_cloudwatch_role
  to   = module.api.aws_iam_role.api_gateway_cloudwatch_role
}

moved {
  from = aws_iam_role_policy_attachment.api_gateway_cloudwatch_policy
  to   = module.api.aws_iam_role_policy_attachment.api_gateway_cloudwatch_policy
}

moved {
  from = aws_api_gateway_account.api_account
  to   = module.api.aws_api_gateway_account.api_account
}

moved {
  from = aws_api_gateway_rest_api.birdnet_api
  to   = module.api.aws_api_gateway_rest_api.birdnet_api
}

moved {
  from = aws_api_gateway_resource.health
  to   = module.api.aws_api_gateway_resource.health
}

moved {
  from = aws_api_gateway_resource.identify
  to   = module.api.aws_api_gateway_resource.identify
}

moved {
  from = aws_api_gateway_resource.test
  to   = module.api.aws_api_gateway_resource.test
}

moved {
  from = aws_api_gateway_request_validator.request_validator
  to   = module.api.aws_api_gateway_request_validator.request_validator
}

moved {
  from = aws_api_gateway_model.identify_request_model
  to   = module.api.aws_api_gateway_model.identify_request_model
}

moved {
  from = aws_api_gateway_method.health_get
  to   = module.api.aws_api_gateway_method.health_get
}

moved {
  from = aws_api_gateway_integration.health_integration
  to   = module.api.aws_api_gateway_integration.health_integration
}

moved {
  from = aws_api_gateway_method_response.health_response_200
  to   = module.api.aws_api_gateway_method_response.health_response_200
}

moved {
  from = aws_api_gateway_method.identify_post
  to   = module.api.aws_api_gateway_method.identify_post
}

moved {
  from = aws_api_gateway_integration.identify_integration
  to   = module.api.aws_api_gateway_integration.identify_integration
}

moved {
  from = aws_api_gateway_method_response.identify_response_200
  to   = module.api.aws_api_gateway_method_response.identify_response_200
}

moved {
  from = aws_api_gateway_method_response.identify_response_400
  to   = module.api.aws_api_gateway_method_response.identify_response_400
}

moved {
  from = aws_api_gateway_method_response.identify_response_500
  to   = module.api.aws_api_gateway_method_response.identify_response_500
}

moved {
  from = aws_api_gateway_method.test_get
  to   = module.api.aws_api_gateway_method.test_get
}

moved {
  from = aws_api_gateway_integration.test_integration
  to   = module.api.aws_api_gateway_integration.test_integration
}

moved {
  from = aws_api_gateway_integration_response.test_integration_response
  to   = module.api.aws_api_gateway_integration_response.test_integration_response
}

moved {
  from = aws_api_gateway_method_response.test_response_200
  to   = module.api.aws_api_gateway_method_response.test_response_200
}

moved {
  from = aws_api_gateway_method.identify_options
  to   = module.api.aws_api_gateway_method.identify_options
}

moved {
  from = aws_api_gateway_integration.identify_options_integration
  to   = module.api.aws_api_gateway_integration.identify_options_integration
}

moved {
  from = aws_api_gateway_integration_response.identify_options_integration_response
  to   = module.api.aws_api_gateway_integration_response.identify_options_integration_response
}

moved {
  from = aws_api_gateway_method_response.identify_options_response_200
  to   = module.api.aws_api_gateway_method_response.identify_options_response_200
}

moved {
  from = aws_lambda_permission.api_gateway_health
  to   = module.api.aws_lambda_permission.api_gateway_health
}

moved {
  from = aws_lambda_permission.api_gateway_identify
  to   = module.api.aws_lambda_permission.api_gateway_identify
}

moved {
  from = aws_api_gateway_deployment.api_deployment
  to   = module.api.aws_api_gateway_deployment.api_deployment
}

moved {
  from = aws_api_gateway_stage.api_stage
  to   = module.api.aws_api_gateway_stage.api_stage
}

moved {
  from = aws_api_gateway_usage_plan.api_usage_plan
  to   = module.api.aws_api_gateway_usage_plan.api_usage_plan
}

moved {
  from = aws_api_gateway_api_key.api_key
  to   = module.api.aws_api_gateway_api_key.api_key
}

moved {
  from = aws_api_gateway_usage_plan_key.usage_plan_key
  to   = module.api.aws_api_gateway_usage_plan_key.usage_plan_key
}

moved {
  from = aws_cloudwatch_log_group.api_log_group
  to   = module.api.aws_cloudwatch_log_group.api_log_group
}

# Monitoring Module Moves
moved {
  from = aws_cloudwatch_dashboard.birdnet_api_dashboard
  to   = module.monitoring.aws_cloudwatch_dashboard.birdnet_api_dashboard
}

moved {
  from = aws_cloudwatch_metric_alarm.api_high_error_rate
  to   = module.monitoring.aws_cloudwatch_metric_alarm.api_high_error_rate
}

moved {
  from = aws_cloudwatch_metric_alarm.lambda_high_error_rate
  to   = module.monitoring.aws_cloudwatch_metric_alarm.lambda_high_error_rate
}

moved {
  from = aws_cloudwatch_metric_alarm.api_high_request_rate
  to   = module.monitoring.aws_cloudwatch_metric_alarm.api_high_request_rate
}

moved {
  from = aws_cloudwatch_metric_alarm.lambda_high_duration
  to   = module.monitoring.aws_cloudwatch_metric_alarm.lambda_high_duration
}
