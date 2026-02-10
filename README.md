# $🩸$ ***Medipole – Real-Time Blood Donation & Inventory Management Platform***

*Ensuring no life is lost due to a data gap.*

*Medipole is a full-stack, real-time blood donation and inventory management platform designed to solve one of India’s most critical healthcare challenges: blood shortages caused not by lack of donors, but by poor coordination and outdated inventory systems.*

*The platform connects donors, hospitals/blood banks, and NGOs through secure authentication, geolocation-based matching, and live availability dashboards to ensure timely access to blood when it matters most.*

##  ***Problem Statement***

**India’s vast network of blood banks and hospitals often faces shortages - not because of lack of donors, but due to poor coordination and outdated inventory tracking. How might we build a real-time, full-stack blood donation and inventory management platform that connects donors, hospitals, and NGOs - leveraging geolocation, live availability dashboards, and secure authentication - to ensure no life is lost due to a data gap?**

>***Medipole*** is our solution.

##  ***Key Objectives***

>**Enable real-time blood inventory tracking across hospitals and blood banks**

>**Connect nearby eligible donors to hospitals using geolocation**

>**Reduce response time during emergency blood requirements**

>**Provide NGOs and administrators with data-driven insights to improve coordination**

>**Ensure secure handling of sensitive medical and personal data**

## $👥$ ***User Roles***

### ***1. Donor***

>*Register and manage donor profile*
>
>*View nearby blood requests*
>
>*Receive emergency notifications*
>
>*Track donation history and eligibility*

### ***2. Hospital / Blood Bank***

---

##  Environment Variable Management

This project uses [Next.js environment variable support](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) to safely manage secrets and configuration.

### Files

- **.env.local**: Store actual secrets (e.g., database URLs, API keys). **Never commit this file.**
- **.env.example**: Provide placeholder values and document each variable’s purpose and scope (server vs client). Commit this file to help collaborators set up their own environments.

### Example Variables

| Variable Name           | Example Value                        | Purpose/Scope                        | Exposed to Client? |
|------------------------|--------------------------------------|--------------------------------------|:------------------:|
| DATABASE_URL           | postgresql://user:pass@localhost/db  | Database connection string (server)  |        No         |
| SECRET_API_KEY         | your_secret_api_key_here              | Secret API key for backend (server)  |        No         |
| NEXT_PUBLIC_API_URL    | https://api.example.com               | Public API base URL (client/server)  |       Yes         |

**Server-only variables** (like `DATABASE_URL`, `SECRET_API_KEY`) are accessed via `process.env` and are never sent to the browser.

**Client-safe variables** must be prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_API_URL`). Only these are exposed to client-side code.

### Build-time vs Runtime

- **Build-time**: Next.js loads environment variables at build time. Changing `.env.local` requires a server restart to take effect.
- **Runtime**: Only variables prefixed with `NEXT_PUBLIC_` are available in client-side code at runtime.

### Protecting Secrets

- `.env.local` is **not** committed to git. Ensure `.env.local` is listed in `.gitignore` (see below).
- Never put secrets in `.env.example`—use placeholders only.
- Only expose variables to the client if absolutely necessary and always use the `NEXT_PUBLIC_` prefix.

### Common Pitfalls & How We Avoided Them

- **Accidental secret exposure**: By using `.env.local` (gitignored) for real secrets and `.env.example` for documentation, we prevent leaks.
- **Client/server confusion**: We clearly document which variables are server-only and which are safe for the client, and enforce the `NEXT_PUBLIC_` prefix for client variables.
- **Forgetting to restart**: Remember to restart the dev server after changing environment variables.

### Example Usage in Code

```ts
// Server-side (e.g., API route or getServerSideProps)
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.SECRET_API_KEY;

// Client-side (only NEXT_PUBLIC_ variables)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### .gitignore

Ensure your `.gitignore` includes:

```
# Environment variables
.env.local
```

---

>*Manage blood inventory in real time*
>
>*Raise emergency blood requests*
>
>*View nearby donors*
>
>*Track donor responses*

### ***3. NGO / Admin***

