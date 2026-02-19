# Container Deployment Implementation

## Overview

This implementation provides containerized deployment of the Medipole application using Docker with automated CI/CD pipelines for AWS ECS and Azure App Service. The solution ensures consistent deployment across environments with proper scaling, monitoring, and health checks.

## Containerization Benefits

### Why Containerize?

- **Consistency**: Identical runtime environment across development, staging, and production
- **Portability**: Run anywhere Docker is supported
- **Isolation**: Application dependencies don't conflict with host system
- **Scalability**: Easy horizontal scaling with container orchestration
- **Resource Efficiency**: Optimized resource usage with container limits

### Key Features Implemented

- ✅ **Multi-stage Docker build** for optimized image size
- ✅ **Health checks** for container monitoring
- ✅ **Non-root user** for security
- ✅ **Environment variable management** with secret injection
- ✅ **Automated CI/CD** pipelines for AWS and Azure
- ✅ **Local development** with Docker Compose

## Implementation Components

### 1. Dockerfile (`Dockerfile`)

Production-optimized multi-stage build:

#### Build Stage:

- Uses `node:18-alpine` base image
- Installs production dependencies only
- Builds Next.js application with `npm run build`

#### Runtime Stage:

- **Security**: Runs as non-root user
- **Optimization**: Copies only necessary files
- **Health Monitoring**: Built-in health check endpoint
- **Performance**: Standalone server mode for Next.js

#### Key Optimizations:

```dockerfile
# Multi-stage build reduces final image size
FROM node:18-alpine AS builder
# ... build steps ...
FROM node:18-alpine AS runner

# Security: Non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Health monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### 2. Docker Compose (`docker-compose.yml`)

Local development environment with all services:

#### Services Included:

- **app**: Next.js application with live reloading
- **postgres**: PostgreSQL database
- **redis**: Redis cache

#### Features:

- **Environment variable injection** from `.env` file
- **Volume mounting** for development
- **Network isolation** between services
- **Persistent data** volumes for databases

### 3. Health Check Endpoint (`src/app/api/health/route.ts`)

Comprehensive health monitoring:

#### Health Checks Performed:

- **Redis connectivity** status
- **API endpoint** availability
- **Service metadata** (version, timestamp)

#### Response Format:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "medipole-health",
  "checks": {
    "redis": "healthy",
    "api": "healthy"
  },
  "version": "1.0.0"
}
```

### 4. CI/CD Pipelines

#### AWS Deployment Pipeline (`.github/workflows/deploy-aws.yml`)

Automated deployment to AWS ECS with ECR:

**Workflow Steps:**

1. **Code checkout** from repository
2. **AWS authentication** using secrets
3. **ECR login** and image push
4. **Task definition** update with new image
5. **ECS deployment** with service stability wait

**Environment Variables Required:**

```yaml
AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

#### Azure Deployment Pipeline (`.github/workflows/deploy-azure.yml`)

Automated deployment to Azure App Service with ACR:

**Workflow Steps:**

1. **Code checkout** from repository
2. **Azure authentication** using service principal
3. **ACR login** and image push
4. **Web App deployment** with new container image

**Environment Variables Required:**

```yaml
AZURE_CREDENTIALS: ${{ secrets.AZURE_CREDENTIALS }}
REGISTRY_USERNAME: ${{ secrets.REGISTRY_USERNAME }}
REGISTRY_PASSWORD: ${{ secrets.REGISTRY_PASSWORD }}
```

## AWS ECS Deployment

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **ECR Repository** created: `nextjs-app`
3. **ECS Cluster** created: `medipole-cluster`
4. **Task Execution Role** with ECR and Secrets Manager permissions
5. **Secrets stored** in AWS Secrets Manager

### ECS Task Definition (`task-definition.json`)

#### Key Configuration:

- **Fargate launch type** for serverless containers
- **512 CPU units** and **1024 MB memory**
- **Secret injection** from AWS Secrets Manager
- **Health check** configuration
- **CloudWatch logging** setup

#### Secret Integration:

```json
{
  "name": "DATABASE_URL",
  "valueFrom": "arn:aws:secretsmanager:region:account:secret:name::"
}
```

### Deployment Steps

1. **Create ECS Cluster** with Fargate
2. **Register Task Definition** using provided template
3. **Create ECS Service** with load balancer
4. **Configure Auto Scaling** policies
5. **Set up DNS** routing (Route 53)

## Azure App Service Deployment

### Prerequisites

1. **Azure Subscription** with appropriate permissions
2. **Azure Container Registry** created: `kalviumRegistry`
3. **App Service Plan** with container support
4. **Service Principal** for GitHub Actions authentication

### App Service Configuration

- **Container Settings**: Single container from ACR
- **Port Configuration**: 3000 (HTTP)
- **Startup Command**: `npm start`
- **Continuous Deployment**: Enabled via GitHub Actions

### Deployment Steps

1. **Create App Service** with container settings
2. **Configure ACR** integration
3. **Set Application Settings** for environment variables
4. **Enable Deployment Slots** for staging
5. **Configure Custom Domain** (optional)

## Local Development Workflow

### Quick Start

```bash
# Build and run all services
docker-compose up --build

