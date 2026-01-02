# Login & Register Database Connection Guide

## ✅ Connection Status

The login and register pages are **fully connected** to the PostgreSQL database through the backend API.

## Architecture Overview

```
Frontend (React) → API Client → Backend (Express) → PostgreSQL Database
```

### Frontend Components:
- **Login Page** (`client/src/pages/Login.js`) - User authentication form
- **Register Page** (`client/src/pages/Register.js`) - User registration form
- **AuthContext** (`client/src/contexts/AuthContext.js`) - Manages authentication state
- **Axios Config** (`client/src/config/axios.js`) - API client configuration

### Backend API Endpoints:
- `POST /api/auth/login` - Authenticate user with email/password
- `POST /api/auth/register` - Register new user account
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/verify` - Verify JWT token

### Database:
- **Users Table** - Stores user accounts with passwords (hashed)
- **PasswordResetTokens Table** - Stores password reset tokens

## How It Works

### 1. **Registration Flow**
```
User fills Register form
    ↓
Frontend validates input
    ↓
API call: POST /api/auth/register
    ↓
Backend validates & hashes password
    ↓
Saves user to PostgreSQL database
    ↓
Returns JWT token & user data
    ↓
Frontend stores token & redirects
```

### 2. **Login Flow**
```
User enters credentials
    ↓
API call: POST /api/auth/login
    ↓
Backend queries database for user
    ↓
Compares password hash
    ↓
Returns JWT token & user data
    ↓
Frontend stores token & redirects
```

## Configuration

### Frontend Configuration

The React app uses a **proxy** configured in `client/package.json`:
```json
"proxy": "http://localhost:5000"
```

This means all API calls from the frontend (running on `http://localhost:3000`) to `/api/*` are automatically proxied to the backend (`http://localhost:5000/api/*`).

### Backend Configuration

The backend connects to PostgreSQL using environment variables in `server/.env`:
```env
DB_NAME=kubera_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## Testing the Connection

### 1. **Start the Database**
Make sure PostgreSQL is running and the database is created:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kubera_db;
```

### 2. **Configure Backend**
Create `server/.env` file with your database credentials:
```env
PORT=5000
JWT_SECRET=your-secret-key
DB_NAME=kubera_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

### 3. **Start Backend Server**
```bash
cd server
npm run dev
```

The server will automatically:
- ✅ Connect to PostgreSQL
- ✅ Create database tables
- ✅ Create default admin users

### 4. **Start Frontend**
```bash
cd client
npm start
```

### 5. **Test Registration**
1. Go to `http://localhost:3000/register`
2. Fill in the registration form
3. Submit - user will be saved to database
4. Check database: `SELECT * FROM users;`

### 6. **Test Login**
1. Go to `http://localhost:3000/login`
2. Use credentials:
   - Email: `admin@gmail.com` or `admin@kubera.io`
   - Password: `admin123`
3. Or use a newly registered account
4. Login should authenticate against database

## Default Admin Accounts

After database initialization, these accounts are created:

| Email | Password | Role |
|-------|----------|------|
| `admin@gmail.com` | `admin123` | admin |
| `admin@kubera.io` | `admin123` | admin |

## Troubleshooting

### Connection Issues

**Error: "Network Error" or "Unable to connect to server"**
- ✅ Check backend is running on port 5000
- ✅ Check `client/package.json` has `"proxy": "http://localhost:5000"`
- ✅ Restart both frontend and backend

**Error: "Database connection error"**
- ✅ Verify PostgreSQL is running
- ✅ Check database credentials in `server/.env`
- ✅ Ensure database `kubera_db` exists

**Error: "Invalid email or password"**
- ✅ Verify user exists in database: `SELECT * FROM users;`
- ✅ Check password is correct
- ✅ Try registering a new account

### Database Connection

**Check if tables exist:**
```sql
\dt
-- Should show: users, password_reset_tokens
```

**Check users:**
```sql
SELECT id, email, name, role, created_at FROM users;
```

**Manual user creation (if needed):**
```sql
-- This is handled automatically, but for testing:
INSERT INTO users (name, email, password, role) 
VALUES ('Test User', 'test@example.com', '$2a$10$hashed_password', 'student');
```

## API Response Format

### Successful Login/Register:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "student"
  }
}
```

### Error Response:
```json
{
  "error": "Invalid email or password"
}
```

## Security Features

✅ **Password Hashing** - All passwords are hashed using bcrypt  
✅ **JWT Tokens** - Secure token-based authentication  
✅ **SQL Injection Protection** - Sequelize ORM prevents SQL injection  
✅ **Input Validation** - Both frontend and backend validate inputs  
✅ **CORS Protection** - Backend configured with CORS  

## Next Steps

After successful connection:
1. ✅ Users can register new accounts
2. ✅ Users can login with credentials
3. ✅ Admin users can access admin dashboard
4. ✅ Student users can access student dashboard
5. ✅ All data persists in PostgreSQL database

## Files Modified/Created

- ✅ `client/src/config/axios.js` - API client configuration
- ✅ `client/src/contexts/AuthContext.js` - Updated to use configured axios
- ✅ `server/index.js` - Updated all routes to use database
- ✅ `server/models/User.js` - User model
- ✅ `server/models/PasswordResetToken.js` - Reset token model
- ✅ `server/config/database.js` - Database connection
- ✅ `server/config/initDatabase.js` - Database initialization

The login and register pages are now **fully connected** to the PostgreSQL database! 🎉