>*Verify hospitals and blood banks*
>
>*Monitor nationwide inventory levels*
>
>*Analyze demand and shortage trends*
>
>*Ensure data authenticity and platform integrity*

##  ***Core Features***

###  $Secure$ $Authentication$ & $Authorization$

- ***JWT-based authentication***

- ***Role-based access control (Donor / Hospital / NGO)***

- ***Encrypted password storage***

###  $Geolocation-Based$ $Matching$

- ***Locate nearby donors and hospitals***

- ***Distance-based filtering***

- ***Interactive map view***

###  $Real-Time$ $Blood$ $Inventory$ $Management$

- ***Blood group-wise tracking (A+, A-, B+, B-, AB+, AB-, O+, O-)***

- ***Unit availability***

- ***Expiry awareness***

- ***Low-stock alerts***

### $Live$ $Availability$ $Dashboard$

- ***Real-time inventory status***

- ***City and blood-group filters***

- ***Visual status indicators (Available / Low / Critical)***

###  $Emergency$ $Blood$ $Request$ $System$

- ***Hospitals can raise urgent requests***

- ***Nearby eligible donors are notified instantly***

- ***Donors can accept or decline requests***

### $Analytics$ & $Insights$ $(Admin)$

- ***Blood demand trends***

- ***Most requested blood groups***

- ***City-wise shortages***

- ***Donation success metrics***

###  $Application$ $Sections$

- >***Landing Page*** $–$ $Platform$ $overview,$ $live$ $stats,$ $quick$ $search$

- >***Donor Dashboard*** $–$ $Requests,$ $eligibility$ $status,$ $history,$ $map$ $view$

- >***Hospital Dashboard*** $–$ $Inventory$ $manager,$ $emergency$ $requests$

- >***NGO/Admin Dashboard*** $–$ $Verification,$ $analytics,$ $system$ $monitoring$

- >***Map View*** $–$ $Hospitals$ $with$ $real-time$ $availability$ $markers$

## $🛠$ ***Tech Stack***

### $Frontend$

- ***Next.js (TypeScript)*** – Server-side rendering & full-stack capabilities

- ***Tailwind CSS***

- ***Mapbox / Google Maps / Leaflet*** for geolocation & maps

### $Backend$

- ***Next.js API Routes*** (Full-stack architecture)

- ***PostgreSQL*** – Relational database for structured, transactional data

- ***Prisma ORM*** – Type-safe database access & schema management

- ***Redis*** – Caching, rate limiting, and real-time request handling

- ***JWT-based authentication & role-based authorization***

### $DevOps$ & $Cloud$

- ***Docker*** – Containerized development & deployment

- ***AWS or Azure*** – Cloud hosting (EC2/App Service, RDS, Redis)

- ***GitHub Actions*** – CI/CD pipeline for automated testing & deployment

### $Optional$ $Enhancements$

- ***WebSockets*** (real-time inventory updates)

- ***SMS/Email notifications*** (Twilio, SES, Nodemailer)

- ***Object storage*** (AWS S3 / Azure Blob Storage)

##  ***System Architecture (High-Level)***

- >*User authenticates using* ***JWT***

- >***Role-based dashboard*** *is loaded*

- >*Hospitals update inventory in real time*

- >*Emergency requests trigger geo-based donor notifications*

- >*Admin monitors and analyzes platform-wide data*

##  ***Why This Project Matters***

- ***Solves a real-world healthcare coordination problem***

- ***Demonstrates full-stack engineering skills***

- ***Uses geolocation and real-time data effectively***

- ***Designed with scalability and security in mind***

- ***Highly relevant for product, backend, and full-stack roles***

## ***Future Scope***

>- Mobile application support

>- SMS-based alerts for non-smartphone users

>- AI-based blood demand prediction

>- Government and hospital system integration

##  ***License***

***This project is developed for educational and social-impact purposes.***

##  ***Database Design (Prisma & PostgreSQL)***

The Medipole database is designed to handle real-time inventory tracking, user management, and emergency blood requests with high data integrity and scalability.

