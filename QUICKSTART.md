# Quick Start Guide

## Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

**Or use the convenience command:**
```bash
npm run install-all
```

### Step 2: Start the Application

```bash
npm run dev
```

This will start:
- ✅ Backend server on `http://localhost:5000`
- ✅ Frontend on `http://localhost:3000`

The browser should open automatically to `http://localhost:3000`

### Step 3: Login

Use these credentials:
- **Email**: `admin@adventus.io`
- **Password**: `admin123`

---

## What You'll See

### 🎯 Dashboard
- View statistics (Students, Applications, Approved, Revenue)
- See application trends chart
- Check recent activities
- View top universities

### 👥 Students
- Browse all students
- Search and filter by status
- Add new students

### 📋 Applications
- View all applications in card layout
- Filter by status and university
- Approve pending applications

### 🎓 Universities
- Browse university directory
- View application statistics
- Search universities

### 📊 Reports
- Analytics charts
- Performance metrics
- Export reports

### ⚙️ Settings
- Update profile
- Change preferences
- Manage security settings

---

## Troubleshooting

### Port Already in Use?
If port 3000 or 5000 is already in use:
- **Frontend**: Change port in `client/package.json` scripts or use `PORT=3001 npm start` in client folder
- **Backend**: Set `PORT=5001` in `server/.env` file

### Module Not Found?
Make sure you've installed all dependencies:
```bash
npm run install-all
```

### Login Not Working?
Ensure the backend server is running on port 5000. Check the terminal for any errors.

---

## Next Steps

1. Explore all the pages
2. Try adding a new student
3. Approve some applications
4. Check the reports and analytics
5. Customize the settings

Enjoy your Adventus Admin Portal! 🚀
