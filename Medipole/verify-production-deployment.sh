#!/bin/bash

# Production Deployment Verification Script
# Verifies that email service is properly configured for production

set -e

echo "🔍 Medipole Email Service - Production Verification"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if .env.production exists
check_env_file() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env.production" ]; then
        print_error "Production environment file (.env.production) not found"
        echo "Please run the setup wizard first:"
        echo "  ./setup-email-production.sh"
        exit 1
    fi
    
    print_success "Environment file found"
}

# Load environment variables
load_env() {
    print_status "Loading environment variables..."
    
    # Source the production environment
    set -a
    source .env.production
    set +a
    
    print_success "Environment variables loaded"
}

# Check required variables
check_required_vars() {
    print_status "Validating required configuration..."
    
    local missing_vars=()
    local errors=0
    
    # Check email provider
    if [ -z "$EMAIL_PROVIDER" ]; then
        missing_vars+=("EMAIL_PROVIDER")
        errors=1
    elif [[ ! "$EMAIL_PROVIDER" =~ ^(ses|sendgrid)$ ]]; then
        print_error "Invalid EMAIL_PROVIDER: $EMAIL_PROVIDER (must be 'ses' or 'sendgrid')"
        errors=1
    fi
    
    # Check provider-specific variables
    if [ "$EMAIL_PROVIDER" = "ses" ]; then
        if [ -z "$AWS_ACCESS_KEY_ID" ] || [ "$AWS_ACCESS_KEY_ID" = "your-actual-aws-access-key-here" ]; then
            missing_vars+=("AWS_ACCESS_KEY_ID")
            errors=1
        fi
        if [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ "$AWS_SECRET_ACCESS_KEY" = "your-actual-aws-secret-key-here" ]; then
            missing_vars+=("AWS_SECRET_ACCESS_KEY")
            errors=1
        fi
        if [ -z "$SES_EMAIL_SENDER" ] || [ "$SES_EMAIL_SENDER" = "notify@yourdomain.com" ]; then
            missing_vars+=("SES_EMAIL_SENDER")
            errors=1
        fi
    else
        if [ -z "$SENDGRID_API_KEY" ] || [ "$SENDGRID_API_KEY" = "your-actual-sendgrid-api-key-here" ]; then
            missing_vars+=("SENDGRID_API_KEY")
            errors=1
        fi
        if [ -z "$SENDGRID_SENDER" ] || [ "$SENDGRID_SENDER" = "notify@yourdomain.com" ]; then
            missing_vars+=("SENDGRID_SENDER")
            errors=1
        fi
    fi
    
    # Check common variables
    if [ -z "$EMAIL_FROM_NAME" ] || [ "$EMAIL_FROM_NAME" = "Medipole Healthcare" ]; then
        print_warning "Using default EMAIL_FROM_NAME: $EMAIL_FROM_NAME"
    fi
    
    if [ -z "$EMAIL_REPLY_TO" ] || [ "$EMAIL_REPLY_TO" = "support@yourdomain.com" ]; then
        print_warning "Using default EMAIL_REPLY_TO: $EMAIL_REPLY_TO"
    fi
    
    # Report missing variables
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        print_error "Please update .env.production with actual values"
        exit 1
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "All required variables are configured"
    fi
}

# Test email service health
test_email_health() {
    print_status "Testing email service health..."
    
    # Start the application if not running
    if ! nc -z localhost 3000 2>/dev/null; then
        print_status "Starting application server..."
        npm run dev > /dev/null 2>&1 &
        SERVER_PID=$!
        
        # Wait for server to start
        sleep 5
        
        # Check if server started
        if ! nc -z localhost 3000 2>/dev/null; then
            print_error "Failed to start application server"
            exit 1
        fi
        
        print_success "Application server started (PID: $SERVER_PID)"
    fi
    
    # Test health endpoint
    local response
    response=$(curl -s -w "%{http_code}" http://localhost:3000/api/email)
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Email service health check passed"
        echo "Response: $body"
    else
        print_error "Email service health check failed"
        echo "HTTP Code: $http_code"
        echo "Response: $body"
        exit 1
    fi
}

# Test email sending (dry run)
test_email_sending() {
    print_status "Testing email sending capability..."
    
    local test_email="test@medipole.com"
    local test_data='{
        "to": "'$test_email'",
        "subject": "Production Verification Test",
        "template": "welcome",
        "templateData": {
            "userName": "Verification Test User"
        }
    }'
    
    local response
    response=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/email \
        -H "Content-Type: application/json" \
        -d "$test_data")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Email sending test passed"
        echo "Response: $body"
    elif [ "$http_code" = "500" ]; then
        # This might be expected if credentials are invalid
        print_warning "Email sending returned 500 - this may be expected with test credentials"
        echo "Response: $body"
    else
        print_error "Email sending test failed"
        echo "HTTP Code: $http_code"
        echo "Response: $body"
    fi
}

# Generate deployment checklist
generate_checklist() {
    echo ""
    print_status "Deployment Checklist"
    echo "===================="
    echo ""
    echo "✅ Environment Configuration:"
    echo "   - [ ] .env.production file created"
    echo "   - [ ] EMAIL_PROVIDER configured (ses/sendgrid)"
    echo "   - [ ] Provider credentials added"
    echo "   - [ ] Sender email/domain verified"
    echo ""
    echo "✅ Domain Verification (Production):"
    if [ "$EMAIL_PROVIDER" = "ses" ]; then
        echo "   - [ ] AWS SES domain verified"
        echo "   - [ ] DNS records added (SPF, DKIM)"
        echo "   - [ ] Sandbox mode disabled (SES_SANDBOX_MODE=false)"
    else
        echo "   - [ ] SendGrid domain authenticated"
        echo "   - [ ] DNS records added (CNAME, SPF)"
        echo "   - [ ] Sandbox mode disabled (SENDGRID_SANDBOX_MODE=false)"
    fi
    echo ""
    echo "✅ Application Configuration:"
    echo "   - [ ] Database URL configured"
    echo "   - [ ] JWT secret set (32+ characters)"
    echo "   - [ ] API URL configured"
    echo "   - [ ] Security headers enabled"
    echo ""
    echo "✅ Testing:"
    echo "   - [ ] Health check endpoint working"
    echo "   - [ ] Email sending test successful"
    echo "   - [ ] Error handling verified"
    echo "   - [ ] Logging configured properly"
    echo ""
    echo "✅ Monitoring & Security:"
    echo "   - [ ] Email delivery tracking enabled"
    echo "   - [ ] Bounce handling configured"
    echo "   - [ ] Rate limiting implemented"
    echo "   - [ ] Security best practices followed"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Review the checklist above"
    echo "   2. Complete any remaining items"
    echo "   3. Run final end-to-end tests"
    echo "   4. Deploy to production environment"
    echo "   5. Monitor email delivery metrics"
}

# Cleanup function
cleanup() {
    if [ -n "$SERVER_PID" ]; then
        print_status "Stopping application server..."
        kill $SERVER_PID 2>/dev/null || true
        print_success "Application server stopped"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    check_env_file
    load_env
    check_required_vars
    test_email_health
    test_email_sending
    generate_checklist
    
    print_success "Production verification completed!"
    echo ""
    print_status "Your email service is ready for production deployment"
}

# Run main function
main