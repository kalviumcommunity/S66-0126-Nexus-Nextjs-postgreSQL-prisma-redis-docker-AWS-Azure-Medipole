# Logging and Monitoring Implementation

## Overview

This implementation provides comprehensive application logging and monitoring capabilities with structured logging, metrics collection, and cloud platform integration. The solution enables visibility into application performance, error tracking, and resource utilization across AWS CloudWatch and Azure Monitor.

## Importance of Logging and Monitoring

### Key Benefits

- **Application Performance**: Track response times, throughput, and bottlenecks
- **Error Detection**: Early identification of failures and anomalies
- **Resource Utilization**: Monitor CPU, memory, and system resources
- **Business Insights**: Track user registrations, email delivery, and key metrics
- **Compliance**: Audit trails for security and regulatory requirements

### Monitoring Layers

| Layer          | Example Metric                 | Cloud Service                                |
| -------------- | ------------------------------ | -------------------------------------------- |
| Application    | API response time, error count | CloudWatch Logs / Azure Application Insights |
| Infrastructure | CPU, memory, disk, network     | CloudWatch Metrics / Azure Monitor           |
| Alerts         | Error threshold or downtime    | CloudWatch Alarms / Azure Alerts             |

## Implementation Components

### 1. Structured Logger (`src/lib/logger.ts`)

Production-ready logging utility with JSON formatting:

#### Key Features:

- **Structured JSON output** for better searchability
- **Correlation IDs** for request tracing
- **Multiple log levels** (debug, info, warn, error)
- **Component-based logging** for better organization
- **Specialized loggers** for HTTP, database, and security events

#### Usage Examples:

```typescript
import { logger, generateRequestId } from "@/lib/logger";

// Basic logging
logger.info("User registered successfully", {
  userId: "user-123",
  email: "user@example.com",
});

// HTTP request logging
const requestId = generateRequestId();
logger.http("POST", "/api/users", 201, 45, { requestId });

// Error logging with context
logger.error("Database connection failed", {
  error: {
    message: error.message,
    stack: error.stack,
  },
  component: "database",
});
```

#### Log Structure:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User registered successfully",
  "requestId": "uuid-here",
  "service": "medipole-app",
  "component": "user-service",
  "userId": "user-123"
}
```

### 2. Metrics Collection (`src/lib/metrics.ts`)

Comprehensive metrics system with Prometheus support:

#### Metric Types:

- **Counter**: Monotonically increasing values (request counts)
- **Gauge**: Instantaneous values (current users, memory usage)
- **Histogram**: Distribution of values (response times)
- **Summary**: Quantile calculations (latency percentiles)

#### Predefined Metrics:

```typescript
// HTTP Metrics
http_requests_total;
http_request_duration_seconds;
http_errors_total;

// Database Metrics
db_queries_total;
db_query_duration_seconds;

// Business Metrics
users_registered_total;
emails_sent_total;
active_users;

// System Metrics
memory_usage_bytes;
cpu_usage_percent;
```

#### Usage Examples:

```typescript
import { metrics } from "@/lib/metrics";

// Track HTTP request
metrics.trackHttpRequest("POST", "/api/users", 201, 45);

// Track database query
metrics.trackDatabaseQuery("SELECT", "users", 12);

// Track business events
metrics.trackUserRegistration();
metrics.trackEmailSent();

// Custom metrics
metrics.collector.inc("custom_counter", 1);
metrics.collector.set("current_value", 42);
```

### 3. Metrics API (`src/app/api/metrics/route.ts`)

REST API for metrics exposure and management:

#### Endpoints:

- **GET `/api/metrics`**: Retrieve current metrics (JSON format)
- **GET `/api/metrics?format=prometheus`**: Prometheus format
- **POST `/api/metrics`**: Update metrics manually
- **DELETE `/api/metrics`**: Reset all metrics

#### API Examples:

```bash
# Get metrics in JSON format
curl http://localhost:3000/api/metrics

# Get metrics in Prometheus format
curl "http://localhost:3000/api/metrics?format=prometheus"

# Increment a counter
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"action": "increment", "metric": "custom_counter", "value": 1}'

# Reset all metrics
curl -X DELETE http://localhost:3000/api/metrics
```

### 4. Test Interface (`src/app/logging-monitoring-test/page.tsx`)

Interactive testing page for logging and monitoring:

#### Features:

- Real-time metrics visualization
- Log level testing
- Manual metric manipulation
- Configuration overview
- Alert threshold display

## Cloud Platform Configuration

### AWS CloudWatch Setup

#### 1. ECS Task Definition Configuration

Add logging configuration to your task definition:

```json
{
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/medipole-app",
      "awslogs-region": "ap-south-1",
      "awslogs-stream-prefix": "ecs"
    }
  }
}
```

#### 2. CloudWatch Logs Setup

1. Go to CloudWatch → Logs → Log groups
2. Create log group: `/ecs/medipole-app`
3. Set retention period (7-14 days for operational logs)

#### 3. Metric Filters and Alarms

Create metric filters for error tracking:

```
Filter Pattern: { $.level = "error" }
Metric Name: ApplicationErrors
```

Create CloudWatch alarms:

- **High Error Rate**: > 10 errors in 5 minutes
- **High CPU Usage**: > 80% for 5 minutes
- **Slow Response Time**: > 2 seconds average

### Azure Monitor Setup

#### 1. App Service Configuration

1. Go to App Service → Monitoring → Diagnostic settings
2. Enable Application Logging
3. Configure Log Analytics Workspace

#### 2. Custom Metrics

Use Kusto queries for monitoring:

```kql
// Error tracking
AppServiceConsoleLogs
| where Level == "Error"
| summarize count() by bin(TimeGenerated, 1h)

