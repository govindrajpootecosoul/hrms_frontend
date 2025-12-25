# Troubleshooting Guide

## "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" Error

This error occurs when the frontend receives HTML instead of JSON from the backend API. This usually means:

### Common Causes:

1. **Backend server is not running**
   - The backend server must be running on `http://localhost:5000`
   - Start it with: `cd worklytics_HRMS_backend && npm run dev`

2. **Backend server crashed or has errors**
   - Check the backend console for error messages
   - Verify all route files exist and are properly configured

3. **Wrong API URL**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local` (if set)
   - Default is `http://localhost:5000/api`

4. **CORS issues**
   - Backend should have CORS enabled (already configured)
   - Check browser console for CORS errors

### Solution Steps:

1. **Start the backend server:**
   ```bash
   cd worklytics_HRMS_backend
   npm run dev
   ```

2. **Verify backend is running:**
   - Open: http://localhost:5000/api/health
   - Should return: `{"status":"OK","message":"Server is running"}`

3. **Check browser console:**
   - Look for the actual error message
   - Check Network tab to see what the API is returning

4. **Restart both servers:**
   ```bash
   # Terminal 1 - Backend
   cd worklytics_HRMS_backend
   npm run dev

   # Terminal 2 - Frontend
   cd worklytics_HRMS_frontend
   npm run dev
   ```

### Updated Error Handling:

The frontend now checks if the response is JSON before parsing. If you see:
- "Backend server is not responding correctly"
- This means the backend returned HTML instead of JSON
- Start the backend server and try again


