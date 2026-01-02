# How to Start the Backend Server

## Quick Start

**From the server directory:**

```bash
cd server
npm run dev
```

## Step by Step

1. **Open a terminal/PowerShell**

2. **Navigate to the server folder:**
   ```bash
   cd "D:\karthik\DP Website\sample-main\server"
   ```
   Or if you're already in the project root:
   ```bash
   cd server
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Wait for these messages:**
   ```
   🔄 Initializing database...
   ✅ Database connection established successfully.
   ✅ Database models synchronized.
   ✅ Default admin user created (admin@gmail.com / admin123)
   ✅ Default admin user created (admin@adventus.io / admin123)
   ✅ Database initialization completed.
   ✅ Server running on port 5000
   ✅ Database connected and ready
   ✅ Ready to accept registration requests
   ```

5. **Keep this terminal open** - don't close it!

6. **In another terminal, start the frontend:**
   ```bash
   cd client
   npm start
   ```

## Alternative: Start Both at Once

From the **project root** (`sample-main` folder):

```bash
npm run dev
```

This starts both frontend and backend together.

## Verify Server is Running

- ✅ Check terminal for "Server running on port 5000"
- ✅ Try accessing: `http://localhost:5000/api/auth/verify` in browser
- ✅ Should see an error (that's OK - means server is responding)

## Common Errors

### "Cannot find module"
```bash
# Install dependencies first
cd server
npm install
```

### "Port 5000 already in use"
```bash
# Change port in server/.env
PORT=5001
```

### "Database connection error"
- Check PostgreSQL is running
- Verify `.env` file has correct credentials
- Ensure database `adventus_db` exists

## Next Steps

Once backend is running:
1. Start frontend (in another terminal)
2. Go to `http://localhost:3000/register`
3. Try registering a new account

The registration should work now! 🎉





