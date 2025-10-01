# PostgreSQL Migration Guide

This guide will help you migrate your Ahl Allah application from SQL Server to PostgreSQL while preserving all your models and data structure.

## Overview

The migration involves:
- Replacing SQL Server driver with PostgreSQL driver
- Updating database configuration
- Preserving all existing models and relationships
- Setting up PostgreSQL-specific configurations

## Prerequisites

1. **PostgreSQL Installation**
   - Install PostgreSQL 12+ on your system
   - Ensure PostgreSQL service is running
   - Have admin access to create databases

2. **Node.js Dependencies**
   - The package.json has been updated with PostgreSQL dependencies
   - Run `npm install` to install new dependencies

## Migration Steps

### 1. Install PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### CentOS/RHEL:
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### Windows:
- Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

Connect to PostgreSQL as superuser and create the database:

```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Create database
CREATE DATABASE ahl_allah_db;

-- Create user (optional, you can use default postgres user)
CREATE USER ahl_allah_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ahl_allah_db TO ahl_allah_user;

-- Exit PostgreSQL
\q
```

### 3. Update Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ahl_allah_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=ByYM000OLlMQG6VVVp1OH7Xzyr7gHuw1qvUC5dcGt3SNM
JWT_EXPIRES_IN=7d
JWT_ISSUER=http://localhost:60772
JWT_AUDIENCE=http://localhost:4200

# Email Configuration
EMAIL_FROM=your_email@gmail.com
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server Configuration
PORT=60772
NODE_ENV=development

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Install Dependencies

```bash
npm install
```

This will install:
- `pg` - PostgreSQL client for Node.js
- `@types/pg` - TypeScript definitions for PostgreSQL

### 5. Run Migration

Execute the migration script to create all tables:

```bash
# Build the project first
npm run build

# Run migration
npx ts-node src/config/migrate.ts
```

Or if you prefer to run the built version:

```bash
npm run build
node dist/config/migrate.js
```

### 6. Verify Migration

Start your application and verify everything works:

```bash
npm run dev
```

Check the console for:
- "Database connection has been established successfully."
- "Database models synchronized successfully."

## Data Migration (If You Have Existing Data)

If you have existing data in SQL Server that you want to migrate to PostgreSQL, you'll need to export and import the data:

### Option 1: Manual Data Export/Import

1. **Export from SQL Server:**
   ```sql
   -- Export each table to CSV
   BCP "SELECT * FROM hefzqurandb.dbo.Users" queryout "users.csv" -c -t"," -r"\n" -S your_server -T
   BCP "SELECT * FROM hefzqurandb.dbo.MohafezUsers" queryout "mohafez_users.csv" -c -t"," -r"\n" -S your_server -T
   -- Repeat for all tables
   ```

2. **Import to PostgreSQL:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres -d ahl_allah_db

   -- Import CSV files
   \copy "Users" FROM 'users.csv' WITH CSV HEADER;
   \copy "MohafezUsers" FROM 'mohafez_users.csv' WITH CSV HEADER;
   -- Repeat for all tables
   ```

### Option 2: Using Database Migration Tools

Consider using tools like:
- **pgloader** - Can migrate directly from SQL Server to PostgreSQL
- **AWS DMS** - If using AWS
- **Custom scripts** - Write Node.js scripts to migrate data

## Key Changes Made

### 1. Package Dependencies
- **Removed:** `mssql` (SQL Server driver)
- **Added:** `pg` (PostgreSQL driver)
- **Added:** `@types/pg` (TypeScript definitions)

### 2. Database Configuration
- **Dialect:** Changed from `mssql` to `postgres`
- **Port:** Changed from `1433` to `5432`
- **SSL:** Added SSL configuration for production
- **Connection Options:** Removed SQL Server specific options

### 3. Environment Variables
- Updated default database name to `ahl_allah_db`
- Updated default host to `localhost`
- Updated default port to `5432`

## Model Compatibility

All your existing models are fully compatible with PostgreSQL:

- ✅ **User Model** - UUID primary key works perfectly
- ✅ **MohafezUser Model** - Auto-increment integers work fine
- ✅ **NormalUser Model** - All data types are compatible
- ✅ **Call Model** - Foreign key relationships preserved
- ✅ **Complaint Model** - Text fields and constraints work
- ✅ **Note Model** - All field types compatible
- ✅ **Session Model** - UUID foreign keys work correctly

## Performance Considerations

### Indexes
All existing indexes will be created automatically:
- Email uniqueness index
- Role-based indexes
- Foreign key indexes
- Search optimization indexes

### Connection Pooling
PostgreSQL connection pooling is configured with:
- Max connections: 10
- Min connections: 0
- Acquire timeout: 30 seconds
- Idle timeout: 10 seconds

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   **Solution:** Ensure PostgreSQL is running and accessible

2. **Authentication Failed**
   ```
   Error: password authentication failed for user "postgres"
   ```
   **Solution:** Check username/password in .env file

3. **Database Does Not Exist**
   ```
   Error: database "ahl_allah_db" does not exist
   ```
   **Solution:** Create the database manually or check DB_NAME in .env

4. **Permission Denied**
   ```
   Error: permission denied for table "Users"
   ```
   **Solution:** Grant proper permissions to your database user

### SSL Issues (Production)

If you encounter SSL issues in production:

```typescript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

## Testing the Migration

### 1. Basic Connectivity Test
```bash
# Test database connection
npm run dev
# Check console for successful connection message
```

### 2. API Endpoint Tests
Test key endpoints to ensure everything works:

```bash
# Health check
curl http://localhost:60772/health

# Test authentication (after creating a user)
curl -X POST http://localhost:60772/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","country":"Test","birthyear":1990,"gender":"male"}'
```

### 3. Database Verification
Connect to PostgreSQL and verify tables:

```sql
psql -U postgres -d ahl_allah_db

-- List all tables
\dt

-- Check table structure
\d "Users"
\d "MohafezUsers"
-- etc.
```

## Rollback Plan

If you need to rollback to SQL Server:

1. **Restore package.json:**
   ```bash
   git checkout HEAD~1 -- package.json
   npm install
   ```

2. **Restore database config:**
   ```bash
   git checkout HEAD~1 -- src/config/database.ts
   ```

3. **Update environment variables:**
   ```bash
   # Restore SQL Server settings in .env
   ```

## Production Deployment

### Environment Variables for Production
```bash
# Production PostgreSQL
DB_HOST=your_production_host
DB_PORT=5432
DB_NAME=ahl_allah_prod
DB_USER=ahl_allah_user
DB_PASSWORD=secure_production_password
NODE_ENV=production
```

### SSL Configuration
Ensure SSL is properly configured for production PostgreSQL connections.

### Backup Strategy
Set up regular PostgreSQL backups:
```bash
# Daily backup
pg_dump -U postgres -h localhost ahl_allah_db > backup_$(date +%Y%m%d).sql
```

## Support

If you encounter issues during migration:

1. Check PostgreSQL logs: `/var/log/postgresql/`
2. Verify environment variables
3. Test database connectivity manually
4. Check application logs for detailed error messages

## Conclusion

The migration to PostgreSQL preserves all your existing models and functionality while providing:
- Better performance for read-heavy workloads
- More flexible data types
- Better JSON support
- Open-source licensing
- Cross-platform compatibility

Your application should work exactly the same as before, but now with PostgreSQL as the backend database.

