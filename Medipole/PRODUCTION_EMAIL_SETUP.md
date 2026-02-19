# Production Email Service Setup Guide

## 🚀 Production Configuration Steps

### 1. AWS SES Production Setup

#### Step 1: Create AWS Credentials

1. Log into AWS Console
2. Navigate to IAM → Users
3. Create new user with programmatic access
4. Attach SES sending policy (AmazonSESFullAccess or custom policy)
5. Save the credentials securely

#### Step 2: Verify Domain (Recommended for Production)

1. Go to AWS SES Console
2. Click "Verified Identities"
3. Choose "Domain"
4. Add your domain (e.g., medipole.com)
5. Add the provided DNS records to your domain registrar:
   - DKIM records (3 TXT records)
   - Verification record (1 TXT record)
6. Wait for DNS propagation (5-30 minutes)

#### Step 3: Update Environment Variables

```env
# Production AWS SES Configuration
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=YOUR_REAL_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_REAL_SECRET_KEY
AWS_REGION=ap-south-1
SES_EMAIL_SENDER=notify@medipole.com
SES_SANDBOX_MODE=false
EMAIL_FROM_NAME=Medipole Healthcare
```

### 2. SendGrid Production Setup

#### Step 1: Create SendGrid Account

1. Sign up at sendgrid.com
2. Complete sender verification:
   - Go to Settings → Sender Authentication
   - Verify single sender OR domain authentication

#### Step 2: Domain Authentication (Recommended)

1. In SendGrid dashboard, go to Sender Authentication
2. Click "Authenticate your domain"
3. Add domain (e.g., medipole.com)
4. Add provided DNS records:
   - CNAME records for domain authentication
   - SPF and DKIM records
5. Verify completion in SendGrid console

#### Step 3: Generate API Key

