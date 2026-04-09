'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { EMPLOYEE_PORTAL_MENU_ITEMS } from '@/components/layout/Sidebar';

export default function EmployeePortalLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Auto-redirect to login without showing dialog
      router.replace('/login');
    }
  }, [user, loading, router]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Build menu items for top navigation
  const mappedMenuItems = useMemo(
    () => {
      return EMPLOYEE_PORTAL_MENU_ITEMS.map((item) => ({
        ...item,
        path: item.path || '',
        children: item.children
          ? item.children.map((child) => ({
              ...child,
              path: child.path || '',
            }))
          : item.children,
      }));
    },
    []
  );

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        onMenuToggle={toggleMenu}
        isMenuOpen={isMenuOpen}
        menuItems={mappedMenuItems}
      />
      
      <main className="w-full">
        <div className="max-w-[1600px] mx-auto w-full px-4 py-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
