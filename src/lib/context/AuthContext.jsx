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
    // Determine portal access based on role
    const portalAccess = backendUser.role === 'admin' 
      ? ['hrms-admin', 'asset-tracker', 'employee-portal']
      : ['employee-portal'];

    return {
      id: String(backendUser.id || backendUser._id || ''),
      email: backendUser.email,
      name: backendUser.name,
      phone: backendUser.phone,
      role: backendUser.role,
      employeeId: backendUser.employeeId,
      department: backendUser.department,
      company: backendUser.company,
      portalAccess,
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
          // Validate token with backend
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

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
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Backend returned non-JSON response:', text.substring(0, 200));
        return {
          success: false,
          error: 'Backend server is not responding correctly. Please check if the server is running on http://localhost:5000'
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
      return { 
        success: false, 
        error: error.message || 'Network error. Please check if the backend server is running.'
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
        return {
          success: false,
          error: 'Backend server is not responding correctly. Please check if the server is running on http://localhost:5000'
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
