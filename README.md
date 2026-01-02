# Adventus Admin Portal

A comprehensive recruiter management system built with React and Node.js, featuring a modern UI and efficient backend architecture.

## Features

### Pages
- **Login Page**: Secure authentication with email/password, password visibility toggle, and remember me option
- **Dashboard**: 
  - 4 stat cards (Students, Applications, Approved, Revenue)
  - Application trends chart
  - Recent activities feed
  - Top universities list
  - Pending actions panel
- **Students Page**: Searchable student table with status badges, action buttons, and add student functionality
- **Applications Page**: Card-based application layout with filters by status and university, approve/view/download actions
- **Universities Page**: University directory grid with application statistics and search functionality
- **Reports Page**: Analytics charts (donut chart, bar charts), performance metrics, and export functionality
- **Settings Page**: Profile settings, account preferences, notification toggles, and security (password change)

### Key Features
- **Navigation**: Sidebar with active states, mobile-responsive menu
- **Routing**: Client-side router for page navigation
- **Authentication**: JWT-based login with session management
- **Responsive**: Works on mobile, tablet, and desktop
- **Charts**: Recharts-based visualization for trends and metrics
- **Modern UI**: Smooth animations, hover effects, consistent design system

## Tech Stack

### Frontend
- React 18.2.0
- React Router DOM 6.20.1
- Recharts 2.10.3 (for charts)
- Lucide React (for icons)
- Axios (for API calls)

### Backend
- Node.js
- Express 4.18.2
- JWT (JSON Web Tokens) for authentication
- Bcrypt for password hashing
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

### 1. Install Dependencies

Install root dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

Install backend dependencies:
```bash
cd server
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

The frontend will automatically open in your browser. If it doesn't, navigate to `http://localhost:3000`.

### Running Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### Production Mode

1. Build the React app:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Default Login Credentials

- **Email**: `admin@adventus.io`
- **Password**: `admin123`

## Project Structure

```
adventus-admin-portal/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       │   ├── Layout.js
│       │   └── Sidebar.js
│       ├── contexts/       # React contexts
│       │   └── AuthContext.js
│       ├── pages/         # Page components
│       │   ├── Login.js
│       │   ├── Dashboard.js
│       │   ├── Students.js
│       │   ├── Applications.js
│       │   ├── Universities.js
│       │   ├── Reports.js
│       │   └── Settings.js
│       ├── App.js         # Main app component
│       └── index.js      # Entry point
├── server/                # Node.js backend
│   ├── data/
│   │   └── mockData.js   # Mock data for development
│   └── index.js          # Express server
├── package.json          # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get application trends
- `GET /api/dashboard/activities` - Get recent activities

### Students
- `GET /api/students` - Get all students (supports search and status filter)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student

### Applications
- `GET /api/applications` - Get all applications (supports status and university filter)
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id/approve` - Approve application

### Universities
- `GET /api/universities` - Get all universities (supports search)
- `GET /api/universities/:id` - Get university by ID

### Reports
- `GET /api/reports/analytics` - Get analytics data

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/change-password` - Change password

## Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## Development Notes

- The backend uses mock data stored in `server/data/mockData.js`
- For production, replace mock data with a real database (MongoDB, PostgreSQL, etc.)
- Update JWT_SECRET in production
- Add environment-specific configurations
- Implement proper error handling and logging
- Add input validation and sanitization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ for Adventus Education
