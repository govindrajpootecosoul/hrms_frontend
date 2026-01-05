'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryTrackerAuth } from '../hooks/useQueryTrackerAuth';
import Icon from './Icon';
import { Home } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useQueryTrackerAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const menuItems = [
    { path: '/query-tracker/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/query-tracker/queries', label: 'Queries List', icon: 'list_alt' },
    { path: '/query-tracker/reports', label: 'Reports', icon: 'description' },
  ];

  const handleLogout = () => {
    logout(); // This will redirect to main login page
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Combined Header and Navigation Bar */}
      <header className="relative overflow-visible bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 shadow-md">
        <div className="relative z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-white">QUERY TRACKER</span>
            </div>

            {/* Center - Navigation Menu */}
            <nav className="flex items-center space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative text-white font-medium text-[15px] transition-all px-4 py-2 rounded-full ${
                    pathname === item.path
                      ? 'bg-white/20 text-white font-semibold shadow-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side - Notifications, User, Logout */}
            <div className="flex items-center space-x-3">
              {/* Back to Select Portal Button */}
              <button 
                onClick={() => router.push('/select-portal')}
                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all relative flex items-center justify-center backdrop-blur-sm"
                title="Back to Select Portal"
              >
                <Home className="w-5 h-5 text-white" />
              </button>
              
              {/* Notification Bell */}
              <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all relative flex items-center justify-center backdrop-blur-sm">
                <Icon name="notifications" size={20} className="text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile Button with Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center relative backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  {userMenuOpen && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                      <Icon name="expand_less" size={12} className="text-white" />
                    </span>
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl border border-white/50 shadow-2xl z-[100] overflow-hidden">
                    <div className="p-4 space-y-3">
                      {/* User Info Header */}
                      <div className="pb-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {/* User Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">User ID:</span>
                          <span className="px-3 py-1 rounded-full bg-white/80 text-gray-700 text-xs font-medium border border-gray-200">
                            {(user?._id || user?.id)?.slice(-6) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Role:</span>
                          <span className="px-3 py-1 rounded-full bg-white/80 text-gray-700 text-xs font-medium border border-gray-200">
                            {user?.role || 'User'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Status:</span>
                          <span className="px-3 py-1 rounded-full bg-white/80 text-emerald-600 text-xs font-medium border border-emerald-200">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center text-white backdrop-blur-sm"
              >
                <Icon name="logout" size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

