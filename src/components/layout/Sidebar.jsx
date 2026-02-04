'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Package, 
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  FileText,
  Network,
  Receipt,
  BarChart3,
  Wallet,
  CheckSquare,
  FileCheck,
  Briefcase,
  CreditCard,
  ClipboardList,
  ListChecks,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, menuItems = [] }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Close any expanded items when collapsing
    if (!isCollapsed) {
      setExpandedItems({});
    }
  };

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
            onClick={() => !isCollapsed && toggleExpanded(item.id)}
            className={`
              w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
              ${active ? 'bg-primary-100 text-primary-700 shadow-sm' : 'text-neutral-700 hover:bg-neutral-100 hover:shadow-sm'}
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            title={isCollapsed ? item.label : ''}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              {item.icon && <span className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>}
              {!isCollapsed && (
                <span className="transition-opacity duration-300">{item.label}</span>
              )}
            </div>
            {!isCollapsed && (
              <span className="transition-opacity duration-300">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            )}
          </button>
          
          {isExpanded && !isCollapsed && (
            <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {item.children.map(child => (
                <Link
                  key={child.id}
                  href={child.path}
                  className={`
                    block px-3 py-2 text-sm rounded-lg transition-colors
                    ${isActive(child.path) 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-700 hover:bg-neutral-100'
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
          ${active ? 'bg-primary-100 text-primary-700 shadow-sm' : 'text-neutral-700 hover:bg-neutral-100 hover:shadow-sm'}
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
        onClick={onClose}
        title={isCollapsed ? item.label : ''}
      >
        {item.icon && <span className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>}
        {!isCollapsed && (
          <span className="transition-opacity duration-300">{item.label}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 h-screen z-50 bg-white border-r border-neutral-200 transform transition-all duration-300 ease-in-out shadow-lg text-neutral-900
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-64'}
        lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:self-start
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-neutral-200">
            {!isCollapsed && (
              <h2 className="text-xl font-bold transition-opacity duration-300">Portal</h2>
            )}
            <button
              onClick={toggleCollapse}
              className={`
                p-2 rounded-lg transition-all duration-300 hover:bg-neutral-100 active:scale-95
                ${isCollapsed ? 'mx-auto' : ''}
              `}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-neutral-700 transition-transform duration-300" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-neutral-700 transition-transform duration-300" />
              )}
            </button>
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

// Default menu items for HRMS (admin portal)
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
    id: 'organisation-chart',
    label: 'Organisation Chart',
    path: '/hrms/organisation-chart',
    icon: <Network className="w-5 h-5" />
  },
  {
    id: 'attendance',
    label: 'Attendance & Leave',
    path: '/hrms/attendance',
    icon: <Clock className="w-5 h-5" />,
    children: [
      {
        id: 'attendance-overview',
        label: 'Attendance Overview',
        path: '/hrms/attendance/overview',
        icon: <Clock className="w-4 h-4" />
      },
      {
        id: 'attendance-leave',
        label: 'Leave Management',
        path: '/hrms/attendance/leave',
        icon: <FileCheck className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    path: '/hrms/recruitment',
    icon: <Briefcase className="w-5 h-5" />,
    children: [
      {
        id: 'recruitment-analytics',
        label: 'HR Analytics',
        path: '/hrms/recruitment/analytics',
        icon: <BarChart3 className="w-4 h-4" />
      },
      {
        id: 'recruitment-recruitment',
        label: 'Recruitment',
        path: '/hrms/recruitment/recruitment',
        icon: <Users className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'expenses',
    label: 'Expense & Reimbursement',
    path: '/hrms/expenses',
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      {
        id: 'expenses-overview',
        label: 'Overview Dashboard',
        path: '/hrms/expenses/overview',
        icon: <BarChart3 className="w-4 h-4" />
      },
      {
        id: 'expenses-expenses-advances',
        label: 'Expenses & Advances',
        path: '/hrms/expenses/expenses-advances',
        icon: <ClipboardList className="w-4 h-4" />
      },
      {
        id: 'expenses-management',
        label: 'Management',
        path: '/hrms/expenses/management',
        icon: <ListChecks className="w-4 h-4" />
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/hrms/reports',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/hrms/settings',
    icon: <Settings className="w-5 h-5" />
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

// Default menu items for Employee Self-Service Portal
export const EMPLOYEE_PORTAL_MENU_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    path: '/employee-portal',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/employee-portal/attendance',
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 'requests',
    label: 'Requests',
    path: '/employee-portal/requests',
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 'my-organisation',
    label: 'My Organisation',
    path: '/employee-portal/my-organisation',
    icon: <Network className="w-5 h-5" />
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/employee-portal/reports',
    icon: <FileText className="w-5 h-5" />
  }
];

export default Sidebar;
