'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/select-portal');
  };

  const navItems = [
    { path: '/admin-portal/dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { path: '/admin-portal/schedule', label: 'Schedule', icon: '📅', badge: null },
    { path: '/admin-portal/visitors', label: 'Visitors', icon: '👤', badge: null },
    { path: '/admin-portal/message', label: 'Message', icon: '💬', badge: 3 },
    { path: '/admin-portal/payments', label: 'Payments', icon: '💳', badge: null },
    { path: '/admin-portal/users', label: 'Admin', icon: '👥', badge: null },
    { path: '/admin-portal/portals', label: 'Setting', icon: '⚙️', badge: null },
    { path: '/admin-portal/help', label: 'Help', icon: '❓', badge: null },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <nav className="flex-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-6 py-3 transition-colors relative ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 transition-colors w-full text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <span className="mr-3 text-xl">🚪</span>
          <span className="font-medium">Log out</span>
        </button>
      </nav>
    </div>
  );
}

