# Query Tracker - Standalone React Application

## Location
The Query Tracker frontend code is stored in:
```
worklytics_HRMS_frontend/projects/query-tracker/
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd worklytics_HRMS_frontend/projects/query-tracker
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `projects/query-tracker` directory:
```env
REACT_APP_API_URL=http://192.168.50.107:5008/api
```

### 3. Run the Application
```bash
npm start
```

The app will run on `http://localhost:3001` (or next available port).

## Integration with Main Portal

The Query Tracker is accessible from the main portal selection page. When users click "Enter Query Tracker", they will be redirected to this standalone React application.

## Backend Requirements

**IMPORTANT:** The Query Tracker React app requires the backend API routes to be available. 

The backend code should be in:
```
worklytics_HRMS_backend/query-tracker-portal/
```

If the backend folder was deleted, you need to restore it or recreate the API routes:
- `/api/query-tracker/auth/*` - Authentication routes
- `/api/query-tracker/queries/*` - Query management routes
- `/api/query-tracker/reports/*` - Reports routes
- `/api/query-tracker/users/*` - User management routes

## Development

### Running in Development Mode
```bash
npm start
```

### Building for Production
```bash
npm run build
```

The build output will be in the `build/` directory.

## Features

- Dashboard with query statistics
- Query list and management
- Reports generation
- User settings (admin only)
- Multi-platform query tracking
