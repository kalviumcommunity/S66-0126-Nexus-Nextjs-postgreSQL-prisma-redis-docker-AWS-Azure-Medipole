# Email Service Documentation

## Overview

The Medipole email service provides a robust solution for sending transactional emails through either AWS SES or SendGrid. This service includes pre-built templates, comprehensive error handling, and detailed logging for reliable email delivery.

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root with the following configuration:

For AWS SES:

```env
# Email Service Configuration
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
SES_EMAIL_SENDER=no-reply@yourdomain.com
SES_SANDBOX_MODE=true
EMAIL_FROM_NAME=Medipole
```

For SendGrid:

```env
# Email Service Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_SENDER=no-reply@yourdomain.com
SENDGRID_SANDBOX_MODE=true
EMAIL_FROM_NAME=Medipole
```

### 2. Provider Setup

#### AWS SES Setup

1. Create an AWS account and navigate to SES service
2. Verify your sender email address or domain in "Verified Identities"
3. Create IAM user with SES sending permissions
4. Get Access Key ID and Secret Access Key
5. Set up in .env.local as shown above

#### SendGrid Setup

1. Create a SendGrid account
2. Navigate to Settings → Sender Authentication
3. Verify your sender email/domain
4. Create API key with "Mail Send" permissions
5. Set up in .env.local as shown above

### 3. Starting the Application

```bash
npm run dev
```

## API Endpoints

### Health Check

```bash
GET /api/email
```

**Response:**

```json
{
  "success": true,
  "message": "Email service is configured and ready",
  "config": {
    "provider": "ses",
    "from": "no-reply@yourdomain.com",
    "fromName": "Medipole",
    "sandboxMode": true
  }
}
```

### Send Email

```bash
POST /api/email
```

**Request Body:**

```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "template": "welcome",
  "templateData": {
    "userName": "John Doe",
    "verificationLink": "https://medipole.com/verify/abc123"
  }
}
```

**Response:**

```json
{
  "success": true,
  "messageId": "0101018d-1234abcd-1234-abcd-1234-abcdef123456",
  "provider": "ses",
  "sandboxMode": true
}
```

## Email Templates

### 1. Welcome Template

```json
{
  "template": "welcome",
  "templateData": {
    "userName": "User Name",
    "verificationLink": "https://yourdomain.com/verify/token"
  }
}
```

### 2. Password Reset Template

```json
{
  "template": "passwordReset",
  "templateData": {
    "userName": "User Name",
    "resetLink": "https://yourdomain.com/reset-password/token",
    "expiryHours": 24
  }
}
```

### 3. Notification Template

```json
{
  "template": "notification",
  "templateData": {
    "userName": "User Name",
    "title": "Notification Title",
    "message": "Notification message content",
    "actionLink": "https://yourdomain.com/action",
    "actionText": "Click Here"
  }
}
```

### 4. Custom HTML

```json
{
  "to": "recipient@example.com",
  "subject": "Custom Email",
  "html": "<h1>Custom HTML content</h1><p>Any HTML content here</p>"
}
```

## Testing

### Using the Test Script

```bash
./test-email-service.sh
```

### Manual Testing with curl

```bash
# Health check
curl -X GET http://localhost:3000/api/email

# Send welcome email
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Welcome Test",
    "template": "welcome",
    "templateData": {
      "userName": "Test User",
      "verificationLink": "https://medipole.com/verify/123"
    }
  }'
```

### Using Postman

1. Create POST request to `http://localhost:3000/api/email`
2. Set Content-Type header to `application/json`
3. Use any of the request body examples above

## Verification and Logging

### Console Output

Successful email sending will show:

```
info: Sending email to recipient@example.com via ses
info: Email sent via SES Message ID: 0101018d-1234abcd...
```

### Message ID Tracking

Each email response includes a `messageId` that can be used to track delivery status:

- **AWS SES**: Message ID from SES response
- **SendGrid**: Message ID from headers

### Inbox Verification

Check recipient inbox for delivered emails and verify:

- Subject line matches
- HTML content renders correctly
- Links work properly
- Branding and styling is correct

## Sandbox vs Production

### AWS SES

- **Sandbox Mode**: Both sender and recipient emails must be verified
- **Production**: Full sending capabilities to any verified domain
- Limit: 14 emails per second initially

### SendGrid

- **Sandbox Mode**: Requires sender verification
- **Production**: Verified accounts get 100 emails/day free tier
- Upgrade plans for higher sending limits

### Environment Switching

```bash
# Sandbox/Testing
SES_SANDBOX_MODE=true
# or
SENDGRID_SANDBOX_MODE=true

# Production
SES_SANDBOX_MODE=false
# or
SENDGRID_SANDBOX_MODE=false
```

## Production Considerations

### Rate Limiting

- Implement queue/buffering for bulk sends
- AWS SES: ~14 emails/sec initial rate
- Add retries for throttled requests
- Use AWS SES burst rate options (contact AWS)

### Error Handling

- Monitor delivery failures and bounces
- Implement retry logic with exponential backoff
- Log all failed attempts for debugging
- Set up alerts for high failure rates

### Security

- Never commit `.env.local` to version control
- Rotate API keys regularly
- Use IAM roles instead of access keys when possible
- Implement proper authentication for email endpoints

### Monitoring

- Track delivery rates and bounce rates
- Monitor email service health endpoints
- Set up logging for all email operations
- Implement metrics collection for analytics

## Common Issues and Troubleshooting

### Configuration Errors

```
Error: Email service not configured properly
```

**Solution**: Check `.env.local` variables and ensure all required fields are set

### AWS SES Sandbox Errors

```
Error: Email address is not verified
```

**Solution**: Verify both sender and recipient emails in AWS SES console

### SendGrid Authentication Errors

```
Error: Unauthorized
```

**Solution**: Verify SendGrid API key and sender verification

### Template Validation Errors

```
Error: resetLink is required for password reset template
```

**Solution**: Ensure all required template fields are provided

## Integration Examples

### User Signup Flow

```javascript
// After successful user registration
const response = await fetch("/api/email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: user.email,
    subject: "Welcome to Medipole!",
    template: "welcome",
    templateData: {
      userName: user.name,
      verificationLink: `${BASE_URL}/verify/${user.verificationToken}`,
    },
  }),
});
```

### Password Reset Flow

```javascript
// When user requests password reset
const response = await fetch("/api/email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: userEmail,
    subject: "Password Reset Request",
    template: "passwordReset",
    templateData: {
      userName: user.name,
      resetLink: `${BASE_URL}/reset-password/${resetToken}`,
      expiryHours: 24,
    },
  }),
});
```

## Support

For issues with email service integration, check:

1. Server console logs for detailed error messages
2. Provider-specific dashboards (AWS SES/SendGrid)
3. Email service configuration in `.env.local`
4. Network connectivity and firewall settings
