# Cloud PostgreSQL Database Setup Guide

This guide covers provisioning and configuring a managed PostgreSQL database using **AWS RDS** or **Azure Database for PostgreSQL** for the Medipole application.

---

## Table of Contents

1. [AWS RDS PostgreSQL Setup](#aws-rds-postgresql-setup)
2. [Azure Database for PostgreSQL Setup](#azure-database-for-postgresql-setup)
3. [Network Access Configuration](#network-access-configuration)
4. [Connecting to Next.js Application](#connecting-to-nextjs-application)
5. [Verification & Testing](#verification--testing)
6. [Backup & Maintenance](#backup--maintenance)
7. [Cost Estimation](#cost-estimation)
8. [Production Considerations](#production-considerations)

---

## AWS RDS PostgreSQL Setup

### Step 1: Create RDS Instance

1. **Navigate to AWS RDS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/) → RDS → Create database

2. **Choose Configuration**
   | Parameter | Value |
   |-----------|-------|
   | Creation method | Standard create |
   | Engine type | PostgreSQL |
   | Engine version | PostgreSQL 15.x or 16.x |
   | Templates | **Free tier** (for learning) |

3. **Settings**
   | Parameter | Recommended Value |
   |-----------|-------------------|
   | DB instance identifier | `medipole-postgres` |
   | Master username | `medipole_admin` |
   | Master password | Use a strong password (save securely) |

4. **Instance Configuration**
   | Parameter | Free Tier Value |
   |-----------|-----------------|
   | DB instance class | db.t3.micro (or db.t4g.micro) |
   | Storage type | General Purpose SSD (gp2) |
   | Allocated storage | 20 GB |
   | Storage autoscaling | Disabled (for cost control) |

5. **Connectivity**
   | Parameter | Value |
   |-----------|-------|
   | VPC | Default VPC |
   | Public access | **Yes** (for development only) |
   | VPC security group | Create new |
   | Database port | 5432 |

6. **Additional Configuration**
   | Parameter | Value |
   |-----------|-------|
   | Initial database name | `medipole_db` |
   | Automated backups | Enable |
   | Backup retention | 7 days |
   | Encryption | Enable |

7. Click **Create database** and wait 5-10 minutes for provisioning.

### Step 2: Record Connection Parameters

After deployment, note these from the RDS console:

```
Endpoint: medipole-postgres.xxxxxx.us-east-1.rds.amazonaws.com
Port: 5432
Database: medipole_db
Username: medipole_admin
Region: us-east-1
Instance class: db.t3.micro
```

---

## Azure Database for PostgreSQL Setup

### Step 1: Create PostgreSQL Flexible Server

1. **Navigate to Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com/) → Create a resource → Azure Database for PostgreSQL

2. **Choose Deployment Option**
   - Select **Flexible server** (recommended)

3. **Basics Configuration**
   | Parameter | Value |
   |-----------|-------|
   | Subscription | Your Azure subscription |
   | Resource group | Create new: `medipole-rg` |
   | Server name | `medipole-postgres` |
   | Region | East US (or nearest) |
   | PostgreSQL version | 15 or 16 |
   | Workload type | Development |
   | Compute + storage | **Burstable, B1ms** (lowest cost) |

4. **Authentication**
   | Parameter | Value |
   |-----------|-------|
   | Authentication method | PostgreSQL authentication only |
   | Admin username | `medipole_admin` |
   | Password | Strong password (save securely) |

5. **Networking**
   | Parameter | Value |
   |-----------|-------|
   | Connectivity method | Public access |
   | Allow public access | Yes |
   | Firewall rules | Add your client IP |

6. **Additional Settings**
   | Parameter | Value |
   |-----------|-------|
   | Backup retention | 7 days |
   | Geo-redundant backup | Disabled (for cost savings) |

7. Click **Review + Create** → **Create** (wait 5-10 minutes)

### Step 2: Record Connection Parameters

After deployment:

```
Server name: medipole-postgres.postgres.database.azure.com
Port: 5432
Database: postgres (create medipole_db later)
Username: medipole_admin
Region: East US
Tier: Burstable B1ms
```

---

## Network Access Configuration

### AWS RDS - Security Group Configuration

1. **Navigate to VPC Security Groups**
   - RDS Console → Your database → Security group link

2. **Edit Inbound Rules**

   ```
   Type: PostgreSQL
   Protocol: TCP
   Port Range: 5432
   Source: My IP (auto-detects your current IP)
   Description: Development machine access
   ```

3. **For Production App Server**

   ```
   Type: PostgreSQL
   Protocol: TCP
   Port Range: 5432
   Source: <Your EC2/ECS Security Group ID or IP>
   Description: Application server access
   ```

4. **Save Rules**

### Azure - Firewall Configuration

1. **Navigate to Networking**
   - Azure Portal → Your PostgreSQL server → Networking

2. **Add Firewall Rule**
   | Rule Name | Start IP | End IP |
   |-----------|----------|--------|
   | MyDevelopmentIP | Your IP | Your IP |

3. **For App Service Access**
   - Enable "Allow access to Azure services" toggle
   - Or add specific App Service outbound IPs

4. **Save Changes**

### Finding Your IP Address

Visit [https://whatismyipaddress.com](https://whatismyipaddress.com) or run:

```bash
curl ifconfig.me
```

---

## Connecting to Next.js Application

### Step 1: Create Environment Variables

Create `.env.local` in your project root:

```env
# AWS RDS Connection String
DATABASE_URL="postgresql://medipole_admin:YourSecurePassword123!@medipole-postgres.xxxxxx.us-east-1.rds.amazonaws.com:5432/medipole_db?sslmode=require"

# OR Azure Connection String
DATABASE_URL="postgresql://medipole_admin:YourSecurePassword123!@medipole-postgres.postgres.database.azure.com:5432/medipole_db?sslmode=require"
```

**Connection String Format:**

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require
```

### Step 2: SSL Configuration

Both AWS and Azure require SSL connections. The `?sslmode=require` parameter ensures encrypted connections.

For stricter validation:

```env
DATABASE_URL="postgresql://...?sslmode=verify-full&sslrootcert=/path/to/ca-certificate.crt"
```

### Step 3: Test Connection via API Route

The application includes a test endpoint at `/api/db-health`:

```bash
curl http://localhost:3000/api/db-health
```

Expected response:

```json
{
  "status": "success",
  "message": "Cloud PostgreSQL connection successful!",
  "data": {
    "serverTime": "2026-02-19T10:30:00.000Z",
    "version": "PostgreSQL 15.x...",
    "database": "medipole_db",
    "sslEnabled": true
  }
}
```

### Step 4: Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to cloud database
npx prisma db push

# Or run migrations (production)
npx prisma migrate deploy
```

---

## Verification & Testing

### Using psql CLI

```bash
# AWS RDS
psql "postgresql://medipole_admin:YourPassword@medipole-postgres.xxxxxx.us-east-1.rds.amazonaws.com:5432/medipole_db?sslmode=require"

# Azure
psql "postgresql://medipole_admin:YourPassword@medipole-postgres.postgres.database.azure.com:5432/medipole_db?sslmode=require"
```

### Using pgAdmin

1. Open pgAdmin 4
2. Right-click Servers → Create → Server
3. **General tab:**
   - Name: Medipole Cloud DB
4. **Connection tab:**
   - Host: `medipole-postgres.xxxxxx.rds.amazonaws.com`
   - Port: `5432`
   - Database: `medipole_db`
   - Username: `medipole_admin`
   - Password: `YourPassword`
5. **SSL tab:**
   - SSL mode: Require
6. Click Save

### Test Query

```sql
-- Verify connection
SELECT NOW() as server_time, version() as pg_version;

-- Check SSL
SHOW ssl;

-- List tables (after migration)
\dt
```

---

## Backup & Maintenance

### AWS RDS Automated Backups

**Configuration (already set during creation):**

- Backup retention: 7 days
- Backup window: Preferred (or let AWS choose)
- Multi-AZ: Disabled for free tier

**Manual Snapshot:**

1. RDS Console → Databases → Select instance
2. Actions → Take snapshot
3. Name: `medipole-manual-backup-2026-02-19`

**Restore from Snapshot:**

1. RDS Console → Snapshots
2. Select snapshot → Actions → Restore snapshot

### Azure Automated Backups

**Configuration (already set during creation):**

- Backup retention: 7 days
- Geo-redundant: Disabled

**Point-in-Time Restore:**

1. Azure Portal → PostgreSQL server
2. Overview → Restore
3. Select restore point → Create new server

### Best Practices

- **Test restores regularly** - Backups are only useful if they work
- **Document restore procedures** - Create runbooks for emergencies
- **Monitor backup completion** - Set up alerts for failed backups

---

## Cost Estimation

### AWS RDS (Free Tier - 12 months)

| Resource      | Free Tier Allowance |
| ------------- | ------------------- |
| db.t3.micro   | 750 hours/month     |
| Storage       | 20 GB SSD           |
| Backups       | 20 GB included      |
| Data transfer | 1 GB/month outbound |

**After Free Tier (us-east-1):**
| Resource | Monthly Cost |
|----------|-------------|
| db.t3.micro (on-demand) | ~$12-15 |
| 20 GB storage | ~$2.30 |
| Backups (7 days) | ~$0.50 |
| **Total** | **~$15-18/month** |

### Azure (Pay-as-you-go)

| Resource                          | Monthly Cost      |
| --------------------------------- | ----------------- |
| Burstable B1ms (1 vCore, 2GB RAM) | ~$12-15           |
| 32 GB storage                     | ~$4.60            |
| Backups (7 days)                  | Included          |
| **Total**                         | **~$17-20/month** |

### Cost Optimization Tips

1. **Use reserved instances** - Save 30-60% with 1-3 year commitments
2. **Right-size instances** - Monitor usage, downgrade if underutilized
3. **Stop dev databases** - Use automation to stop outside business hours
4. **Delete unused snapshots** - Old manual backups cost money

---

## Production Considerations

### Scaling Strategies

**Vertical Scaling (Scale Up):**

- Change instance class (e.g., db.t3.micro → db.t3.small → db.t3.medium)
- Minimal downtime with Multi-AZ
- Good for: Increasing CPU/memory

**Horizontal Scaling (Read Replicas):**

- Create read replicas for read-heavy workloads
- Route SELECT queries to replicas
- Good for: Analytics, reporting, high read traffic

```
Primary DB (writes)
    │
    ├── Read Replica 1 (reads)
    │
    └── Read Replica 2 (reads)
```

### High Availability

**AWS Multi-AZ Deployment:**

- Synchronous replication to standby in different AZ
- Automatic failover (60-120 seconds)
- ~2x the cost

**Azure Zone-Redundant HA:**

- Standby replica in different availability zone
- Automatic failover
- Add ~$50-100/month

### Security Best Practices

1. **Never use public access in production**
   - Use VPC/VNet peering
   - Deploy in private subnets
   - Use VPN or bastion hosts

2. **Enable encryption**
   - At-rest: AWS KMS / Azure Key Vault
   - In-transit: Enforce SSL connections

3. **Use IAM authentication (AWS)**

   ```env
   DATABASE_URL="postgresql://iam_user:@endpoint:5432/db?sslmode=require"
   ```

4. **Rotate credentials regularly**
   - Use AWS Secrets Manager or Azure Key Vault
   - Implement credential rotation automation

5. **Enable audit logging**
   - AWS: Enable PostgreSQL logging to CloudWatch
   - Azure: Enable diagnostic settings

### Monitoring

**Key Metrics to Monitor:**

- CPU Utilization (alert > 80%)
- Freeable Memory (alert < 100MB)
- Database Connections (alert > 80% of max)
- Read/Write IOPS
- Replication Lag (if using replicas)

**Tools:**

- AWS CloudWatch
- Azure Monitor
- Prometheus + Grafana (self-hosted)

---

## Quick Reference

### Connection String Templates

```env
# AWS RDS
DATABASE_URL="postgresql://USER:PASSWORD@instance.region.rds.amazonaws.com:5432/DATABASE?sslmode=require"

# Azure Flexible Server
DATABASE_URL="postgresql://USER:PASSWORD@server.postgres.database.azure.com:5432/DATABASE?sslmode=require"
```

### Useful Commands

```bash
# Test connection
npx prisma db pull

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Check database health
curl http://localhost:3000/api/db-health
```

### Troubleshooting

| Issue                   | Solution                                                   |
| ----------------------- | ---------------------------------------------------------- |
| Connection timeout      | Check security group/firewall rules                        |
| SSL certificate error   | Add `?sslmode=require` to connection string                |
| Authentication failed   | Verify username/password, check special character encoding |
| Database does not exist | Create database manually via psql or console               |

---

## Screenshots Reference

When documenting your setup, capture:

1. **AWS RDS Console** - Database instance details page
2. **Azure Portal** - Server overview page
3. **Security Group/Firewall** - Inbound rules configuration
4. **pgAdmin/psql** - Successful connection and test query
5. **API Response** - `/api/db-health` endpoint output
6. **Prisma Studio** - Data browser showing tables

---

_Last updated: February 2026_
