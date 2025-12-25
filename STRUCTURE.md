# Frontend Project Structure

This frontend is organized by portal to make the code structure easier to understand and maintain.

## Directory Structure

```
worklytics_HRMS_frontend/
├── src/
│   ├── app/
│   │   ├── api/                      # Next.js API routes
│   │   │   ├── finance/              # Finance Portal API routes
│   │   │   │   ├── amazon-tax-invoice/
│   │   │   │   └── amazon-credit-note/
│   │   │   ├── hrms/                 # HRMS Portal API routes
│   │   │   ├── asset-tracker/        # Asset Tracker Portal API routes
│   │   │   └── employee/              # Employee Portal API routes
│   │   │
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── select-portal/
│   │   │
│   │   └── (portals)/                 # Portal pages
│   │       ├── hrms/                  # HRMS Portal pages
│   │       ├── asset-tracker/         # Asset Tracker Portal pages
│   │       ├── finance/               # Finance Portal pages
│   │       └── employee-portal/       # Employee Portal pages
│   │
│   ├── components/
│   │   ├── hrms/                      # HRMS-specific components
│   │   ├── asset-tracker/             # Asset Tracker-specific components
│   │   ├── finance/                   # Finance-specific components
│   │   └── common/                    # Shared components
│   │
│   └── lib/
│       ├── context/                   # React contexts
│       └── utils/                      # Utility functions
│
├── projects/                          # Individual portal projects (monorepo)
│   ├── hrms-portal/
│   ├── asset-tracker-portal/
│   ├── finance-portal/
│   └── employee-portal/
│
└── packages/                          # Shared packages
    ├── shared/                        # Common components and utilities
    └── auth/                          # Authentication package
```

## Portal Organization

### HRMS Portal
- **Pages**: `src/app/(portals)/hrms/`
- **Components**: `src/components/hrms/`
- **API Routes**: `src/app/api/hrms/`
- **Project**: `projects/hrms-portal/`

### Asset Tracker Portal
- **Pages**: `src/app/(portals)/asset-tracker/`
- **Components**: `src/components/asset-tracker/`
- **API Routes**: `src/app/api/asset-tracker/`
- **Project**: `projects/asset-tracker-portal/`

### Finance Portal
- **Pages**: `src/app/(portals)/finance/`
- **Components**: `src/components/finance/`
- **API Routes**: `src/app/api/finance/`
- **Project**: `projects/finance-portal/`

### Employee Portal
- **Pages**: `src/app/(portals)/employee-portal/`
- **Components**: (uses shared components)
- **API Routes**: `src/app/api/employee/`
- **Project**: `projects/employee-portal/`

## API Routes

Frontend API routes in `src/app/api/` are Next.js API routes that can:
- Proxy requests to the backend
- Handle file uploads/processing
- Provide server-side functionality

Each portal has its own API route folder:
- `/api/hrms/*` - HRMS Portal API routes
- `/api/asset-tracker/*` - Asset Tracker Portal API routes
- `/api/finance/*` - Finance Portal API routes
- `/api/employee/*` - Employee Portal API routes

## Backend API Integration

When making API calls to the backend server, use the following base URLs:

- **Shared**: `http://localhost:5000/api/auth/*`
- **HRMS**: `http://localhost:5000/api/hrms/*`
- **Asset Tracker**: `http://localhost:5000/api/asset-tracker/*`
- **Finance**: `http://localhost:5000/api/finance/*`
- **Employee**: `http://localhost:5000/api/employee/*`

## Notes

- Portal-specific components are organized in their respective folders
- Shared/common components are in `src/components/common/`
- Each portal can have its own API routes for Next.js server-side functionality
- The monorepo structure in `projects/` allows each portal to be developed independently


