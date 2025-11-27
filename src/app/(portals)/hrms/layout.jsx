'use client';

import { useState, useMemo } from 'react';
import { useCompany } from '@/lib/context/CompanyContext';
import Navbar from '@/components/layout/Navbar';
import { HRMS_MENU_ITEMS } from '@/components/layout/Sidebar';

export default function HRMSLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentCompany } = useCompany();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Build menu items for top navigation
  const mappedMenuItems = useMemo(
    () =>
      HRMS_MENU_ITEMS.map((item) => ({
        ...item,
        path: item.path
          ? `/hrms/${currentCompany?.id}${item.path.replace('/hrms', '')}`
          : item.path,
        children: item.children
          ? item.children.map((child) => ({
              ...child,
              path: `/hrms/${currentCompany?.id}${child.path.replace('/hrms', '')}`,
            }))
          : item.children,
      })),
    [currentCompany?.id]
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar
        onMenuToggle={toggleMenu}
        isMenuOpen={isMenuOpen}
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
