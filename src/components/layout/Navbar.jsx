'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Bell, User, LogOut, Settings, Home } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const Navbar = ({ onMenuToggle, isMenuOpen, menuItems = [] }) => {
  const { user, logout } = useAuth();
  const { currentCompany } = useCompany();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path) =>
    path && (pathname === path || pathname.startsWith(path + '/'));

  // Format company name for display
  const formatCompanyName = (company) => {
    if (!company) return null;
    // Format "Ecosoul Home" to "EcoSoul"
    if (company === 'Ecosoul Home') {
      return 'EcoSoul';
    }
    // Keep "Thrive" as is
    if (company === 'Thrive') {
      return 'Thrive';
    }
    return company;
  };

  // Get selected company from sessionStorage (only on client after mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const company = sessionStorage.getItem('selectedCompany');
      setSelectedCompany(company);
      
      // Also listen for storage changes (in case it's updated from another tab/window)
      const handleStorageChange = (e) => {
        if (e.key === 'selectedCompany') {
          setSelectedCompany(e.newValue);
        }
      };
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [pathname]); // Re-check when pathname changes

  // Get company name (only use state, don't read sessionStorage during render to avoid hydration mismatch)
  const getCompanyName = () => {
    return formatCompanyName(selectedCompany);
  };

  // Determine portal name based on pathname
  // Use a consistent default for SSR, then update on client
  const getPortalName = () => {
    if (pathname?.includes('/asset-tracker')) {
      // During SSR or before hydration, use default. After mount, use company name
      const formattedName = getCompanyName();
      if (formattedName) {
        return `${formattedName} Assets`;
      }
      return 'Assets Management Portal';
    } else if (pathname?.includes('/hrms')) {
      return 'HRMS Admin Portal';
    } else if (pathname?.includes('/finance')) {
      return 'Finance Portal';
    } else if (pathname?.includes('/query-tracker')) {
      return 'Query Tracker Portal';
    } else if (pathname?.includes('/employee-portal')) {
      return 'Employee Portal';
    }
    return 'HRMS Admin Portal'; // Default
  };

  const getPortalWelcome = () => {
    if (pathname?.includes('/asset-tracker')) {
      const formattedName = getCompanyName();
      if (formattedName) {
        return `Welcome to ${formattedName} Assets Management Portal`;
      }
      return 'Welcome to Assets Management Portal';
    } else if (pathname?.includes('/hrms')) {
      return 'Welcome to HRMS Portal';
    } else if (pathname?.includes('/finance')) {
      return 'Welcome to Finance Portal';
    } else if (pathname?.includes('/query-tracker')) {
      return 'Welcome to Query Tracker Portal';
    } else if (pathname?.includes('/employee-portal')) {
      return 'Welcome to Employee Portal';
    }
    return 'Welcome to HRMS Portal'; // Default
  };

  const getPortalLabel = () => {
    if (pathname?.includes('/asset-tracker')) {
      return 'Assets';
    } else if (pathname?.includes('/hrms')) {
      return 'HRMS';
    } else if (pathname?.includes('/finance')) {
      return 'Finance';
    } else if (pathname?.includes('/query-tracker')) {
      return 'Query Tracker';
    } else if (pathname?.includes('/employee-portal')) {
      return 'Employee';
    }
    return 'HRMS'; // Default
  };

  return (
    <nav className="relative bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 sticky top-0 z-40 shadow-lg overflow-hidden">
      {/* Decorative blur circles */}
      <div className="absolute left-0 top-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative max-w-[1600px] mx-auto flex flex-col px-4 sm:px-6 lg:px-8 text-white">
        {/* Top header row */}
        <div className="flex items-center justify-between py-6">
          {/* Left side - brand and title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand and title */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                {currentCompany?.name || 'Company'} {getPortalLabel()}
              </span>
              <h1 className="text-3xl font-semibold text-white leading-tight" suppressHydrationWarning>
                {getPortalName()}
              </h1>
              <p className="text-sm text-slate-200 mt-1" suppressHydrationWarning>
                {getPortalWelcome()}
              </p>
            </div>
          </div>

          {/* Center - company logo */}
          <div className="flex-1 flex justify-center">
            {currentCompany?.logoUrl || currentCompany?.logo || currentCompany?.image ? (
              <div className="w-16 h-16 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center p-2">
                <Image
                  src={
                    currentCompany.logoUrl ||
                    currentCompany.logo ||
                    currentCompany.image
                  }
                  alt={`${currentCompany?.name || 'Company'} logo`}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {currentCompany?.name?.charAt(0) || 'C'}
                </span>
              </div>
            )}
          </div>

          {/* Right side - user actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2 rounded-full bg-white/15 hover:bg-white/20 text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* Back to Select Portal */}
            <button 
              onClick={() => router.push('/select-portal')} 
              className="p-2 rounded-full bg-white/15 hover:bg-white/20 text-white transition-colors"
              title="Back to Select Portal"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 hover:bg-white/20 text-white transition-colors"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-white">
                  {user?.name || 'User'}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        {menuItems.length > 0 && (
          <div className="pb-4 flex justify-center">
            <nav className="flex items-center justify-center space-x-2 overflow-x-auto bg-white/10 backdrop-blur rounded-full px-2 py-2">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    href={item.path || '#'}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                      active
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon && <span className="w-4 h-4 mr-2">{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
