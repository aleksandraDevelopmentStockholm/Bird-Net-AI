# Monitoring Module Outputs

# Data source for region (needed for URL outputs)
data "aws_region" "current" {}

output "cloudwatch_dashboard_url" {
  description = "URL to CloudWatch Dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=BirdNET-API-${var.environment}"
}

output "cloudwatch_logs_url" {
  description = "URL to CloudWatch Logs for API Gateway"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#logsV2:log-groups/log-group/${urlencode(var.api_log_group_name)}"
}

output "log_insights_query_errors" {
  description = "CloudWatch Logs Insights query to find errors"
  value       = <<-EOT
    fields @timestamp, @message, requestId
    | filter @message like /ERROR|Error|error/
    | sort @timestamp desc
    | limit 50
  EOT
}

output "log_insights_query_performance" {
  description = "CloudWatch Logs Insights query for performance analysis"
  value       = <<-EOT
    fields @timestamp, processing_time_ms, httpMethod, path
    | filter ispresent(processing_time_ms)
    | stats avg(processing_time_ms) as avg_time, max(processing_time_ms) as max_time, count() as requests by bin(5m)
  EOT
}

output "log_insights_query_api_key_usage" {
  description = "CloudWatch Logs Insights query to analyze API key usage patterns"
  value       = <<-EOT
    fields @timestamp, requestId, sourceIp, path
    | filter path like /identify-bird/
    | stats count() as requests by sourceIp
    | sort requests desc
  EOT
}
