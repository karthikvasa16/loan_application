# Registration Troubleshooting Guide

## Quick Fixes for "Registration Failed"

### 1. **Check Database Connection**

The most common issue is database connection failure. Verify:

```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Mac/Linux: brew services list | grep postgres

# Test database connection
psql -U postgres -h localhost -d adventus_db
```

### 2. **Verify .env Configuration**

Ensure `server/.env` has correct database credentials:

```env
DB_NAME=adventus_db
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD  # ⚠️ Change this!
DB_HOST=localhost
DB_PORT=5432
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

**⚠️ IMPORTANT**: Replace `your_postgres_password` with your actual PostgreSQL password!

### 3. **Create Database if Missing**

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE adventus_db;

-- Exit
\q
```

### 4. **Check Server Logs**

When you try to register, check the server terminal for errors:

- ❌ "Database connection error" → Database not running or wrong credentials
- ❌ "Table doesn't exist" → Database not initialized
- ❌ "Email already registered" → User already exists

### 5. **Test Backend Directly**

Test the registration endpoint directly:

```bash
# Using curl (PowerShell)
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test1234\"}'
```

### 6. **Common Error Messages & Solutions**

| Error Message | Solution |
|--------------|----------|
| "Unable to connect to server" | Backend not running. Start with `npm run dev` in server folder |
| "Database connection failed" | Check PostgreSQL is running and .env credentials are correct |
| "Email already registered" | Email exists. Use different email or login instead |
| "Password must be at least 8 characters" | Use a longer password |
| "Invalid email format" | Check email format (e.g., user@example.com) |

### 7. **Reset Database (if needed)**

If tables are corrupted:

```sql
-- Connect to database
psql -U postgres -d adventus_db

-- Drop and recreate tables (WARNING: Deletes all data!)
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Restart server to recreate tables
```

### 8. **Check Browser Console**

Open browser DevTools (F12) → Console tab → Look for:
- Network errors (CORS, connection refused)
- API errors (400, 500 status codes)
- Detailed error messages

## Step-by-Step Debugging

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Look for: "✅ Database connection established successfully"

2. **Start Frontend**
   ```bash
   cd client
   npm start
   ```

3. **Try Registration**
   - Fill form with valid data
   - Click "Create Account"
   - Check browser console (F12) for errors
   - Check server terminal for errors

4. **Verify Database**
   ```sql
   SELECT * FROM users;
   ```

## Still Not Working?

Check these in order:

1. ✅ PostgreSQL is installed and running
2. ✅ Database `adventus_db` exists
3. ✅ `.env` file has correct password (not placeholder)
4. ✅ Backend server is running on port 5000
5. ✅ Frontend proxy is configured correctly
6. ✅ No firewall blocking port 5000
7. ✅ Check browser console for detailed errors





