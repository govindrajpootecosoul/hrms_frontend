'use client';

import { useState } from 'react';
import { Menu, X, Bell, User, LogOut, Settings, Home } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Link from 'next/link';

const Navbar = ({ onMenuToggle, isMenuOpen }) => {
  const { user, logout } = useAuth();
  const { currentCompany } = useCompany();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="flex flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 lg:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center ml-4">
              {/* Company Logo/Name */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-neutral-900 font-bold text-sm">
                    {currentCompany?.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-neutral-900">
                    {currentCompany?.name || 'Company'}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <button className="p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Back to Home button (rightmost) */}
            <Link href="/select-portal" className="ml-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Home className="w-4 h-4" />}
                className="text-neutral-700 hover:text-neutral-900"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