1. Go to Settings → API Keys
2. Create API Key with "Mail Send" permissions
3. Copy the key (won't be shown again)

#### Step 4: Update Environment Variables

```env
# Production SendGrid Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=YOUR_REAL_SENDGRID_API_KEY
SENDGRID_SENDER=notify@medipole.com
SENDGRID_SANDBOX_MODE=false
EMAIL_FROM_NAME=Medipole Healthcare
```

### 3. DNS Configuration Example

Add these records to your domain registrar:

#### For AWS SES Domain Verification:

```
Type: TXT
Name: _amazonses.medipole.com
Value: a1b2c3d4e5f6g7h8i9j0klm

Type: TXT
Name: medipole.com
Value: v=spf1 include:amazonses.com ~all

DKIM Records (3 CNAME records):
Type: CNAME
Name: somestring._domainkey.medipole.com
Value: somestring.dkim.amazonses.com
```

#### For SendGrid Domain Authentication:

```
Type: CNAME
Name: s1._domainkey.medipole.com
Value: s1.domainkey.sendgrid.net

Type: CNAME
Name: s2._domainkey.medipole.com
Value: s2.domainkey.sendgrid.net

Type: CNAME
Name: em12345.medipole.com
Value: sendgrid.net

Type: TXT
Name: medipole.com
Value: v=spf1 include:sendgrid.net ~all
```

### 4. Production Environment Variables File

Create `production.env`:

```env
# =============================================
# PRODUCTION EMAIL SERVICE CONFIGURATION
# =============================================

# Choose ONE provider:
EMAIL_PROVIDER=ses
# OR
# EMAIL_PROVIDER=sendgrid

# AWS SES PRODUCTION (uncomment if using SES)
# AWS_ACCESS_KEY_ID=your-actual-access-key
# AWS_SECRET_ACCESS_KEY=your-actual-secret-key
# AWS_REGION=ap-south-1
# SES_EMAIL_SENDER=notify@medipole.com
# SES_SANDBOX_MODE=false

# SendGrid PRODUCTION (uncomment if using SendGrid)
# SENDGRID_API_KEY=your-actual-sendgrid-api-key
# SENDGRID_SENDER=notify@medipole.com
# SENDGRID_SANDBOX_MODE=false

# Generic Email Config
EMAIL_FROM_NAME=Medipole Healthcare
EMAIL_REPLY_TO=support@medipole.com

# =============================================
# OTHER PRODUCTION CONFIGURATION
# =============================================
DATABASE_URL=your-production-database-url
JWT_SECRET=your-secure-jwt-secret
NEXT_PUBLIC_API_URL=https://api.medipole.com
```

### 5. Deployment Checklist

#### ✅ Pre-Deployment

- [ ] Domain verified with email provider
- [ ] DNS records propagated and verified
- [ ] Production API keys generated
- [ ] Environment variables configured
- [ ] Test email sent successfully
- [ ] Error handling verified
- [ ] Logging configured for production

#### ✅ Post-Deployment

- [ ] Health check endpoint returns success
- [ ] Test email delivery to real addresses
- [ ] Monitor delivery rates and bounces
- [ ] Set up email delivery alerts
- [ ] Configure rate limiting monitoring

### 6. Testing Production Setup

#### Health Check:

```bash
curl -X GET https://your-domain.com/api/email
```

Expected Response:

```json
{
  "success": true,
  "message": "Email service is configured and ready",
  "config": {
    "provider": "ses",
    "from": "notify@medipole.com",
    "fromName": "Medipole Healthcare",
    "sandboxMode": false
  }
}
```

#### Test Email:

```bash
curl -X POST https://your-domain.com/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "real-email@domain.com",
    "subject": "Production Test - Welcome to Medipole!",
    "template": "welcome",
    "templateData": {
      "userName": "Production User",
      "verificationLink": "https://medipole.com/verify/prod-test"
    }
  }'
```

### 7. Monitoring and Maintenance

#### Key Metrics to Monitor:

- Delivery rate (% of emails successfully delivered)
- Bounce rate (% of emails that bounced)
- Complaint rate (% of spam complaints)
- Open rate (if tracking enabled)

#### AWS SES Limits:

- Initial: 14 emails/second
- Can request increase through AWS Support
- Monitor sending quota in SES console

#### SendGrid Limits:

- Free tier: 100 emails/day
- Pro plans: Higher limits based on subscription
- Monitor usage in SendGrid dashboard

### 8. Security Best Practices

#### Credential Management:

- Never commit `.env` files to version control
- Use AWS Secrets Manager or similar for credential storage
- Rotate API keys every 90 days
- Use IAM roles instead of access keys when possible

#### Email Security:

- Implement proper SPF, DKIM, and DMARC records
- Use verified domains instead of email addresses
- Monitor for suspicious sending patterns
- Set up alerts for high bounce/complaint rates

### 9. Troubleshooting Common Issues

#### Authentication Errors:

```
Error: "The security token included in the request is invalid"
Solution: Verify AWS credentials are correct and have proper SES permissions
```

#### Domain Verification Issues:

```
Error: "Email address is not verified"
Solution: Check DNS records and wait for propagation, verify in provider console
```

#### Rate Limiting:

```
Error: "Throttling: Rate exceeded"
Solution: Implement exponential backoff, request limit increase from provider
```

#### Delivery Issues:

```
Email not arriving in inbox
Solution: Check spam folder, verify SPF/DKIM setup, monitor bounce reports
```

### 10. Emergency Procedures

#### If emails stop sending:

1. Check health endpoint: `GET /api/email`
2. Review server logs for error messages
3. Verify API keys haven't expired
4. Check provider status pages (AWS Status, SendGrid Status)
5. Monitor sending quotas and limits

#### If high bounce rates detected:

1. Immediately pause sending
2. Review recipient list for invalid addresses
3. Check for spam complaints
4. Verify domain reputation
5. Contact provider support if needed

This guide provides everything needed to move your email service from development to production safely and securely.
