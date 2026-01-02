# How to Start PostgreSQL on Windows

## Method 1: Using Services (Recommended)

1. **Open Services**:
   - Press `Win + R` to open Run dialog
   - Type `services.msc` and press Enter
   - Or search for "Services" in the Start menu

2. **Find PostgreSQL Service**:
   - Look for `postgresql-x64-18` (or similar name)
   - Right-click on it
   - Select **"Start"**

3. **Verify it's Running**:
   - The Status should change to "Running"
   - You can also set it to "Automatic" so it starts on boot

## Method 2: Using Command Prompt (as Administrator)

1. **Open Command Prompt as Administrator**:
   - Right-click on Command Prompt or PowerShell
   - Select "Run as administrator"

2. **Start the Service**:
   ```powershell
   net start postgresql-x64-18
   ```

   Or using PowerShell:
   ```powershell
   Start-Service -Name postgresql-x64-18
   ```

## Method 3: Using pg_ctl (if installed)

If PostgreSQL is installed but not as a service:

```bash
cd "C:\Program Files\PostgreSQL\18\bin"
pg_ctl -D "C:\Program Files\PostgreSQL\18\data" start
```

## Verify PostgreSQL is Running

After starting, verify the connection:

```bash
# Test connection (replace with your password)
psql -U postgres -h localhost -p 5432
```

Or check if the port is listening:
```powershell
netstat -an | findstr 5432
```

## Troubleshooting

### Service Won't Start

1. **Check PostgreSQL Installation**:
   - Verify PostgreSQL is installed correctly
   - Check installation path: `C:\Program Files\PostgreSQL\18\`

2. **Check Logs**:
   - Look in: `C:\Program Files\PostgreSQL\18\data\log\`
   - Check for error messages

3. **Port Already in Use**:
   - Another PostgreSQL instance might be running
   - Check: `netstat -ano | findstr :5432`

4. **Database Directory Issues**:
   - Ensure data directory exists and has correct permissions
   - Default: `C:\Program Files\PostgreSQL\18\data\`

### Still Having Issues?

1. **Reinstall PostgreSQL** (if needed):
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, make sure to:
     - Set a password for the `postgres` user
     - Note the port (default: 5432)
     - Install as a Windows service

2. **Check .env Configuration**:
   - Verify `DB_PASSWORD` matches your PostgreSQL password
   - Verify `DB_PORT` matches your PostgreSQL port (default: 5432)
   - Verify `DB_HOST` is `localhost`

## After Starting PostgreSQL

Once PostgreSQL is running, restart your server:

```bash
cd server
npm run dev
```

The server should now connect successfully! ✅

