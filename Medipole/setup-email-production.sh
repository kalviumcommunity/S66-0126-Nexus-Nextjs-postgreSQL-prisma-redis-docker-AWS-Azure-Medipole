#!/bin/bash

# Production Email Service Setup Wizard
# This script guides you through setting up production email configuration

set -e  # Exit on any error

echo "🚀 Medipole Email Service - Production Setup Wizard"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running on macOS or Linux
OS_TYPE=$(uname)
print_status "Detected OS: $OS_TYPE"

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to validate email format
validate_email() {
    local email=$1
    if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate domain format
validate_domain() {
    local domain=$1
    if [[ $domain =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Main setup function
main_setup() {
    print_status "Starting production email setup..."
    
    # Ask for provider choice
    echo ""
    print_status "Which email provider would you like to use?"
    echo "1) AWS SES (Amazon Simple Email Service)"
    echo "2) SendGrid"
    echo ""
    
    read -p "Enter your choice (1 or 2): " provider_choice
    
    case $provider_choice in
        1)
            setup_aws_ses
            ;;
        2)
            setup_sendgrid
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    # Configure common settings
    configure_common_settings
    
    # Generate final configuration
    generate_final_config
    
    print_success "Production setup completed!"
    print_status "Next steps:"
    echo "  1. Review the generated .env.production file"
    echo "  2. Add your actual API credentials"
    echo "  3. Verify your domain with the email provider"
    echo "  4. Test the configuration with: npm run test:email"
    echo ""
    print_warning "Remember to never commit .env.production to version control!"
}

# AWS SES Setup
setup_aws_ses() {
    echo ""
    print_status "Setting up AWS SES..."
    
    # Get AWS credentials
    echo "You'll need AWS Access Key ID and Secret Access Key with SES permissions."
    echo "If you don't have these, follow these steps:"
    echo "  1. Log into AWS Console"
    echo "  2. Go to IAM → Users"
    echo "  3. Create new user with programmatic access"
    echo "  4. Attach AmazonSESFullAccess policy or create custom SES policy"
    echo ""
    
    read -p "Enter your AWS Access Key ID: " aws_access_key
    read -sp "Enter your AWS Secret Access Key: " aws_secret_key
    echo ""
    
    # Validate inputs
    if [ -z "$aws_access_key" ] || [ -z "$aws_secret_key" ]; then
        print_error "Both AWS credentials are required"
        exit 1
    fi
    
    # Get region
    echo ""
    echo "Available AWS regions for SES:"
    echo "  ap-south-1  (Mumbai) - Recommended for India"
    echo "  us-east-1   (N. Virginia)"
    echo "  us-west-2   (Oregon)"
    echo "  eu-west-1   (Ireland)"
    echo ""
    read -p "Enter AWS region (default: ap-south-1): " aws_region
    aws_region=${aws_region:-ap-south-1}
    
    # Get sender email/domain
    echo ""
    print_status "For production, you need to verify your domain (not individual email)."
    print_status "This provides better deliverability and removes sandbox restrictions."
    echo ""
    read -p "Enter your verified domain (e.g., medipole.com): " verified_domain
    
    if ! validate_domain "$verified_domain"; then
        print_error "Invalid domain format"
        exit 1
    fi
    
    # Store AWS configuration
    AWS_ACCESS_KEY_ID=$aws_access_key
    AWS_SECRET_ACCESS_KEY=$aws_secret_key
    AWS_REGION=$aws_region
    SES_EMAIL_SENDER="notify@$verified_domain"
    EMAIL_PROVIDER="ses"
    
    print_success "AWS SES configuration completed"
}

# SendGrid Setup
setup_sendgrid() {
    echo ""
    print_status "Setting up SendGrid..."
    
    # Get API key
    echo "You'll need a SendGrid API key with 'Mail Send' permissions."
    echo "If you don't have one, follow these steps:"
    echo "  1. Sign up at https://sendgrid.com"
    echo "  2. Go to Settings → API Keys"
    echo "  3. Create API Key with Mail Send access"
    echo ""
    
    read -sp "Enter your SendGrid API Key: " sendgrid_api_key
    echo ""
    
    if [ -z "$sendgrid_api_key" ]; then
        print_error "SendGrid API key is required"
        exit 1
    fi
    
    # Get verified sender domain
    echo ""
    print_status "You need to verify your domain in SendGrid for production use."
    echo "This includes:"
    echo "  - Domain authentication (CNAME records)"
    echo "  - SPF record verification"
    echo "  - Link branding setup"
    echo ""
    read -p "Enter your verified domain (e.g., medipole.com): " verified_domain
    
    if ! validate_domain "$verified_domain"; then
        print_error "Invalid domain format"
        exit 1
    fi
    
    # Store SendGrid configuration
    SENDGRID_API_KEY=$sendgrid_api_key
    SENDGRID_SENDER="notify@$verified_domain"
    EMAIL_PROVIDER="sendgrid"
    
    print_success "SendGrid configuration completed"
}

# Common settings configuration
configure_common_settings() {
    echo ""
    print_status "Configuring common settings..."
    
    # Get from name
    read -p "Enter email from name (default: Medipole Healthcare): " from_name
    from_name=${from_name:-"Medipole Healthcare"}
    
    # Get reply-to email
    read -p "Enter reply-to email (default: support@$verified_domain): " reply_to
    reply_to=${reply_to:-"support@$verified_domain"}
    
    if ! validate_email "$reply_to"; then
        print_error "Invalid reply-to email format"
        exit 1
    fi
    
    # Store common settings
    EMAIL_FROM_NAME="$from_name"
    EMAIL_REPLY_TO="$reply_to"
}

# Generate final configuration
generate_final_config() {
    echo ""
    print_status "Generating production configuration..."
    
    # Create production config file
    cat > .env.production << EOF
# =============================================
# PRODUCTION ENVIRONMENT VARIABLES - GENERATED
# =============================================

# Email Service Provider
EMAIL_PROVIDER=$EMAIL_PROVIDER

# Provider-Specific Configuration
EOF

    if [ "$EMAIL_PROVIDER" = "ses" ]; then
        cat >> .env.production << EOF
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_REGION=$AWS_REGION
SES_EMAIL_SENDER=$SES_EMAIL_SENDER
SES_SANDBOX_MODE=false
EOF
    else
        cat >> .env.production << EOF
SENDGRID_API_KEY=$SENDGRID_API_KEY
SENDGRID_SENDER=$SENDGRID_SENDER
SENDGRID_SANDBOX_MODE=false
EOF
    fi

    cat >> .env.production << EOF

# Email Configuration
EMAIL_FROM_NAME=$EMAIL_FROM_NAME
EMAIL_REPLY_TO=$EMAIL_REPLY_TO
EMAIL_MAX_RETRIES=3
EMAIL_RETRY_DELAY=1000

# Application Configuration
DATABASE_URL=your-production-database-url-here
JWT_SECRET=your-very-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=24h
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Production Settings
NODE_ENV=production
LOG_LEVEL=info
ENABLE_EMAIL_LOGGING=true
ENABLE_DELIVERY_TRACKING=true
ENABLE_BOUNCE_HANDLING=true
EOF

    print_success "Configuration file generated: .env.production"
}

# Run the setup
check_dependencies
main_setup