# Medipole Architecture Documentation

## System Overview

Medipole is a real-time blood donation and inventory management platform built with modern web technologies. The system connects blood donors, hospitals, and NGOs to ensure timely access to blood during emergencies.

### Tech Stack
- **Frontend**: Next.js 16 (React framework with App Router)
- **Backend**: Next.js API Routes (Serverless functions)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for performance optimization
- **Authentication**: JWT with bcrypt password hashing
- **Cloud Services**: AWS (S3, ECS, RDS, SES) and Azure (App Service, Key Vault)
- **Deployment**: Docker containerization with CI/CD pipelines

### Core Modules
1. **Authentication & Authorization** - JWT-based user management with role-based access
2. **User Management** - Donor, Hospital, NGO, and Admin user types
3. **Blood Inventory** - Real-time tracking of blood units and availability
4. **Emergency Requests** - Geolocation-based matching system
5. **Notifications** - Email alerts via SendGrid
6. **Analytics & Monitoring** - Metrics collection and logging

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── auth/         # Authentication routes
│   │   ├── users/        # User management
│   │   ├── donors/       # Donor profiles
│   │   ├── hospitals/    # Hospital management
│   │   ├── inventory/    # Blood inventory
│   │   ├── requests/     # Emergency requests
│   │   └── ...
│   ├── dashboard/        # User dashboards
│   ├── auth/            # Authentication pages
│   └── page.tsx         # Homepage
├── components/           # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   └── AuthLeftPanel.tsx # Feature-specific components
├── lib/                # Utility functions and configurations
│   ├── prisma.ts       # Database client
│   ├── redis.ts        # Cache client
│   ├── auth.ts         # Authentication utilities
│   ├── email.ts        # Email service
│   ├── logger.ts       # Logging system
│   ├── metrics.ts      # Metrics collection
│   └── errorHandler.ts # Error handling
└── store/              # State management
    └── userStore.ts    # User state with Zustand
```

## Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │────│ API Routes  │────│  Database  │
│  (Next.js)  │    │ (Serverless)│    │(PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
       │                     │              │
       │                     │              │
       ▼                     ▼              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User Auth  │────│   JWT Token │────│ User Table │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                     ┌─────────────┐
                                     │  Redis Cache│
                                     │ (Optional)  │
                                     └─────────────┘
```

### Request Flow Example
1. User logs in → JWT token generated and stored
2. API request → Token validated → Database query
3. Response cached in Redis for future requests
4. Email notifications sent via SendGrid for critical events

## Deployment Architecture

### Development Environment
- Local PostgreSQL database
- Local Redis instance
- Next.js development server
- Environment variables loaded from `.env.local`

### Production Environment
- **AWS/Azure Cloud**:
  - ECS/App Service for containerized deployment
  - RDS for PostgreSQL database
  - ElastiCache/Azure Cache for Redis
  - S3/Blob Storage for file uploads
  - CloudFront/CDN for static assets

### CI/CD Pipeline
- **GitHub Actions** workflow triggers on push/PR
- **Stages**: Lint → Test → Build → Deploy
- **Caching**: NPM dependencies and build artifacts
- **Concurrency**: Prevents overlapping deployments

### Security Measures
- **Secrets Management**: AWS Secrets Manager / Azure Key Vault
- **CORS**: Configured for allowed origins
- **Input Validation**: Comprehensive validation with error handling
- **Rate Limiting**: Implemented at API level
- **HTTPS**: SSL/TLS encryption in production

## Maintenance and Onboarding

### Local Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start PostgreSQL and Redis services
5. Run database migrations: `npx prisma migrate dev`
6. Start development server: `npm run dev`

### Adding New Features
1. Create API route in `src/app/api/`
2. Add database schema updates in `prisma/schema.prisma`
3. Implement frontend components in `src/components/`
4. Add tests in `__tests__/`
5. Update documentation

### API Documentation
- Swagger documentation available at `/api/docs`
- JSDoc comments in all API route files
- Postman collection for testing

### Monitoring
- Application logs via Winston
- Metrics collection with Prometheus-style metrics
- Health checks at `/api/health`
- Error tracking and alerting

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Authors**: Medipole Development Team