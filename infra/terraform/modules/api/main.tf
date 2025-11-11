# API Gateway CloudWatch Role
resource "aws_iam_role" "api_gateway_cloudwatch_role" {
  name = "api-gateway-cloudwatch-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch_policy" {
  role       = aws_iam_role.api_gateway_cloudwatch_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# API Gateway Account Settings (one per region/account)
resource "aws_api_gateway_account" "api_account" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch_role.arn
}

# API Gateway
resource "aws_api_gateway_rest_api" "birdnet_api" {
  name        = "birdnet-api-${var.environment}"
  description = "BirdNET Bird Identification API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
  }
}

# Health Resource
resource "aws_api_gateway_resource" "health" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  parent_id   = aws_api_gateway_rest_api.birdnet_api.root_resource_id
  path_part   = "health"
}

# Identify Resource
resource "aws_api_gateway_resource" "identify" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  parent_id   = aws_api_gateway_rest_api.birdnet_api.root_resource_id
  path_part   = "identify-bird"
}

# Test Resource
resource "aws_api_gateway_resource" "test" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  parent_id   = aws_api_gateway_rest_api.birdnet_api.root_resource_id
  path_part   = "test"
}

# Request Validator
resource "aws_api_gateway_request_validator" "request_validator" {
  name                        = "request-validator"
  rest_api_id                 = aws_api_gateway_rest_api.birdnet_api.id
  validate_request_body       = true
  validate_request_parameters = true
}

# Request Model for validation
resource "aws_api_gateway_model" "identify_request_model" {
  rest_api_id  = aws_api_gateway_rest_api.birdnet_api.id
  name         = "IdentifyRequestModel"
  content_type = "application/json"

  schema = jsonencode({
    "$schema" = "http://json-schema.org/draft-04/schema#"
    type      = "object"
    properties = {
      audio = {
        type     = "array"
        items    = { type = "number" }
        minItems = 1
        maxItems = 200000
      }
      audioFile = {
        type      = "string"
        minLength = 1
      }
      confidence_threshold = {
        type    = "number"
        minimum = 0
        maximum = 1
      }
      max_results = {
        type    = "integer"
        minimum = 1
        maximum = 50
      }
    }
  })
}

# Health Method (GET)
resource "aws_api_gateway_method" "health_get" {
  rest_api_id   = aws_api_gateway_rest_api.birdnet_api.id
  resource_id   = aws_api_gateway_resource.health.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "health_integration" {
  rest_api_id             = aws_api_gateway_rest_api.birdnet_api.id
  resource_id             = aws_api_gateway_resource.health.id
  http_method             = aws_api_gateway_method.health_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_function_invoke_arn
}

resource "aws_api_gateway_method_response" "health_response_200" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# Identify Method (POST)
resource "aws_api_gateway_method" "identify_post" {
  rest_api_id          = aws_api_gateway_rest_api.birdnet_api.id
  resource_id          = aws_api_gateway_resource.identify.id
  http_method          = "POST"
  authorization        = "NONE"
  api_key_required     = true # Enforce API key for rate limiting
  request_validator_id = aws_api_gateway_request_validator.request_validator.id

  request_models = {
    "application/json" = aws_api_gateway_model.identify_request_model.name
  }
}

resource "aws_api_gateway_integration" "identify_integration" {
  rest_api_id             = aws_api_gateway_rest_api.birdnet_api.id
  resource_id             = aws_api_gateway_resource.identify.id
  http_method             = aws_api_gateway_method.identify_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_function_invoke_arn
}

resource "aws_api_gateway_method_response" "identify_response_200" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.identify.id
  http_method = aws_api_gateway_method.identify_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "identify_response_400" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.identify.id
  http_method = aws_api_gateway_method.identify_post.http_method
  status_code = "400"
}

resource "aws_api_gateway_method_response" "identify_response_500" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.identify.id
  http_method = aws_api_gateway_method.identify_post.http_method
  status_code = "500"
}

# Test Method (GET)
resource "aws_api_gateway_method" "test_get" {
  rest_api_id   = aws_api_gateway_rest_api.birdnet_api.id
  resource_id   = aws_api_gateway_resource.test.id
  http_method   = "GET"
  authorization = "NONE"
}

# Test Integration (Mock response)
resource "aws_api_gateway_integration" "test_integration" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.test.id
  http_method = aws_api_gateway_method.test_get.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Test Integration Response
