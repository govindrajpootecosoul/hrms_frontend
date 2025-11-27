'use client';

import { useState } from 'react';
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
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path) =>
    path && (pathname === path || pathname.startsWith(path + '/'));

  return (
    <nav className="bg-[#073346] backdrop-blur-md border-b border-[#A28752] sticky top-0 z-40 shadow-sm">
      <div className="flex flex-col px-4 sm:px-6 lg:px-8 text-white">
        {/* Top header row */}
        <div className="flex items-center justify-between py-4">
          {/* Left side - admin info */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-white hover:text-white hover:bg-[#745e39] lg:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Console-style brand block (admin info) */}
            <div className="ml-4">
              <div className="flex flex-col space-y-5">
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-white/70">
                   {currentCompany?.name || 'Company'} HRMS
                 </span>
                <h1 className="text-xl md:text-2xl font-semibold text-white leading-snug ">
                   Admin Console
                 </h1>
              </div>
            </div>
          </div>

          {/* Center - company logo */}
          <div className="flex-1 flex justify-center">
            <div className="w-auto h-auto bg-[#073346] rounded-2xl flex items-center justify-center px-4 py-2">
              {currentCompany?.logoUrl || currentCompany?.logo || currentCompany?.image ? (
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
              ) : (
                <span className="text-white font-bold text-sm">
                  {currentCompany?.name?.charAt(0) || 'C'}
                </span>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-white/5 border border-[#A28752] px-3 py-1.5 shadow-sm">
              {/* Notifications */}
              <Button className="p-1.5 text-white hover:text-white hover:bg-[#745e39] rounded-full transition-colors">
                <Bell className="w-[1.5rem] h-[1.5rem]" />
              </Button>

              {/* Back to Home button (rightmost) */}
              <Button onClick={() => router.push('/select-portal')} className="p-1.5 text-white hover:text-white hover:bg-[#745e39] rounded-full transition-colors">
                <Home className="w-[1.5rem] h-[1.5rem]" />
              </Button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-full text-white hover:text-white hover:bg-[#745e39] transition-colors"
                >
                  <div className="w-8 h-8 bg-white/10 border border-[#A28752] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white">
                    {user?.name || 'User'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#073346] backdrop-blur-md rounded-lg shadow-lg border border-[#A28752] py-1 z-50">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#745e39]">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#745e39]"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top navigation (optional) */}
        {menuItems.length > 0 && (
          <div className="pt-3 pb-4 border-t border-[#A28752]/40 mt-1">
            <nav className="flex items-center space-x-4 overflow-x-auto text-white">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    href={item.path || '#'}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-200 ${
                      active
                        ? 'bg-[#A28752] text-white shadow-sm'
                        : 'text-white hover:bg-[#745e39]'
                    }`}
                  >
                    {item.icon && <span className="w-5 h-5 mr-2">{item.icon}</span>}
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
