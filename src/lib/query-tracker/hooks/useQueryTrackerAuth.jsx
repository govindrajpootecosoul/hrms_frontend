'use client';

import { useAuth as useMainAuth } from '@/lib/context/AuthContext';

/**
 * Hook to use main authentication in Query Tracker
 * Maps main user to Query Tracker format
 */
export const useQueryTrackerAuth = () => {
  const mainAuth = useMainAuth();
  
  // Map main user to Query Tracker format
  const mapToQueryTrackerUser = (mainUser) => {
    if (!mainUser) return null;
    
    return {
      id: mainUser.id,
      _id: mainUser.id,
      name: mainUser.name,
      email: mainUser.email,
      role: mainUser.role === 'admin' ? 'admin' : 'user', // Map admin role
      phone: mainUser.phone,
      employeeId: mainUser.employeeId,
      department: mainUser.department
    };
  };

  const queryTrackerUser = mapToQueryTrackerUser(mainAuth.user);
  
  const isAdmin = () => {
    return queryTrackerUser?.role === 'admin' || mainAuth.user?.role === 'admin';
  };

  return {
    user: queryTrackerUser,
    loading: mainAuth.loading,
    isAuthenticated: mainAuth.isAuthenticated,
    isAdmin,
    login: mainAuth.login,
    logout: mainAuth.logout
  };
};

