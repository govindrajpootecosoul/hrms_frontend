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
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // Mock login for development
      const mockUser = {
        id: '1',
        email,
        name: 'John Doe',
        companies: [
          { id: mockCompany.id, name: mockCompany.name, role: 'admin', logo: mockCompany.logo },
          { id: '2', name: 'Thrive Brands', role: 'user' }
        ]
      };
      
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
