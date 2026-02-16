import axios from 'axios';

// API URL must be set in .env.local file as NEXT_PUBLIC_QUERY_TRACKER_API_URL
// For React apps, use REACT_APP_API_URL or NEXT_PUBLIC_QUERY_TRACKER_API_URL
const API_URL = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_QUERY_TRACKER_API_URL;

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

