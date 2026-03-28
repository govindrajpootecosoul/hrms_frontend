import axios from 'axios';

function normalizeQueryTrackerBaseUrl(raw) {
  if (!raw) return null;
  const base = String(raw).replace(/\/+$/, '');
  // If user provides ".../api/query-tracker" use as-is
  if (base.endsWith('/api/query-tracker')) return base;
  // If user provides ".../api" then derive query-tracker base
  if (base.endsWith('/api')) return `${base}/query-tracker`;
  // Otherwise assume it's already the correct base for query-tracker
  return base;
}

// Single-base-url friendly:
// - CRA supports REACT_APP_* env vars
// - When embedded/served alongside Next, NEXT_PUBLIC_API_URL may exist at build-time
const API_URL =
  normalizeQueryTrackerBaseUrl(process.env.REACT_APP_API_URL) ||
  normalizeQueryTrackerBaseUrl(process.env.NEXT_PUBLIC_QUERY_TRACKER_API_URL) ||
  normalizeQueryTrackerBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      // Don't redirect if it's a bypass token (for development)
      if (token && token.startsWith('bypass-token-')) {
        // Silently fail for bypass mode
        return Promise.reject(error);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

