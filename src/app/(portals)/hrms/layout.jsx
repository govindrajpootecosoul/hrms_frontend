'use client';

import { useState } from 'react';
import { useCompany } from '@/lib/context/CompanyContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar, { HRMS_MENU_ITEMS } from '@/components/layout/Sidebar';

export default function HRMSLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentCompany } = useCompany();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
      
      <div className="flex">
        <Sidebar 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)}
          menuItems={HRMS_MENU_ITEMS.map(item => ({
            ...item,
            path: item.path ? `/hrms/${currentCompany?.id}${item.path.replace('/hrms', '')}` : item.path,
            children: item.children ? item.children.map(child => ({
              ...child,
              path: `/hrms/${currentCompany?.id}${child.path.replace('/hrms', '')}`
            })) : item.children
          }))}
        />
        
        <main className="flex-1 w-max-7xl">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
