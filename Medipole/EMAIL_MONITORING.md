# Production Monitoring and Alerting Setup

## 📊 Monitoring Dashboard Configuration

### 1. Email Service Metrics to Monitor

#### Core Email Metrics:
- **Delivery Rate**: Percentage of emails successfully delivered
- **Bounce Rate**: Percentage of emails that bounced
- **Complaint Rate**: Percentage of spam complaints
- **Open Rate**: Percentage of emails opened (if tracking enabled)
- **Click Rate**: Percentage of links clicked (if tracking enabled)

#### Performance Metrics:
- **Send Time**: Average time to send emails
- **Retry Rate**: Percentage of emails requiring retries
- **Error Rate**: API error frequency
- **Throughput**: Emails sent per minute/hour

### 2. AWS CloudWatch Setup (for AWS SES)

#### Create Email Monitoring Dashboard:
```bash
# Install AWS CLI if not already installed
brew install awscli

# Configure AWS CLI
aws configure
```

#### CloudWatch Metrics Configuration:
```json
{
  "DashboardName": "Medipole-Email-Monitoring",
  "DashboardBody": "{\"widgets\":[
    {
      \"type\":\"metric\",
      \"x\":0,\"y\":0,\"width\":12,\"height\":6,
      \"properties\":{
        \"metrics\":[
          [\"AWS/SES\",\"Send\"] ,
          [\"AWS/SES\",\"Delivery\"] ,
          [\"AWS/SES\",\"Bounce\"] ,
          [\"AWS/SES\",\"Complaint\"]
        ],
        \"view\":\"timeSeries\",
        \"stacked\":false,
        \"region\":\"ap-south-1\",
        \"title\":\"Email Delivery Metrics\",
        \"period\":300
      }
    },
    {
      \"type\":\"metric\",
      \"x\":12,\"y\":0,\"width\":12,\"height\":6,
      \"properties\":{
        \"metrics\":[
          [\"AWS/SES\",\"Reputation.BounceRate\"],
          [\"AWS/SES\",\"Reputation.ComplaintRate\"]
        ],
        \"view\":\"timeSeries\",
        \"stacked\":false,
        \"region\":\"ap-south-1\",
        \"title\":\"Email Reputation Metrics\",
        \"period\":300
      }
    }
  ]}"
}
```

#### CloudWatch Alarms:
```bash
# High Bounce Rate Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "High-Bounce-Rate" \
    --alarm-description "Alert when bounce rate exceeds 5%" \
    --metric-name "Reputation.BounceRate" \
    --namespace "AWS/SES" \
    --statistic "Average" \
    --period 300 \
    --threshold 5.0 \
    --comparison-operator "GreaterThanThreshold" \
    --alarm-actions "arn:aws:sns:ap-south-1:YOUR_ACCOUNT:Email-Alerts"

# High Complaint Rate Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "High-Complaint-Rate" \
    --alarm-description "Alert when complaint rate exceeds 0.1%" \
    --metric-name "Reputation.ComplaintRate" \
    --namespace "AWS/SES" \
    --statistic "Average" \
    --period 300 \
    --threshold 0.1 \
    --comparison-operator "GreaterThanThreshold" \
    --alarm-actions "arn:aws:sns:ap-south-1:YOUR_ACCOUNT:Email-Alerts"
```

### 3. SendGrid Monitoring Setup

#### SendGrid Event Webhook Configuration:
1. Go to Settings → Mail Settings
2. Enable "Event Notification"
3. Set HTTP POST URL: `https://yourdomain.com/api/email/webhook`
4. Select events to track:
   - Delivered
   - Opened
   - Clicked
   - Bounced
   - Spam Report

#### Create Webhook Handler:
```typescript
// src/app/api/email/webhook/route.ts
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const events = await req.json();
    
    for (const event of events) {
      switch (event.event) {
        case "delivered":
          logger.info("Email delivered", { 
            messageId: event.message_id,
            email: event.email,
            timestamp: event.timestamp
          });
          break;
          
        case "bounce":
          logger.warn("Email bounced", {
            messageId: event.message_id,
            email: event.email,
            reason: event.reason,
            timestamp: event.timestamp
          });
          // Add to bounce handling logic
          break;
          
        case "spam_report":
          logger.error("Spam complaint received", {
            messageId: event.message_id,
            email: event.email,
            timestamp: event.timestamp
          });
          // Add to suppression list
          break;
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Webhook processing failed", { error });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

### 4. Application-Level Monitoring

#### Enhanced Logging Configuration:
```typescript
// src/lib/email-monitoring.ts
import { logger } from "./logger";

export class EmailMonitoring {
  static logDelivery(email: string, messageId: string, provider: string) {
    logger.info("Email delivered successfully", {
      email,
      messageId,
      provider,
      timestamp: new Date().toISOString(),
    });
  }