// Request analysis
AppRequests
| where resultCode >= 400
| summarize count() by bin(timestamp, 1h), resultCode
```

#### 3. Alert Rules

Create alert rules in Azure Monitor:

- **HTTP Server Errors**: > 5% error rate
- **High Response Time**: > 2 seconds average
- **Memory Usage**: > 80% utilization

## Best Practices Implemented

### 1. Structured Logging

- **Consistent Format**: JSON structure with standardized fields
- **Correlation IDs**: Request tracing across services
- **Context Enrichment**: Automatic addition of service/component info
- **Level Appropriateness**: Proper use of debug/info/warn/error levels

### 2. Metrics Strategy

- **Four Golden Signals**: Latency, traffic, errors, saturation
- **RED Method**: Rate, Errors, Duration for services
- **USE Method**: Utilization, Saturation, Errors for resources
- **Business Metrics**: User registrations, email delivery, conversions

### 3. Alert Configuration

- **Meaningful Thresholds**: Based on historical data and business impact
- **Multiple Channels**: Email, Slack, SMS notifications
- **Escalation Policies**: Different response times for different severity levels
- **False Positive Reduction**: Proper alert deduplication and grouping

### 4. Retention Strategy

- **Operational Logs**: 7-14 days (troubleshooting)
- **Audit Logs**: 90+ days (compliance)
- **Metrics**: 30-90 days (trend analysis)
- **Archival**: Long-term storage in S3/Blob Storage

## Environment Configuration

### Required Environment Variables

```env
# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
APP_VERSION=1.0.0

# Cloud Platform Configuration
AWS_REGION=ap-south-1
LOG_GROUP_NAME=/ecs/medipole-app
```

### Docker Configuration

```dockerfile
# Enable CloudWatch logging in container
ENV LOG_LEVEL=info
ENV LOG_FORMAT=json
```

## Testing and Validation

### Local Testing

1. Visit `/logging-monitoring-test` to test the implementation
2. Generate test logs at different levels
3. Manipulate metrics manually
4. Verify JSON log structure
5. Check Prometheus format output

### API Testing

```bash
# Test logging endpoint
curl -X POST http://localhost:3000/api/test-logging \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log", "level": "info"}'

# Test metrics collection
curl http://localhost:3000/api/metrics
```

### Cloud Platform Verification

1. **AWS**: Check CloudWatch Logs for structured JSON entries
2. **Azure**: Verify Application Insights telemetry
3. **Prometheus**: Test metric endpoint scraping
4. **Alerts**: Validate alarm triggering and notifications

## Monitoring Dashboard Examples

### Key Metrics to Track

```
Application Layer:
- HTTP Request Rate (requests/second)
- Error Rate (% of requests)
- Response Time (95th percentile)
- Database Query Performance

Infrastructure Layer:
- CPU Utilization (%)
- Memory Usage (bytes)
- Disk I/O Operations
- Network Throughput

Business Layer:
- User Registrations
- Email Delivery Success Rate
- Active User Sessions
- Conversion Rates
```

### Sample Alert Thresholds

- **Critical**: Error rate > 10%, Response time > 5s
- **Warning**: Error rate > 5%, Response time > 2s
- **Info**: CPU usage > 80%, Memory usage > 85%

## Troubleshooting

### Common Issues

#### 1. Missing Logs in CloudWatch

- **Cause**: Incorrect log group configuration
- **Solution**: Verify task definition log configuration

#### 2. Metrics Not Appearing

- **Cause**: Metrics collector not initialized
- **Solution**: Check metrics API endpoint availability

#### 3. Alert Fatigue

- **Cause**: Too many low-priority alerts
- **Solution**: Review and adjust alert thresholds

#### 4. Performance Impact

- **Cause**: Excessive logging or metric collection
- **Solution**: Optimize log levels and sampling rates

### Debugging Steps

1. Check local console output for log format
2. Verify CloudWatch/Azure Monitor configuration
3. Test metrics API endpoints
4. Review alert rule configurations
5. Monitor system resource usage

## Future Enhancements

### Planned Features

1. **Distributed Tracing**: OpenTelemetry integration
2. **Advanced Analytics**: Machine learning for anomaly detection
3. **Multi-tenancy**: Per-tenant metrics and logging
4. **Real-time Dashboards**: Live updating monitoring views
5. **Automated Remediation**: Self-healing based on metrics

### Integration Opportunities

- **Service Mesh**: Istio/Linkerd metrics integration
- **Database Monitoring**: Query performance analytics
- **Frontend Monitoring**: Client-side error tracking
- **Security Monitoring**: Threat detection and response

## Conclusion

This logging and monitoring implementation provides a robust foundation for application observability with structured logging, comprehensive metrics collection, and cloud platform integration. The solution enables proactive issue detection, performance optimization, and data-driven decision making for the Medipole application.
