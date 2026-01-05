'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { mockCompany } from '../utils/hrmsMockData';
import { API_BASE_URL } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Map backend user to frontend format
  const mapUserToFrontendFormat = (backendUser) => {
    // Use portals from database - if no portals are checked, show no portals
    let portalAccess = [];
    
    if (backendUser.portals && Array.isArray(backendUser.portals) && backendUser.portals.length > 0) {
      // Map admin portal names to select portal identifiers
      const portalMapping = {
        'HRMS': 'hrms',
        'DataHive': 'datahive',
        'Asset Tracker': 'asset-tracker',
        'Finance Tools': 'finance',
        'Project Tracker': 'project-tracker',
        'Employee Portal': 'employee-portal',
        'Query Tracker': 'query-tracker',
        'Demand / Panel': 'demand-panel'
      };
      
      // Convert admin portal names to select portal identifiers
      portalAccess = backendUser.portals
        .map(portal => portalMapping[portal] || portal.toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean);
    }
    // If no portals are set, portalAccess remains empty array - no portals will be shown

    return {
      id: String(backendUser.id || backendUser._id || ''),
      email: backendUser.email,
      name: backendUser.name,
      phone: backendUser.phone,
      role: backendUser.role,
      employeeId: backendUser.employeeId,
      department: backendUser.department,
      company: backendUser.company,
      portals: backendUser.portals || [], // Store original portal names from database
      portalAccess, // Mapped portal identifiers for filtering
      companies: [
        {
          id: mockCompany.id,
          name: mockCompany.name,
          role: backendUser.role,
          logo: mockCompany.logo
        }
      ]
    };
  };

  useEffect(() => {
    // Check for existing session/token
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Create AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5008); // 5 second timeout

          // Validate token with backend
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              if (data.success && data.user) {
                // Map backend user to frontend format
                const mappedUser = mapUserToFrontendFormat(data.user);
                setUser(mappedUser);
                setIsAuthenticated(true);
              } else {
                localStorage.removeItem('auth_token');
              }
            } else {
              // Response is not JSON (likely HTML error page)
              console.error('Backend returned non-JSON response. Is the server running?');
              localStorage.removeItem('auth_token');
            }
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        console.error('API URL:', `${API_BASE_URL}/auth/verify`);
        console.error('Error details:', error.message);
        // Don't remove token on network errors, just log them
        if (error.name !== 'AbortError' && error.name !== 'TypeError') {
          localStorage.removeItem('auth_token');
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.warn('Backend server may not be running. Please check:', API_BASE_URL);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Backend returned non-JSON response:', text.substring(0, 200));
        const baseUrl = API_BASE_URL.replace('/api', '');
        return {
          success: false,
          error: `Backend server is not responding correctly. Please check if the server is running on ${baseUrl}`
        };
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Map backend user to frontend format
        const mappedUser = mapUserToFrontendFormat(data.user);
        
        setUser(mappedUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', data.token);

        return { success: true, user: mappedUser };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle different types of errors
      let errorMessage = 'Network error. Please check if the backend server is running.';
      
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        const baseUrl = API_BASE_URL.replace('/api', '');
        errorMessage = `Request timed out. Cannot connect to backend server at ${baseUrl}. Please ensure the server is running.`;
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
        const baseUrl = API_BASE_URL.replace('/api', '');
        errorMessage = `Cannot connect to backend server at ${baseUrl}. Please ensure:\n1. The backend server is running\n2. The server is accessible at the configured URL\n3. There are no firewall or network issues\n\nTo start the backend server, run: cd worklytics_HRMS_backend && npm start`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Backend returned non-JSON response:', text.substring(0, 200));
        const baseUrl = API_BASE_URL.replace('/api', '');
        return {
          success: false,
          error: `Backend server is not responding correctly. Please check if the server is running on ${baseUrl}`
        };
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Map backend user to frontend format
        const mappedUser = mapUserToFrontendFormat(data.user);
        
        setUser(mappedUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', data.token);

        return { success: true, user: mappedUser };
      } else {
        return {
          success: false,
          error: data.error || 'Signup failed'
        };
      }
    } catch (error) {
      console.error('Signup failed:', error);
      return { 
        success: false, 
        error: error.message || 'Network error. Please check if the backend server is running.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    // Navigate to login page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
