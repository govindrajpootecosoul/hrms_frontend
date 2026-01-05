import axios from 'axios';
import { API_BASE_URL } from '@/lib/utils/constants';

const API_URL = `${API_BASE_URL}/query-tracker`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests - use main auth_token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[Query Tracker API] Request with token:', {
          url: config.url,
          hasToken: !!token,
          tokenLength: token.length
        });
      } else {
        console.warn('[Query Tracker API] No auth token found in localStorage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors - don't auto-redirect, let components handle it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error but don't auto-redirect
    // Components will handle errors appropriately
    if (error.response?.status === 401) {
      console.warn('Query Tracker API: Unauthorized - user may need to re-authenticate');
    }
    return Promise.reject(error);
  }
);

export default api;