  static logBounce(email: string, messageId: string, reason: string) {
    logger.warn("Email bounced", {
      email,
      messageId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  static logComplaint(email: string, messageId: string) {
    logger.error("Spam complaint received", {
      email,
      messageId,
      timestamp: new Date().toISOString(),
    });
  }

  static logError(email: string, error: string, attempt: number) {
    logger.error("Email sending error", {
      email,
      error,
      attempt,
      timestamp: new Date().toISOString(),
    });
  }

  static getMetrics() {
    // Return current metrics for dashboard
    return {
      totalSent: 0,
      delivered: 0,
      bounced: 0,
      complaints: 0,
      errorRate: 0,
    };
  }
}
```

### 5. Alerting Configuration

#### Slack Integration:
```bash
# Create Slack webhook for alerts
# Add to your .env.production:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

#### Alert Service Implementation:
```typescript
// src/lib/alerts.ts
import { logger } from "./logger";

export class AlertService {
  static async sendSlackAlert(message: string, channel: string = "email-alerts") {
    if (!process.env.SLACK_WEBHOOK_URL) {
      logger.warn("Slack webhook URL not configured");
      return;
    }

    try {
      const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          text: `🚨 Email Alert: ${message}`,
          attachments: [
            {
              color: "danger",
              fields: [
                {
                  title: "Timestamp",
                  value: new Date().toISOString(),
                  short: true,
                },
                {
                  title: "Environment",
                  value: process.env.NODE_ENV || "unknown",
                  short: true,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }
    } catch (error) {
      logger.error("Failed to send Slack alert", { error });
    }
  }

  static async sendHighBounceAlert(bounceRate: number) {
    await this.sendSlackAlert(
      `High bounce rate detected: ${bounceRate.toFixed(2)}%`,
      "critical-alerts"
    );
  }

  static async sendComplaintAlert(email: string) {
    await this.sendSlackAlert(
      `Spam complaint received for: ${email}`,
      "critical-alerts"
    );
  }
}
```

### 6. Daily Reports

#### Automated Daily Summary:
```typescript
// src/app/api/email/report/route.ts
import { NextResponse } from "next/server";
import { EmailMonitoring } from "@/lib/email-monitoring";
import { AlertService } from "@/lib/alerts";

export async function GET() {
  try {
    const metrics = EmailMonitoring.getMetrics();
    
    // Send daily report
    const report = `
📊 Daily Email Service Report
============================
Date: ${new Date().toISOString().split('T')[0]}

📈 Metrics:
- Total Emails Sent: ${metrics.totalSent}
- Delivery Rate: ${((metrics.delivered / metrics.totalSent) * 100 || 0).toFixed(2)}%
- Bounce Rate: ${((metrics.bounced / metrics.totalSent) * 100 || 0).toFixed(2)}%
- Complaint Rate: ${((metrics.complaints / metrics.totalSent) * 100 || 0).toFixed(2)}%
- Error Rate: ${metrics.errorRate.toFixed(2)}%

⚠️ Issues:
- High bounce rate: ${metrics.bounced > metrics.totalSent * 0.05 ? 'YES' : 'NO'}
- Spam complaints: ${metrics.complaints > 0 ? 'YES' : 'NO'}
`;

    // Send to Slack or email
    await AlertService.sendSlackAlert(report, "email-reports");
    
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 7. Health Check Endpoint Enhancement

```typescript
// Enhanced health check with metrics
export async function GET() {
  try {
    const emailService = createEmailService();
    const metrics = EmailMonitoring.getMetrics();
    
    if (!emailService) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email service not configured",
          config: {
            provider: process.env.EMAIL_PROVIDER || "not set",
          }
        }, 
        { status: 500 }
      );
    }

    const config = emailService.getConfig();
    
    return NextResponse.json({
      success: true,
      message: "Email service is configured and ready",
      config: {
        provider: config.provider,
        from: config.from,
        fromName: config.fromName,
        sandboxMode: config.sandboxMode,
      },
      metrics: {
        totalSent: metrics.totalSent,
        delivered: metrics.delivered,
        bounced: metrics.bounced,
        complaints: metrics.complaints,
        deliveryRate: ((metrics.delivered / metrics.totalSent) * 100 || 0).toFixed(2) + "%",
        bounceRate: ((metrics.bounced / metrics.totalSent) * 100 || 0).toFixed(2) + "%",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(error, { endpoint: "/api/email", method: "GET" });
  }
}
```

### 8. Cron Job Setup for Daily Reports

Add to your deployment configuration:

```bash
# Daily report at 9 AM
0 9 * * * curl -s https://yourdomain.com/api/email/report > /dev/null 2>&1

# Health check every 5 minutes
*/5 * * * * curl -s https://yourdomain.com/api/email > /dev/null 2>&1
```

### 9. Monitoring Dashboard Example

Create a simple dashboard page:

```typescript
// src/app/dashboard/email-monitoring/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function EmailMonitoringDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/email');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Email Service Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Sent</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics?.metrics?.totalSent || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Delivery Rate</h3>
          <p className="text-3xl font-bold text-green-600">{metrics?.metrics?.deliveryRate || '0%'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Bounce Rate</h3>
          <p className="text-3xl font-bold text-yellow-600">{metrics?.metrics?.bounceRate || '0%'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Complaints</h3>
          <p className="text-3xl font-bold text-red-600">{metrics?.metrics?.complaints || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Service Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">Provider:</span>
            <span className="ml-2 font-medium">{metrics?.config?.provider}</span>
          </div>
          <div>
            <span className="text-gray-500">From Email:</span>
            <span className="ml-2 font-medium">{metrics?.config?.from}</span>
          </div>
          <div>
            <span className="text-gray-500">Sandbox Mode:</span>
            <span className="ml-2 font-medium">{metrics?.config?.sandboxMode ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

This monitoring setup provides comprehensive visibility into your email service performance and helps maintain high deliverability rates in production.