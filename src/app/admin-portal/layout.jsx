'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { AdminPortalProvider } from '@/lib/context/AdminPortalContext';
import { AdminLayout } from '@/components/admin-portal/layout/AdminLayout';

export default function AdminPortalLayout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      // Check if user is superadmin or admin
      if (user?.role !== 'superadmin' && user?.role !== 'admin') {
        router.push('/select-portal');
        return;
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'superadmin' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <AdminPortalProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminPortalProvider>
  );
}

