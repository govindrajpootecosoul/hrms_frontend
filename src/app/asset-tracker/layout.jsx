'use client';

import { useState, useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import Navbar from '@/components/layout/Navbar';
import { ASSET_TRACKER_MENU_ITEMS } from '@/components/layout/Sidebar';

export default function AssetTrackerLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentCompany } = useCompany();
  const pathname = usePathname();
  const params = useParams();
  
  // Get companyId from params, currentCompany, or sessionStorage
  const getCompanyId = () => {
    // First try params (from URL)
    if (params?.companyId && params.companyId !== 'undefined') {
      return params.companyId;
    }
    // Then try currentCompany
    if (currentCompany?.id) {
      return currentCompany.id;
    }
    // Finally try sessionStorage
    if (typeof window !== 'undefined') {
      const storedId = sessionStorage.getItem('selectedCompany') || 
                      sessionStorage.getItem('selected_company_id') ||
                      localStorage.getItem('selected_company_id');
      if (storedId && storedId !== 'undefined') {
        return storedId;
      }
    }
    return null;
  };

  const companyId = getCompanyId();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Build menu items for top navigation
  const mappedMenuItems = useMemo(
    () => {
      if (!companyId) {
        // Return original paths if no companyId available
        return ASSET_TRACKER_MENU_ITEMS;
      }
      return ASSET_TRACKER_MENU_ITEMS.map((item) => ({
        ...item,
        path: item.path
          ? `/asset-tracker/${companyId}${item.path.replace('/asset-tracker', '')}`
          : item.path,
        children: item.children
          ? item.children.map((child) => ({
              ...child,
              path: `/asset-tracker/${companyId}${child.path.replace('/asset-tracker', '')}`,
            }))
          : item.children,
      }));
    },
    [companyId]
  );

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
