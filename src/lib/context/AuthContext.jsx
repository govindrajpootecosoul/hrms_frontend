'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { mockCompany } from '../utils/hrmsMockData';

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

  useEffect(() => {
    // Check for existing session/token
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual API call
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Validate token with backend
          // const userData = await validateToken(token);
          // setUser(userData);
          // setIsAuthenticated(true);
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

      // TODO: Replace with actual API call
      // For development, we support two mock identities keyed by email.
      const trimmedEmail = (email || '').toLowerCase().trim();

      const MOCK_USERS = {
        // Super admin / admin user – full portal access
        'admin@demo.com': {
          id: 'admin-1',
          email: 'admin@demo.com',
          name: 'Demo Admin',
          role: 'admin',
          portalAccess: ['hrms-admin', 'asset-tracker', 'employee-portal'],
          companies: [
            {
              id: mockCompany.id,
              name: mockCompany.name,
              role: 'admin',
              logo: mockCompany.logo
            }
          ]
        },
        // Employee user – employee self-service portal only
        'employee@demo.com': {
          id: 'employee-1',
          email: 'employee@demo.com',
          name: 'Demo Employee',
          role: 'employee',
          portalAccess: ['employee-portal'],
          companies: [
            {
              id: mockCompany.id,
              name: mockCompany.name,
              role: 'employee',
              logo: mockCompany.logo
            }
          ]
        }
      };

      const mockUser = MOCK_USERS[trimmedEmail];

      if (!mockUser) {
        return {
          success: false,
          error: 'Invalid mock credentials. Use the demo IDs shown on the login screen.'
        };
      }

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth_token', 'mock_token');

      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
