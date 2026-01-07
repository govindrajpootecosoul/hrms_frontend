'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);

  // Load minimized state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarMinimized');
    if (savedState !== null) {
      setIsMinimized(JSON.parse(savedState));
    }
  }, []);

  // Save minimized state to localStorage
  const toggleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem('adminSidebarMinimized', JSON.stringify(newState));
  };

  const handleLogout = () => {
    logout();
    router.push('/select-portal');
  };

  const navItems = [
    { path: '/admin-portal/dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { path: '/admin-portal/users', label: 'Admin', icon: '👥', badge: null },
    { path: '/admin-portal/portals', label: 'Setting', icon: '⚙️', badge: null },
    { path: '/admin-portal/help', label: 'Help', icon: '❓', badge: null },
  ];

  return (
    <div className={`${isMinimized ? 'w-20' : 'w-48'} bg-gray-800 text-white min-h-screen flex flex-col transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={toggleMinimize}
        className="absolute -right-3 top-6 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-1.5 shadow-lg border-2 border-gray-600 transition-colors"
        title={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isMinimized ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <div className={`p-6 border-b border-gray-700 ${isMinimized ? 'px-3' : ''}`}>
        {!isMinimized && (
          <h1 className="text-xl font-bold">Dashboard</h1>
        )}
      </div>
      <nav className="flex-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center ${isMinimized ? 'justify-center px-3' : 'px-4'} py-3 transition-colors relative group ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={isMinimized ? item.label : ''}
            >
              <span className={`${isMinimized ? '' : 'mr-3'} text-xl flex-shrink-0`}>{item.icon}</span>
              {!isMinimized && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {/* Tooltip for minimized state */}
              {isMinimized && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className={`flex items-center ${isMinimized ? 'justify-center px-3' : 'px-4'} py-3 transition-colors w-full text-gray-300 hover:bg-gray-700 hover:text-white group`}
          title={isMinimized ? 'Log out' : ''}
        >
          <span className={`${isMinimized ? '' : 'mr-3'} text-xl flex-shrink-0`}>🚪</span>
          {!isMinimized && <span className="font-medium">Log out</span>}
          {/* Tooltip for minimized state */}
          {isMinimized && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Log out
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}














