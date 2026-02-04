'use client';

import { useState, useEffect } from 'react';
import { useAuth as useMainAuth } from '@/lib/context/AuthContext';
import api from '../utils/api';

/**
 * Hook to use main authentication in Query Tracker
 * Maps main user to Query Tracker format and fetches Query Tracker user ID
 */
export const useQueryTrackerAuth = () => {
  const mainAuth = useMainAuth();
  const [queryTrackerUser, setQueryTrackerUser] = useState(null);
  const [loadingQueryTrackerUser, setLoadingQueryTrackerUser] = useState(true);
  
  // Fetch Query Tracker user info to get the correct user ID
  useEffect(() => {
    const fetchQueryTrackerUser = async () => {
      if (!mainAuth.isAuthenticated || !mainAuth.user) {
        setQueryTrackerUser(null);
        setLoadingQueryTrackerUser(false);
        return;
      }

      try {
        setLoadingQueryTrackerUser(true);
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          const qtUser = response.data.user;
          setQueryTrackerUser({
            id: qtUser.id,
            _id: qtUser.id, // This is the Query Tracker user ID
            name: qtUser.name || mainAuth.user.name,
            email: qtUser.email || mainAuth.user.email,
            role: qtUser.role || (mainAuth.user.role === 'admin' ? 'admin' : 'user'),
            phone: mainAuth.user.phone,
            employeeId: mainAuth.user.employeeId,
            department: mainAuth.user.department
          });
        } else {
          // Fallback to main auth user if Query Tracker user not found
          setQueryTrackerUser({
            id: mainAuth.user.id,
            _id: mainAuth.user.id,
            name: mainAuth.user.name,
            email: mainAuth.user.email,
            role: mainAuth.user.role === 'admin' ? 'admin' : 'user',
            phone: mainAuth.user.phone,
            employeeId: mainAuth.user.employeeId,
            department: mainAuth.user.department
          });
        }
      } catch (error) {
        console.error('[useQueryTrackerAuth] Error fetching Query Tracker user:', error);
        // Fallback to main auth user on error
        setQueryTrackerUser({
          id: mainAuth.user.id,
          _id: mainAuth.user.id,
          name: mainAuth.user.name,
          email: mainAuth.user.email,
          role: mainAuth.user.role === 'admin' ? 'admin' : 'user',
          phone: mainAuth.user.phone,
          employeeId: mainAuth.user.employeeId,
          department: mainAuth.user.department
        });
      } finally {
        setLoadingQueryTrackerUser(false);
      }
    };

    fetchQueryTrackerUser();
  }, [mainAuth.isAuthenticated, mainAuth.user]);
  
  const isAdmin = () => {
    return queryTrackerUser?.role === 'admin' || mainAuth.user?.role === 'admin';
  };

  return {
    user: queryTrackerUser,
    loading: mainAuth.loading || loadingQueryTrackerUser,
    isAuthenticated: mainAuth.isAuthenticated,
    isAdmin,
    login: mainAuth.login,
    logout: mainAuth.logout
  };
};

