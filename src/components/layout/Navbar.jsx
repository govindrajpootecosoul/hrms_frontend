'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Bell, User, LogOut, Settings, Home, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});
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

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!openDropdown) return;
    
    const updatePosition = () => {
      const button = buttonRefs.current[openDropdown];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left
        });
      }
    };
    
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return;
    
    const handleClickOutside = (event) => {
      const target = event.target;
      const clickedDropdown = target.closest(`[data-dropdown-id="${openDropdown}"]`);
      const clickedButton = target.closest(`[data-item-id="${openDropdown}"]`);
      
      // Don't close if clicking inside the dropdown menu or its trigger button
      if (clickedDropdown || clickedButton) {
        return;
      }
      
      // Close dropdown if clicking outside
      setOpenDropdown(null);
    };
    
    // Use a small delay to ensure dropdown is rendered before attaching listener
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [openDropdown, menuItems, pathname]);

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
    <nav className="relative bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 sticky top-0 z-40 shadow-lg overflow-hidden border-b">
      {/* Decorative blur circles */}
      <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
      
      <div className="relative max-w-[1600px] mx-auto flex flex-col px-6 text-white">
        {/* Top header row */}
        <div className="flex items-start justify-between py-6">
          {/* Left side - brand and title */}
          <div className="flex-1">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-sky-300 font-semibold">
              VECTORLYTICS HRMS
            </p>
            <h1 className="mt-2 text-4xl lg:text-5xl font-bold text-white leading-tight">Admin Console</h1>
            <p className="mt-3 text-sm text-slate-200 leading-relaxed">
              Monitor employee attendance, recruitment, and finances from a single workspace.
            </p>
            {user && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="rounded-full bg-slate-800/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                  Role: {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'}
                </span>
                <span className="rounded-full bg-slate-800/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                  {user.email || 'admin@vectorlytics.com'}
                </span>
              </div>
            )}
          </div>

          {/* Right side - user actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Home button - Back to Select Portal */}
            <button 
              onClick={() => router.push('/select-portal')}
              className="h-10 w-10 rounded-full text-white hover:bg-white/10 transition-colors flex items-center justify-center"
              title="Back to Select Portal"
            >
              <Home className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="h-10 w-10 rounded-full text-white hover:bg-white/10 transition-colors flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </button>

            {/* Admin User button */}
            <button className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-full px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors">
              <User className="h-4 w-4" />
              <span>Admin User</span>
            </button>

            {/* Logout button */}
            <button 
              onClick={logout}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-full px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation bar */}
        {menuItems.length > 0 && (
          <div className="pb-3 border-t border-white/5 relative">
            <div className="overflow-x-auto">
              <nav className="flex items-center gap-0.5 pt-3 relative" style={{ minWidth: 'max-content' }}>
                {menuItems.map((item) => {
                  // Check if current path matches this item or any of its children
                  const itemActive = isActive(item.path);
                  const childActive = item.children?.some(child => isActive(child.path));
                  const active = itemActive || childActive;
                  const hasChildren = item.children && item.children.length > 0;
                  const isDashboard = item.path?.includes('/dashboard');
                  const isDropdownOpen = openDropdown === item.id;
                  const activeChild = hasChildren ? item.children?.find((child) => isActive(child.path)) : null;
                  const displayLabel = activeChild?.label || item.label;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="relative" 
                      data-item-id={item.id}
                    >
                      <button
                        ref={(el) => {
                          if (el) buttonRefs.current[item.id] = el;
                        }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasChildren) {
                            e.preventDefault();
                            // Calculate position for dropdown
                            const button = buttonRefs.current[item.id];
                            if (button) {
                              const rect = button.getBoundingClientRect();
                              setDropdownPosition({
                                top: rect.bottom + 8,
                                left: rect.left
                              });
                            }
                            // Toggle dropdown
                            const newState = isDropdownOpen ? null : item.id;
                            setOpenDropdown(newState);
                          } else {
                            // Navigate to the path
                            router.push(item.path || '#');
                          }
                        }}
                        onMouseDown={(e) => {
                          if (hasChildren) {
                            e.stopPropagation();
                          }
                        }}
                        className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1 rounded-full ${
                          active
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-white/90 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {displayLabel}
                        {hasChildren && (
                          isDropdownOpen ? (
                            <ChevronUp className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        )}
                      </button>
                      
                      {/* Dropdown menu - Card style - Render as portal */}
                      {hasChildren && isDropdownOpen && item.children && item.children.length > 0 && typeof window !== 'undefined' && createPortal(
                        <div 
                          data-dropdown-id={item.id}
                          className="bg-white rounded-lg shadow-lg border border-blue-200 py-2 min-w-[220px]"
                          style={{ 
                            zIndex: 10000,
                            position: 'fixed',
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {item.children.map((child) => {
                            const isChildActive = isActive(child.path);
                            return (
                              <button
                                key={child.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setOpenDropdown(null);
                                  // Navigate to the child path
                                  router.push(child.path || '#');
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                                  isChildActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {child.icon && (
                                  <span className={`w-4 h-4 flex-shrink-0 ${
                                    isChildActive ? 'text-blue-600' : 'text-slate-400'
                                  }`}>
                                    {child.icon}
                                  </span>
                                )}
                                <span className="flex-1">{child.label}</span>
                                {isChildActive && (
                                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>,
                        document.body
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