### ***ER Diagram***

```mermaid
erDiagram
    USER ||--o| DONOR_PROFILE : "has"
    USER ||--o| HOSPITAL_PROFILE : "has"
    HOSPITAL_PROFILE ||--o{ INVENTORY : "manages"
    HOSPITAL_PROFILE ||--o{ BLOOD_REQUEST : "creates"
    HOSPITAL_PROFILE ||--o{ DONATION_HISTORY : "receives"
    DONOR_PROFILE ||--o{ DONATION_HISTORY : "performs"

    USER {
        string id PK
        string email UK
        string password
        enum role
    }

    DONOR_PROFILE {
        string id PK
        string userId FK
        enum bloodGroup
        datetime lastDonationDate
        float latitude
        float longitude
    }

    HOSPITAL_PROFILE {
        string id PK
        string userId FK
        string name
        string address
        boolean isVerified
    }

    INVENTORY {
        string id PK
        string hospitalId FK
        enum bloodGroup
        int units
    }

    BLOOD_REQUEST {
        string id PK
        string hospitalId FK
        enum bloodGroup
        int unitsRequired
        enum status
    }
```

### ***Schema Explanation***

- **Keys & Constraints**:
    - **Primary Keys (PK)**: All models use `cuid()` for globally unique identifiers.
    - **Foreign Keys (FK)**: Established using Prisma relations (e.g., `userId` in `DonorProfile` references `id` in `User`).
    - **Unique Constraints**: `User.email` and the combination of `hospitalId` and `bloodGroup` in `Inventory` are unique to prevent duplicate entries.
    - **Enums**: Used for `BloodGroup`, `UserRole`, and `RequestStatus` to ensure data consistency.

- **Normalization**:
    - **1NF**: All columns contain atomic values; no repeating groups.
    - **2NF**: All non-key attributes are fully functional dependent on the primary key. Split `User` into `DonorProfile` and `HospitalProfile` to avoid null-heavy tables.
    - **3NF**: Eliminated transitive dependencies. For example, `Inventory` relates directly to a `HospitalProfile`, not through a `User`.

### ***Scalability & Performance***

- **Indexing**: Frequent lookups on `email`, `hospitalId`, and `bloodGroup` are optimized via unique constraints and implicit indexes.
- **Geolocation**: Storing `latitude` and `longitude` as `Float` allows for efficient distance-based queries (e.g., finding the nearest donor).
- **Common Queries**:
    - *Find nearby donors*: Filter `DonorProfile` by distance using lat/lng.
    - *Real-time inventory*: Aggregate `Inventory` units across hospitals in a specific city.
    - *Emergency Matching*: Join `BloodRequest` with `DonorProfile` filtered by `bloodGroup` and distance.

##  ***Prisma ORM Integration***

We use Prisma as our Object-Relational Mapper (ORM) to interact with the PostgreSQL database. Prisma provides a type-safe client that improves developer productivity and reduces common database errors.

### ***Setup Steps***

1. **Install Dependencies**:
   ```bash
   npm install prisma --save-dev
   npm install @prisma/client
   ```
2. **Initialize Prisma**:
   ```bash
   npx prisma init
   ```
3. **Define Models**: Models are defined in `prisma/schema.prisma` using the Prisma Schema Language.
4. **Generate Client**:
   ```bash
   npx prisma generate
   ```

### ***Prisma Client Initialization***

We implement a singleton pattern for the Prisma Client to prevent multiple instances from being created during development hot-reloading.

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### ***Verification***

A test API route at `/api/test` handles connection checks:

- **Logs**: Successful connection shows `prisma:query` logs in the terminal.
- **Payload**: Returns a JSON object indicating connection status and sample data.

### ***Reflection***

- **Type Safety**: Prisma automatically generates TypeScript types based on our schema, ensuring that our queries match the database structure.
- **Reliability**: Relations are clearly defined and enforced by Prisma, reducing runtime errors related to missing or malformed data.
- **Productivity**: Features like autocompletion for queries and Prisma Studio make database management significantly faster.

---



