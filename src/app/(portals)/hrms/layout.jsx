'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import Navbar from '@/components/layout/Navbar';
import { HRMS_MENU_ITEMS } from '@/components/layout/Sidebar';

export default function HRMSLayout({ children }) {
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
        return HRMS_MENU_ITEMS;
      }
      return HRMS_MENU_ITEMS.map((item) => ({
        ...item,
        path: item.path
          ? `/hrms/${companyId}${item.path.replace('/hrms', '')}`
          : item.path,
        children: item.children
          ? item.children.map((child) => ({
              ...child,
              path: `/hrms/${companyId}${child.path.replace('/hrms', '')}`,
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
          {pathname?.includes('/dashboard') ||
          pathname?.includes('/recruitment') ||
          pathname?.includes('/employees') ||
          pathname?.includes('/reports') ||
          pathname?.includes('/attendance') ||
          pathname?.includes('/leaves') ||
          pathname?.includes('/expenses') ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="text-center space-y-2">
                {(() => {
                  // Find the active menu item or child item
                  let activeLabel = 'Page';
                  for (const item of mappedMenuItems) {
                    if (pathname?.includes(item.path?.replace(`/hrms/${companyId || ''}`, '') || '')) {
                      activeLabel = item.label;
                      break;
                    }
                    if (item.children) {
                      const child = item.children.find(child => 
                        pathname?.includes(child.path?.replace(`/hrms/${companyId || ''}`, '') || '')
                      );
                      if (child) {
                        activeLabel = child.label;
                        break;
                      }
                    }
                  }
                  return (
                    <>
                      <h2 className="text-3xl font-bold text-slate-900">{activeLabel}</h2>
                      <p className="text-xl text-slate-600">Incoming</p>
                      <p className="text-sm text-slate-500 mt-4">This section is coming soon. Design will be provided shortly.</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
