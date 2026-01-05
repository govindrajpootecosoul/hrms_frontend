'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryTrackerAuth } from '../hooks/useQueryTrackerAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useQueryTrackerAuth();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!loading && !redirected) {
      if (!isAuthenticated) {
        // Redirect to main login if not authenticated
        setRedirected(true);
        router.push('/login');
      } else if (adminOnly && user && !isAdmin()) {
        // Redirect non-admin users away from admin-only pages
        setRedirected(true);
        router.push('/query-tracker/dashboard');
      }
    }
  }, [user, loading, isAuthenticated, adminOnly, isAdmin, router, redirected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg p-8 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || redirected) {
    return null;
  }

  // Only restrict if adminOnly and user is not admin
  if (adminOnly && user && !isAdmin()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;

