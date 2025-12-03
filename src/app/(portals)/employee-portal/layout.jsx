'use client';

import { useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { EMPLOYEE_PORTAL_MENU_ITEMS } from '@/components/layout/Sidebar';

export default function EmployeePortalLayout({ children }) {
  // Build menu items for top navigation
  const mappedMenuItems = useMemo(
    () => EMPLOYEE_PORTAL_MENU_ITEMS,
    []
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar 
        onMenuToggle={() => {}} 
        isMenuOpen={false}
        menuItems={mappedMenuItems}
      />

      <main className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}


