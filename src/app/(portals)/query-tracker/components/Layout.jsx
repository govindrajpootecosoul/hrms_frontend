'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import Icon from './Icon';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  };

  const menuItems = [
    { path: '/query-tracker/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/query-tracker/queries', label: 'Queries List', icon: 'list_alt' },
    { path: '/query-tracker/reports', label: 'Reports', icon: 'description' },
    ...(isAdmin() ? [{ path: '/query-tracker/settings', label: 'Settings', icon: 'settings' }] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } glass-strong transition-all duration-300 fixed h-screen z-10 border-r border-white/50`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-blue via-accent-purple to-primary-blue-light bg-clip-text text-transparent">
                Query Tracker
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-white/50"
            >
              <Icon name={sidebarOpen ? 'chevron_left' : 'chevron_right'} size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  pathname === item.path
                    ? 'bg-gradient-to-r from-primary-blue/10 to-primary-blue-light/10 text-primary-blue border border-primary-blue/20 shadow-sm'
                    : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                }`}
              >
                <Icon name={item.icon} size={22} className="text-current" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6">
          <div className="glass p-4 rounded-xl mb-4 border border-white/50">
            {sidebarOpen && (
              <div className="text-gray-800">
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-gradient-to-r from-primary-blue/20 to-primary-blue-light/20 text-primary-blue border border-primary-blue/30">
                  {user?.role}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full glass p-3 rounded-xl text-gray-700 hover:bg-white/70 hover:text-gray-900 transition-all text-center font-medium text-sm flex items-center justify-center space-x-2"
          >
            <Icon name="logout" size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

