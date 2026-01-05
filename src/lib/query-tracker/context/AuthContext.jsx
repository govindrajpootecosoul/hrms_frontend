'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

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
  const [loading, setLoading] = useState(true);

  const bypassLogin = () => {
    // Bypass login for development - creates a mock admin user
    const mockUser = {
      id: 'bypass-admin',
      _id: 'bypass-admin',
      name: 'Admin User',
      email: 'admin@querytracker.com',
      role: 'admin'
    };
    const mockToken = 'bypass-token-' + Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
    setUser(mockUser);
    return { success: true };
  };

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      setLoading(false);
    } catch (error) {
      // If token verification fails, fall back to bypass login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      bypassLogin();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          verifyToken();
        } catch (error) {
          // Auto-login with bypass user if parsing fails
          bypassLogin();
          setLoading(false);
        }
      } else {
        // Auto-login with bypass user if no user exists
        bypassLogin();
        setLoading(false);
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, bypassLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

