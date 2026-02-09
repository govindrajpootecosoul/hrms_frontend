'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  employeeId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for client-side authentication (bypass login)
const mockUsers: User[] = [
  { id: '1', email: 'admin@vectorlytics.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'hr@vectorlytics.com', password: 'hr123', name: 'HR Manager', role: 'hr', employeeId: 'EMP001' },
  { id: '3', email: 'manager@vectorlytics.com', password: 'manager123', name: 'Department Manager', role: 'manager', employeeId: 'EMP002' },
  { id: '4', email: 'employee@vectorlytics.com', password: 'employee123', name: 'John Doe', role: 'employee', employeeId: 'EMP003' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem('user');
        }
      } else {
        // Auto-login as admin by default
        const adminUser = mockUsers.find(u => u.role === 'admin');
        if (adminUser) {
          const { password: _, ...userWithoutPassword } = adminUser;
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setUser(userWithoutPassword);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Client-side authentication - bypass backend completely
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      throw new Error('Invalid credentials. Please check your email and password.');
    }

    // Remove password before storing
    const { password: _, ...userWithoutPassword } = foundUser;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    }
    setUser(userWithoutPassword);
    return userWithoutPassword;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
