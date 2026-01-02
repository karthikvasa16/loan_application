# How to Start the Application

## ⚠️ IMPORTANT: Both servers must be running!

The frontend (port 3000) needs the backend (port 5000) to work.

## Option 1: Start Both Servers Together (Recommended)

From the **root directory** of the project:

```bash
npm run dev
```

This will start:
- ✅ Backend server on `http://localhost:5000`
- ✅ Frontend on `http://localhost:3000`

## Option 2: Start Servers Separately

### Terminal 1 - Backend Server:
```bash
cd server
npm run dev
```

Wait for these messages:
- ✅ "Database connection established successfully"
- ✅ "Server running on port 5000"

### Terminal 2 - Frontend Server:
```bash
cd client
npm start
```

## Verify Both Are Running

1. **Check Backend**: Open `http://localhost:5000/api/auth/verify` (should return 401, but that's OK - means server is running)
2. **Check Frontend**: Should open automatically at `http://localhost:3000`

## Troubleshooting

### Error: "ECONNREFUSED" or "Proxy error"
✅ **Solution**: Backend server is not running. Start it first!

### Error: "Port 5000 already in use"
✅ **Solution**: Another process is using port 5000. Stop it or change port in `server/.env`:
```env
PORT=5001
```

### Error: "Database connection error"
✅ **Solution**: 
1. Make sure PostgreSQL is running
2. Check `server/.env` has correct database credentials
3. Create database: `CREATE DATABASE adventus_db;`

## Quick Start Checklist

- [ ] PostgreSQL is running
- [ ] Database `adventus_db` exists
- [ ] `server/.env` file exists with correct credentials
- [ ] Backend server started (port 5000)
- [ ] Frontend server started (port 3000)
- [ ] No port conflicts

Now try registration again! 🚀





