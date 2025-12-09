# Worklytics - Multi-Portal System

A monorepo containing four separate portal projects for HRMS, Asset Tracker, Finance, and Employee Self-Service.

## Project Structure

```
worklytics_HRMSAsset_NextJS/
├── packages/              # Shared packages
│   ├── shared/           # Common components, contexts, and utilities
│   └── auth/             # Authentication and portal selection
│
├── projects/             # Individual portal projects
│   ├── hrms-portal/      # HRMS Portal (Port 3001)
│   ├── asset-tracker-portal/  # Asset Tracker Portal (Port 3002)
│   ├── finance-portal/   # Finance Portal (Port 3003)
│   └── employee-portal/   # Employee Portal (Port 3004)
│
└── brain/               # Project documentation (DO NOT DELETE)
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Install dependencies from root:
```bash
pnpm install
```

2. Install dependencies for each project:
```bash
cd projects/hrms-portal && pnpm install
cd ../asset-tracker-portal && pnpm install
cd ../finance-portal && pnpm install
cd ../employee-portal && pnpm install
cd ../../packages/auth && pnpm install
```

### Running Projects

Each portal runs on a separate port:

```bash
# Auth & Portal Selection
cd packages/auth
pnpm dev          # http://localhost:3000

# HRMS Portal
cd projects/hrms-portal
pnpm dev          # http://localhost:3001

# Asset Tracker Portal
cd projects/asset-tracker-portal
pnpm dev          # http://localhost:3002

# Finance Portal
cd projects/finance-portal
pnpm dev          # http://localhost:3003

# Employee Portal
cd projects/employee-portal
pnpm dev          # http://localhost:3004
```

## Portals

### 1. HRMS Portal
Human Resource Management System for managing employees, attendance, leaves, recruitment, and HR operations.

**Port:** 3001

### 2. Asset Tracker Portal
Asset Management and Tracking system for managing company assets, assignments, and maintenance.

**Port:** 3002

### 3. Finance Portal
Financial Operations and Accounting portal for managing finances, budgets, invoices, and financial reporting.

**Port:** 3003

### 4. Employee Portal
Employee Self-Service portal where employees can view their profile, leaves, attendance, and payroll information.

**Port:** 3004

## Shared Packages

### `@worklytics/shared`
Contains common components, contexts, and utilities used across all portals:
- Common UI components (Button, Card, Input, Modal, etc.)
- Layout components (Navbar, Sidebar, PageHeader)
- Charts components
- Context providers (AuthContext, CompanyContext)
- Utilities and helpers

## Development

### Adding New Features

1. **Portal-Specific Features**: Add to the respective portal project
2. **Shared Features**: Add to `packages/shared`
3. **Auth Features**: Add to `packages/auth`

### Building for Production

```bash
# Build all projects
cd projects/hrms-portal && pnpm build
cd ../asset-tracker-portal && pnpm build
cd ../finance-portal && pnpm build
cd ../employee-portal && pnpm build
cd ../../packages/auth && pnpm build
```

## Documentation

See the `/brain` folder for detailed documentation:
- `project-structure-plan.md` - Overall structure plan
- `migration-guide.md` - Migration guide from monolithic to separated structure
- `hrms-portal.md` - HRMS Portal documentation
- `asset-tracker-portal.md` - Asset Tracker Portal documentation
- `finance-portal.md` - Finance Portal documentation
- `employee-portal.md` - Employee Portal documentation

## Notes

- The `/brain` folder contains important project documentation and should **NEVER** be deleted
- Each portal is an independent Next.js application
- Shared code is maintained in `packages/shared`
- Use pnpm workspaces for managing dependencies across projects

