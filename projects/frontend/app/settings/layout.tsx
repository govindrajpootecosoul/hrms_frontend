'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AdminAppShell } from '@/components/layout/AdminAppShell';

const ADMIN_ROLES = ['admin', 'hr', 'manager'];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!ADMIN_ROLES.includes(user.role)) {
        router.push('/employee');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return null;
  }

  return <AdminAppShell user={user} onLogout={logout}>{children}</AdminAppShell>;
}
