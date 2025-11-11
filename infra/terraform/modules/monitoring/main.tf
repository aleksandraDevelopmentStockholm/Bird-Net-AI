# CloudWatch Dashboard for API Monitoring
# NOTE: This file is created but not yet applied.
# To enable monitoring, run: terraform apply
# The dashboard and alarms will be created without affecting existing infrastructure.

resource "aws_cloudwatch_dashboard" "birdnet_api_dashboard" {
  dashboard_name = "BirdNET-API-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      # API Gateway Request Metrics
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum", label = "Total Requests", color = "#1f77b4" }],
            [".", "4XXError", { stat = "Sum", label = "Client Errors (4xx)", color = "#ff7f0e" }],
            [".", "5XXError", { stat = "Sum", label = "Server Errors (5xx)", color = "#d62728" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "API Request Count & Errors"
          period  = 300
          dimensions = {
            ApiName = var.api_gateway_name
          }
          yAxis = {
            left = {
              label = "Requests"
            }
          }
        }
      },
      # API Latency
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Latency", { stat = "Average", label = "Avg Latency", color = "#2ca02c" }],
            ["...", { stat = "p99", label = "p99 Latency", color = "#d62728" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "API Latency"
          period  = 300
          yAxis = {
            left = {
              label = "Milliseconds"
            }
          }
        }
      },
      # Lambda Invocations & Errors
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum", label = "Invocations", color = "#1f77b4" }],
            [".", "Errors", { stat = "Sum", label = "Errors", color = "#d62728" }],
            [".", "Throttles", { stat = "Sum", label = "Throttles", color = "#ff7f0e" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Lambda Invocations & Errors"
          period  = 300
          dimensions = {
            FunctionName = var.lambda_function_name
          }
          yAxis = {
            left = {
              label = "Count"
            }
          }
        }
      },
      # Lambda Duration
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", { stat = "Average", label = "Avg Duration", color = "#2ca02c" }],
            ["...", { stat = "Maximum", label = "Max Duration", color = "#d62728" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Lambda Execution Time"
          period  = 300
          dimensions = {
            FunctionName = var.lambda_function_name
          }
          yAxis = {
            left = {
              label = "Milliseconds"
            }
          }
        }
      },
      # API Key Usage Over Time
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum", label = "Requests", color = "#9467bd" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "API Key Usage (Hourly)"
          period  = 3600
          dimensions = {
            ApiName  = var.api_gateway_name
            ApiKeyId = var.api_key_id
          }
          yAxis = {
            left = {
              label = "Requests per Hour"
            }
          }
        }
      },
      # Lambda Concurrent Executions
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "ConcurrentExecutions", { stat = "Maximum", label = "Concurrent Executions", color = "#8c564b" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Lambda Concurrent Executions"
          period  = 300
          dimensions = {
            FunctionName = var.lambda_function_name
          }
          yAxis = {
            left = {
              label = "Count"
            }
          }
        }
      }
    ]
  })
}

# CloudWatch Alarms for Proactive Monitoring

# Alarm: High API Error Rate
resource "aws_cloudwatch_metric_alarm" "api_high_error_rate" {
  alarm_name          = "birdnet-api-high-error-rate-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Triggers when API Gateway returns more than 10 server errors in 10 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = var.api_gateway_name
  }

  tags = {
    Environment = var.environment
    Purpose     = "API Monitoring"
  }
}

# Alarm: Lambda High Error Rate
resource "aws_cloudwatch_metric_alarm" "lambda_high_error_rate" {
  alarm_name          = "birdnet-lambda-high-error-rate-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Triggers when Lambda function has more than 5 errors in 10 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.lambda_function_name
  }

  tags = {
    Environment = var.environment
    Purpose     = "Lambda Monitoring"
  }
}

# Alarm: High Request Rate (Possible Attack or Unexpected Load)
resource "aws_cloudwatch_metric_alarm" "api_high_request_rate" {
  alarm_name          = "birdnet-api-high-request-rate-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Count"
  namespace           = "AWS/ApiGateway"
  period              = "60"
  statistic           = "Sum"
  threshold           = "100"
  alarm_description   = "Triggers when API receives more than 100 requests per minute"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = var.api_gateway_name
  }

  tags = {
    Environment = var.environment
    Purpose     = "Rate Limiting"
  }
}

# Alarm: Lambda Duration Approaching Timeout
resource "aws_cloudwatch_metric_alarm" "lambda_high_duration" {
  alarm_name          = "birdnet-lambda-high-duration-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = "25000" # 25 seconds (if timeout is 30s)
  alarm_description   = "Triggers when Lambda execution time approaches timeout"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.lambda_function_name
  }

  tags = {
    Environment = var.environment
    Purpose     = "Performance Monitoring"
  }
}

# Outputs for Easy Access

