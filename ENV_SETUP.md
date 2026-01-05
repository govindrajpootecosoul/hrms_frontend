# Environment Variables Setup

## 📋 Overview

All API base URLs are configured via environment variables. No hardcoded URLs should be used in the codebase.

## 🔧 Environment Files

### `.env.local` (Local Development)
- **Purpose:** Local development configuration
- **Status:** Already created and configured
- **Git:** Ignored (not committed to repository)

### `.env.example` (Template)
- **Purpose:** Template file showing required environment variables
- **Status:** Created for reference
- **Git:** Should be committed to repository

### `.env` (Production)
- **Purpose:** Production environment variables
- **Status:** Create this file for production deployment
- **Git:** Ignored (never commit production secrets)

## 🌐 Environment Variables

### `NEXT_PUBLIC_API_URL`
**Required:** Yes  
**Description:** Base URL for the backend API  
**Default:** `http://localhost:5008/api`  
**Example:**
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:5008/api

# Production
NEXT_PUBLIC_API_URL=http://your-production-server:5008/api
```

### `NEXT_PUBLIC_QUERY_TRACKER_API_URL`
**Required:** No (optional)  
**Description:** Dedicated URL for Query Tracker API  
**Default:** `${NEXT_PUBLIC_API_URL}/query-tracker`  
**Example:**
```env
# If not set, will use: http://localhost:5008/api/query-tracker
NEXT_PUBLIC_QUERY_TRACKER_API_URL=http://localhost:5008/api/query-tracker
```

## 📝 Usage in Code

### Main API Calls
All API calls use `API_BASE_URL` from `src/lib/utils/constants.js`:

```javascript
import { API_BASE_URL } from '@/lib/utils/constants';

// API call
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  // ...
});
```

### Query Tracker API
Query Tracker uses its own API client:

```javascript
import api from '@/app/(portals)/query-tracker/lib/api';

// API call (baseURL is already configured)
const response = await api.get('/queries');
```

## 🚀 Setup Instructions

### 1. Local Development
The `.env.local` file is already created with default values:
```env
NEXT_PUBLIC_API_URL=http://localhost:5008/api
```

### 2. Production
Create `.env` file in the frontend root:
```env
NEXT_PUBLIC_API_URL=http://your-production-server:5008/api
```

### 3. Different Environments
You can create environment-specific files:
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.staging` - Staging environment

## ⚠️ Important Notes

1. **Next.js Environment Variables:**
   - Must start with `NEXT_PUBLIC_` to be accessible in the browser
   - Changes require server restart to take effect

2. **No Hardcoded URLs:**
   - All API URLs should use environment variables
   - Error messages also use environment variables

3. **Security:**
   - Never commit `.env.local` or `.env` files
   - Only commit `.env.example` as a template
   - Use different URLs for different environments

## 🔍 Verification

To verify environment variables are loaded:

```javascript
// In any component or page
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

## 📚 Related Files

- `src/lib/utils/constants.js` - Exports `API_BASE_URL`
- `src/app/(portals)/query-tracker/lib/api.js` - Query Tracker API client
- `src/lib/context/AuthContext.jsx` - Uses `API_BASE_URL` for auth

## 🛠️ Troubleshooting

### Issue: Environment variable not working
**Solution:**
1. Restart Next.js dev server: `npm run dev`
2. Verify variable name starts with `NEXT_PUBLIC_`
3. Check file is named correctly (`.env.local` for local)

### Issue: API calls failing
**Solution:**
1. Verify backend is running on the URL specified in `.env.local`
2. Check CORS configuration on backend
3. Verify network connectivity

### Issue: Different URL needed
**Solution:**
1. Update `.env.local` with new URL
2. Restart Next.js dev server
3. Clear browser cache if needed