resource "aws_api_gateway_integration_response" "test_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.test.id
  http_method = aws_api_gateway_method.test_get.http_method
  status_code = "200"

  depends_on = [aws_api_gateway_integration.test_integration]

  response_templates = {
    "application/json" = jsonencode({
      message     = "API Gateway is working!"
      timestamp   = "$context.requestTime"
      api_id      = "$context.apiId"
      stage       = "$context.stage"
      environment = "${var.environment}"
    })
  }
}

# Test Method Response
resource "aws_api_gateway_method_response" "test_response_200" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.test.id
  http_method = aws_api_gateway_method.test_get.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# CORS Options Method for identify endpoint
resource "aws_api_gateway_method" "identify_options" {
  rest_api_id   = aws_api_gateway_rest_api.birdnet_api.id
  resource_id   = aws_api_gateway_resource.identify.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "identify_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.identify.id
  http_method = aws_api_gateway_method.identify_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_integration_response" "identify_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.identify.id
  http_method = aws_api_gateway_method.identify_options.http_method
  status_code = aws_api_gateway_method_response.identify_options_response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origin}'"
  }
}

resource "aws_api_gateway_method_response" "identify_options_response_200" {
  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  resource_id = aws_api_gateway_resource.identify.id
  http_method = aws_api_gateway_method.identify_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Lambda Permissions
resource "aws_lambda_permission" "api_gateway_health" {
  statement_id  = "AllowExecutionFromAPIGatewayHealth"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.birdnet_api.execution_arn}/*/GET/health"
}

resource "aws_lambda_permission" "api_gateway_identify" {
  statement_id  = "AllowExecutionFromAPIGatewayIdentify"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.birdnet_api.execution_arn}/*/POST/identify-bird"
}

# API Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_method.health_get,
    aws_api_gateway_method.identify_post,
    aws_api_gateway_method.identify_options,
    aws_api_gateway_integration.health_integration,
    aws_api_gateway_integration.identify_integration,
    aws_api_gateway_integration.identify_options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.birdnet_api.id
  description = "Deployment for ${var.environment}"

  lifecycle {
    create_before_destroy = true
  }
}

# API Stage
resource "aws_api_gateway_stage" "api_stage" {
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.birdnet_api.id
  stage_name    = var.environment
  description   = "Stage for ${var.environment}"

  variables = {
    environment = var.environment
  }

  # Enable execution logging
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_log_group.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      caller           = "$context.identity.caller"
      user             = "$context.identity.user"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      resourcePath     = "$context.resourcePath"
      status           = "$context.status"
      protocol         = "$context.protocol"
      responseLength   = "$context.responseLength"
      errorMessage     = "$context.error.message"
      errorType        = "$context.error.messageString"
      integrationError = "$context.integration.error"
    })
  }

  tags = {
    Environment = var.environment
  }

  depends_on = [aws_api_gateway_account.api_account]
}

# Usage Plan for rate limiting
resource "aws_api_gateway_usage_plan" "api_usage_plan" {
  name        = "birdnet-usage-plan-${var.environment}"
  description = "Usage plan for BirdNET API with rate limiting"

  api_stages {
    api_id = aws_api_gateway_rest_api.birdnet_api.id
    stage  = aws_api_gateway_stage.api_stage.stage_name

    # Per-method throttle override for identify endpoint
    throttle {
      path        = "/identify-bird/POST"
      rate_limit  = 5  # 5 requests per second (300/min) - bird identification is expensive
      burst_limit = 10 # Allow short bursts of up to 10 requests
    }
  }

  # Default throttle settings for all endpoints
  throttle_settings {
    rate_limit  = 10 # 10 requests per second for other endpoints
    burst_limit = 20 # Allow bursts of 20 requests
  }

  # Daily quota to prevent abuse
  quota_settings {
    limit  = 1000 # 1000 requests per day
    period = "DAY"
  }

  tags = {
    Environment = var.environment
  }
}

# API Key
resource "aws_api_gateway_api_key" "api_key" {
  name        = "birdnet-api-key-${var.environment}"
  description = "API Key for BirdNET API"
  enabled     = true

  tags = {
    Environment = var.environment
  }
}

# Usage Plan Key
resource "aws_api_gateway_usage_plan_key" "usage_plan_key" {
  key_id        = aws_api_gateway_api_key.api_key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.api_usage_plan.id
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_log_group" {
  name              = "/aws/apigateway/birdnet-api-${var.environment}"
  retention_in_days = 7

  tags = {
    Environment = var.environment
  }
}