## ***Database Migrations & Seeding***

Prisma Migrate helps you evolve your database schema safely and keep it in sync with your Prisma schema.

### ***Migration Workflow***

#### **Creating Your First Migration**

When you define or modify models in `prisma/schema.prisma`, create a migration:

```bash
npx prisma migrate dev --name init_schema
```

This command:
1. Generates SQL migration files in `prisma/migrations/`
2. Applies changes to your PostgreSQL database
3. Regenerates the Prisma Client with updated types

#### **Adding New Models or Fields**

When you add a new table or modify existing ones:

```bash
npx prisma migrate dev --name add_project_table
```

**Example**: Our initial migration `20260210091729_init_schema` created:
- 3 Enums: `UserRole`, `BloodGroup`, `RequestStatus`
- 5 Tables: `User`, `DonorProfile`, `HospitalProfile`, `Inventory`, `BloodRequest`, `DonationHistory`
- Foreign key constraints with `ON DELETE CASCADE`
- Unique indexes on email and composite keys

#### **Reviewing Migration SQL**

Always review generated SQL files before applying to production:

```sql
-- Example from our init_schema migration
CREATE TYPE "UserRole" AS ENUM ('DONOR', 'HOSPITAL', 'ADMIN');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'DONOR',
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### ***Rollback & Reset***

#### **Reset Database (Development Only)**

To reset your database and re-apply all migrations:

```bash
npx prisma migrate reset
```

This will:
- Drop the database
- Create a new database
- Apply all migrations from scratch
- Run seed data (if configured)

> [!CAUTION]
> **Never run `migrate reset` in production!** This will delete all data.

#### **Production Migration Strategy**

For production deployments:

```bash
npx prisma migrate deploy
```

This applies pending migrations without prompting or resetting.

**Best Practices**:
- Always test migrations in staging first
- Create database backups before migrating
- Use transactions where possible
- Monitor migration execution time
- Have a rollback plan ready

### ***Database Seeding***

Our seed script (`prisma/seed.ts`) populates the database with initial test data.

#### **Seed Script Configuration**

In `prisma.config.ts`:

```ts
migrations: {
  path: "prisma/migrations",
  seed: "ts-node prisma/seed.ts",
}
```

#### **Running the Seed**

```bash
npx prisma db seed
```

**Our Seed Data Includes**:
- 1 Admin user (`admin@medipole.com`)
- 1 Hospital with inventory (City General Hospital)
- 1 Donor profile (John Doe, A+ blood type)
- Sample blood inventory and emergency request

#### **Idempotency**

Our seed script uses `upsert` to ensure idempotency:

```ts
await prisma.user.upsert({
  where: { email: 'admin@medipole.com' },
  update: {},
  create: { /* ... */ }
})
```

This prevents duplicate entries when re-running the seed.

### ***Verification***

#### **Using Prisma Studio**

Launch the visual database browser:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:
- Browse all tables and records
- Edit data directly
- Verify relationships
- Test queries

#### **Migration Logs**

Successful migration output:

```
Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "medipole" at "localhost:5432"

Applying migration `20260210091729_init_schema`

The following migration(s) have been applied:

migrations/
  └─ 20260210091729_init_schema/
    └─ migration.sql

Your database is now in sync with your schema.
```

### ***Production Safety Reflections***

**How We Protect Production Data**:

1. **Staging Environment**: All migrations are tested in a staging environment that mirrors production
2. **Automated Backups**: Daily automated backups with point-in-time recovery
3. **Migration Review**: All migration SQL is peer-reviewed before deployment
4. **Gradual Rollout**: Use feature flags to enable new schema-dependent features gradually
5. **Monitoring**: Track migration execution time and database performance metrics
6. **Rollback Plan**: Maintain reverse migration scripts for critical changes

**Migration Checklist**:
- [ ] Test migration in local environment
- [ ] Review generated SQL for correctness
- [ ] Test in staging with production-like data
- [ ] Create database backup
- [ ] Deploy during low-traffic window
- [ ] Monitor application logs and metrics
- [ ] Verify data integrity post-migration

---