# Run only the application (without databases)
docker build -t medipole-app .
docker run -p 3000:3000 medipole-app

# Access the application
# http://localhost:3000
# Health check: http://localhost:3000/api/health
```

### Development Commands

```bash
# Rebuild services
docker-compose build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

## Environment Configuration

### Required Environment Variables

Create `.env` file for local development:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medipole

# Authentication
JWT_SECRET=your-jwt-secret

# AWS Services
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=kalvium-app-storage

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key

# Secret Management
SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name
KEYVAULT_NAME=kalviumRegistry
```

## Monitoring and Scaling

### Health Monitoring

- **Container Health**: Built-in Docker health checks
- **Application Health**: `/api/health` endpoint
- **Service Health**: Cloud provider monitoring
- **Database Health**: Connection pool monitoring

### Auto Scaling Configuration

#### AWS ECS Auto Scaling:

```json
{
  "TargetValue": 70,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleOutCooldown": 60,
  "ScaleInCooldown": 300
}
```

#### Azure App Service Scaling:

- **Manual Scaling**: Set instance count
- **Auto Scaling**: Based on CPU/Memory metrics
- **Deployment Slots**: Staging and production environments

## Security Implementation

### Container Security

- **Non-root user** execution
- **Minimal base images** (Alpine Linux)
- **Multi-stage builds** to reduce attack surface
- **Read-only root filesystem** (where possible)

### Network Security

- **Private networking** within VPC
- **Security groups** and network policies
- **HTTPS enforcement** at load balancer
- **WAF integration** for DDoS protection

### Secret Management

- **AWS Secrets Manager** integration
- **Azure Key Vault** integration
- **Environment variable injection**
- **No hardcoded secrets** in code

## Performance Optimization

### Image Optimization

- **Multi-stage builds** reduce image size by ~60%
- **Alpine base images** minimize footprint
- **Layer caching** for faster builds
- **Production dependencies** only

### Runtime Optimization

- **Next.js standalone mode** for smaller runtime
- **Memory limits** prevent resource exhaustion
- **Health check intervals** optimized for quick detection
- **Graceful shutdown** handling

### Resource Allocation

#### Recommended Sizing:

- **Development**: 512MB RAM, 0.25 CPU
- **Staging**: 1GB RAM, 0.5 CPU
- **Production**: 2GB RAM, 1 CPU (per instance)

## Troubleshooting

### Common Issues

#### 1. Container fails to start

- **Check**: Health check endpoint accessibility
- **Verify**: Environment variables are properly set
- **Review**: Container logs for error messages

#### 2. Database connection failures

- **Check**: Network connectivity to database
- **Verify**: Database credentials and permissions
- **Review**: Connection string format

#### 3. Health check failures

- **Test**: Direct access to `/api/health` endpoint
- **Check**: Redis connectivity status
- **Verify**: Required services are running

### Debugging Commands

```bash
# View container logs
docker logs <container_id>

# Execute commands in container
docker exec -it <container_id> /bin/sh

# Check health endpoint
curl http://localhost:3000/api/health

# View resource usage
docker stats
```

## Deployment Validation

### Pre-deployment Checklist

- [ ] Docker image builds successfully
- [ ] Health check endpoint responds correctly
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Secret permissions verified
- [ ] CI/CD pipeline tested

### Post-deployment Verification

- [ ] Application accessible via public URL
- [ ] Health check endpoint returns 200 status
- [ ] All services show healthy status
- [ ] Monitoring alerts are configured
- [ ] Performance metrics within expected ranges

## Cost Considerations

### AWS ECS Pricing

- **Fargate**: $0.04048 per vCPU-hour + $0.004445 per GB-hour
- **ECR Storage**: $0.10 per GB-month
- **CloudWatch Logs**: $0.50 per GB ingested

### Azure App Service Pricing

- **Container Instances**: ~$0.0434 per hour (1 vCPU, 1.75 GB)
- **ACR Storage**: $0.157 per GB-month
- **Bandwidth**: First 5 GB free, then $0.087 per GB

## Future Enhancements

### Planned Improvements

1. **Blue/Green Deployment** strategies
2. **Canary Release** patterns
3. **Advanced monitoring** with Prometheus/Grafana
4. **Service mesh** integration (Istio/Linkerd)
5. **Multi-region** deployment support
6. **Backup and disaster recovery** automation

### Advanced Features

- **Custom metrics** collection
- **Distributed tracing** implementation
- **Advanced auto-scaling** policies
- **Security scanning** in CI pipeline
- **Performance testing** automation

## Conclusion

This container deployment implementation provides a robust, scalable, and secure foundation for deploying the Medipole application. The multi-cloud approach ensures flexibility while the automated CI/CD pipelines enable rapid, reliable deployments with proper monitoring and scaling capabilities.
