'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Package, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, menuItems = [] }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`
              w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
              ${active ? 'bg-primary-100 text-primary-700 shadow-sm' : 'text-neutral-700 hover:bg-neutral-100 hover:shadow-sm'}
            `}
          >
            <div className="flex items-center">
              {item.icon && <span className="mr-3 w-5 h-5">{item.icon}</span>}
              {item.label}
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map(child => (
                <Link
                  key={child.id}
                  href={child.path}
                  className={`
                    block px-3 py-2 text-sm rounded-lg transition-colors
                    ${isActive(child.path) 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-white/80 hover:bg-neutral-100'
                    }
                  `}
                  onClick={onClose}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.path}
        className={`
          flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
          ${active ? 'bg-primary-100 text-primary-700 shadow-sm' : 'text-white/80 hover:bg-white/40 hover:shadow-sm'}
        `}
        onClick={onClose}
      >
        {item.icon && <span className="mr-3 w-5 h-5">{item.icon}</span>}
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 h-screen z-50 w-64 bg-black/90 backdrop-blur-md border-r border-white/10 transform transition-transform duration-300 ease-in-out shadow-lg text-white
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:self-start
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Portal</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>
      </div>
    </>
  );
};

// Default menu items for HRMS
export const HRMS_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/hrms/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/hrms/employees',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/hrms/attendance',
    icon: <Clock className="w-5 h-5" />
  }
];

// Default menu items for Asset Tracker
export const ASSET_TRACKER_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/asset-tracker/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    id: 'assets',
    label: 'Assets',
    path: '/asset-tracker/assets',
    icon: <Package className="w-5 h-5" />
  }
];

export default Sidebar;
