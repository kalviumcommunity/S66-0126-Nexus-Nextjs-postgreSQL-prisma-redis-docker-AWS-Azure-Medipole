#!/bin/bash

# Email Service Test Script
# This script tests the email service API endpoints

echo "📧 Medipole Email Service Test Script"
echo "====================================="

# Configuration
BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/email"

# Test email address (replace with your test email)
TEST_EMAIL="test@example.com"

echo "🔧 Testing email service health check..."
echo

# Test 1: Health check
echo "1. Health Check Test"
echo "--------------------"
response=$(curl -s -w "%{http_code}" -X GET "$API_URL")
http_code="${response: -3}"
body="${response%???}"

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo

# Test 2: Welcome email template
echo "2. Welcome Email Test"
echo "--------------------"
read -p "Enter test email address (or press Enter for $TEST_EMAIL): " email_input
TEST_EMAIL="${email_input:-$TEST_EMAIL}"

welcome_data=$(cat <<EOF
{
  "to": "$TEST_EMAIL",
  "subject": "Welcome to Medipole! 🎉",
  "template": "welcome",
  "templateData": {
    "userName": "Test User",
    "verificationLink": "https://medipole.com/verify/abc123"
  }
}
EOF
)

echo "Sending welcome email to: $TEST_EMAIL"
echo "Request data:"
echo "$welcome_data" | jq '.' 2>/dev/null || echo "$welcome_data"
echo

response=$(curl -s -w "%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$welcome_data")

http_code="${response: -3}"
body="${response%???}"

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo

# Test 3: Password reset email
echo "3. Password Reset Email Test"
echo "---------------------------"
reset_data=$(cat <<EOF
{
  "to": "$TEST_EMAIL",
  "subject": "Password Reset Request 🔐",
  "template": "passwordReset",
  "templateData": {
    "userName": "Test User",
    "resetLink": "https://medipole.com/reset-password/xyz789",
    "expiryHours": 2
  }
}
EOF
)

echo "Sending password reset email to: $TEST_EMAIL"
echo "Request data:"
echo "$reset_data" | jq '.' 2>/dev/null || echo "$reset_data"
echo

response=$(curl -s -w "%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$reset_data")

http_code="${response: -3}"
body="${response%???}"

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo

# Test 4: Notification email
echo "4. Notification Email Test"
echo "-------------------------"
notification_data=$(cat <<EOF
{
  "to": "$TEST_EMAIL",
  "subject": "Blood Request Update 🩸",
  "template": "notification",
  "templateData": {
    "userName": "Test User",
    "title": "Blood Request Status",
    "message": "Your blood donation request has been approved and scheduled for tomorrow at 9:00 AM.",
    "actionLink": "https://medipole.com/dashboard",
    "actionText": "View Dashboard"
  }
}
EOF
)

echo "Sending notification email to: $TEST_EMAIL"
echo "Request data:"
echo "$notification_data" | jq '.' 2>/dev/null || echo "$notification_data"
echo

response=$(curl -s -w "%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$notification_data")

http_code="${response: -3}"
body="${response%???}"

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo

# Test 5: Custom HTML email
echo "5. Custom HTML Email Test"
echo "------------------------"
custom_html=$(cat <<'EOF'
<h1 style="color: #2563eb;">Custom Email Test</h1>
<p>This is a test email sent with custom HTML content.</p>
<p>Current time: <strong>$(date)</strong></p>
EOF
)

custom_data=$(cat <<EOF
{
  "to": "$TEST_EMAIL",
  "subject": "Custom HTML Email Test",
  "html": "$custom_html"
}
EOF
)

echo "Sending custom HTML email to: $TEST_EMAIL"
echo

response=$(curl -s -w "%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$custom_data")

http_code="${response: -3}"
body="${response%???}"

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo

# Test 6: Validation error test
echo "6. Validation Error Test"
echo "-----------------------"
invalid_data='{"to": "invalid-email", "subject": ""}'

echo "Sending invalid request data:"
echo "$invalid_data"
echo

response=$(curl -s -w "%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$invalid_data")

http_code="${response: -3}"
body="${response%???}"

echo "Response Code: $http_code"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo

echo "✅ Email Service Testing Complete!"
echo
echo "📋 Next Steps:"
echo "1. Check your inbox for delivered emails"
echo "2. Verify message IDs in the console logs"
echo "3. Check server console for detailed logging"
echo "4. Review any error messages above"
echo
echo "📝 Notes:"
echo "- For AWS SES sandbox mode, both sender and recipient emails must be verified"
echo "- For SendGrid, sender email must be verified"
echo "- Check .env configuration if tests fail"
echo "- Message IDs help track email delivery status"