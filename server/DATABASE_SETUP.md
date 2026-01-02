# Database Setup Guide

This application uses **PostgreSQL** with **Sequelize ORM** for authentication and data persistence.

## Prerequisites

1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql` (Ubuntu/Debian)

2. **Start PostgreSQL Service**:
   - Windows: PostgreSQL service should auto-start, or start via Services
   - Mac/Linux: `brew services start postgresql` or `sudo systemctl start postgresql`

## Setup Steps

### 1. Create Database

Open PostgreSQL command line (psql) and create the database:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE adventus_db;

-- Exit psql
\q
```

Or using a GUI tool like pgAdmin, create a database named `adventus_db`.

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory (copy from `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (Change this in production!)
JWT_SECRET=your-secret-key-change-in-production

# Database Configuration
DB_NAME=adventus_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

**Important**: Update `DB_PASSWORD` with your actual PostgreSQL password.

### 3. Install Dependencies

The required dependencies should already be installed:
- `pg` - PostgreSQL client
- `sequelize` - ORM
- `sequelize-cli` - CLI tools

If not, run:
```bash
cd server
npm install pg sequelize sequelize-cli
```

### 4. Start the Server

The database will be automatically initialized when you start the server:

```bash
cd server
npm run dev
```

Or from the root:
```bash
npm run dev
```

The server will:
- ✅ Connect to PostgreSQL
- ✅ Create tables (users, password_reset_tokens) if they don't exist
- ✅ Create default admin users:
  - `admin@gmail.com` / `admin123`
  - `admin@adventus.io` / `admin123`

## Database Schema

### Users Table (`users`)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment primary key |
| name | STRING | User's full name |
| email | STRING (UNIQUE) | User's email address |
| password | STRING (nullable) | Hashed password (null for Google OAuth users) |
| phone | STRING (nullable) | Phone number |
| country | STRING (nullable) | Country |
| role | ENUM('admin', 'student') | User role, defaults to 'student' |
| googleId | STRING (nullable, UNIQUE) | Google OAuth ID |
| picture | STRING (nullable) | Profile picture URL |
| createdAt | DATE | Account creation timestamp |
| updatedAt | DATE | Last update timestamp |

### Password Reset Tokens Table (`password_reset_tokens`)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment primary key |
| token | STRING (UNIQUE) | Reset token |
| email | STRING | User's email |
| expiresAt | DATE | Token expiration time |
| used | BOOLEAN | Whether token has been used |
| createdAt | DATE | Token creation timestamp |

## Troubleshooting

### Connection Error

If you get a connection error:
1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure database `adventus_db` exists
4. Check PostgreSQL port (default: 5432)

### Authentication Failed

If authentication fails:
```
Error: password authentication failed for user "postgres"
```

Solution:
1. Update `DB_PASSWORD` in `.env` with the correct password
2. Or reset PostgreSQL password

### Tables Not Created

If tables aren't created automatically:
1. Check database connection
2. Ensure user has CREATE TABLE permissions
3. Check server logs for errors

## Production Considerations

1. **Change JWT_SECRET**: Use a strong, random secret in production
2. **Database Security**: 
   - Use strong passwords
   - Limit database access
   - Use connection pooling
3. **Environment Variables**: Never commit `.env` files
4. **Backups**: Set up regular database backups
5. **Indexes**: Already configured for optimal query performance

## Migration

The current setup uses `sequelize.sync({ alter: true })` which automatically creates/updates tables. For production, consider using Sequelize migrations:

```bash
npx sequelize-cli init:migrations
npx sequelize-cli migration:generate --name create-users-table
```

Then run migrations:
```bash
npx sequelize-cli db:migrate
```





