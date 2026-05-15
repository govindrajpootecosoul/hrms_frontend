'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Bell, User, LogOut, Settings, Home, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const PAYROLL_COMPANY_FILTER_COOKIE = 'hrms_payroll_company';
const PAYROLL_COMPANY_FILTER_SESSION_KEY = 'hrms_payroll_company';
const PAYROLL_COMPANY_FILTER_OPTIONS = ['all', 'Genova Enterprises LLP', 'Beacon IQ'];

const Navbar = ({ onMenuToggle, isMenuOpen, menuItems = [] }) => {
  const { user, logout } = useAuth();
  const { currentCompany } = useCompany();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, left: 0 });
  const [payrollCompanyFilter, setPayrollCompanyFilter] = useState('all');
  const [isPayrollCompanyMenuOpen, setIsPayrollCompanyMenuOpen] = useState(false);
  const [payrollFilterMenuPosition, setPayrollFilterMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});
  const profileButtonRef = useRef(null);
  const payrollFilterButtonRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path, exactMatchOnly = false) => {
    if (!path || !pathname) return false;
    
    // Normalize paths (remove trailing slashes for comparison)
    const normalizedPath = path.replace(/\/$/, '');
    const normalizedPathname = pathname.replace(/\/$/, '');
    
    // Exact match
    if (normalizedPathname === normalizedPath) return true;
    
    // If exact match only is requested, return false here
    if (exactMatchOnly) return false;
    
    // For base paths that should only match exactly (not sub-paths)
    const basePaths = ['/employee-portal', '/hrms', '/finance', '/asset-tracker', '/query-tracker'];
    const isBasePath = basePaths.includes(normalizedPath);
    
    if (isBasePath) {
      // Base paths should only match exactly, not sub-paths
      return false;
    }
    
    // For other paths, check if pathname starts with path + '/'
    // This allows sub-paths to match their parent menu items
    if (normalizedPathname.startsWith(normalizedPath + '/')) {
      return true;
    }
    
    return false;
  };

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

  const readCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const cookieStr = String(document.cookie || '');
    const parts = cookieStr.split(';').map((p) => p.trim());
    const prefix = `${name}=`;
    for (const p of parts) {
      if (p.startsWith(prefix)) return decodeURIComponent(p.slice(prefix.length));
    }
    return null;
  };

  const writeCookie = (name, value, { maxAgeSeconds = 60 * 60 * 24 * 30 } = {}) => {
    if (typeof document === 'undefined') return;
    const encoded = encodeURIComponent(String(value));
    document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  };

  // Initialize payroll company filter (Thrive only, HRMS only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromSession = sessionStorage.getItem(PAYROLL_COMPANY_FILTER_SESSION_KEY);
    const fromCookie = readCookie(PAYROLL_COMPANY_FILTER_COOKIE);
    const resolved = (fromSession || fromCookie || 'all').trim();
    const safe = PAYROLL_COMPANY_FILTER_OPTIONS.includes(resolved) ? resolved : 'all';
    setPayrollCompanyFilter(safe);
    // Keep session aligned with cookie-backed value so dashboard fetches read the same filter on first paint.
    try {
      sessionStorage.setItem(PAYROLL_COMPANY_FILTER_SESSION_KEY, safe);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

  // Update profile menu position on scroll/resize
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    
    const updatePosition = () => {
      if (profileButtonRef.current) {
        const rect = profileButtonRef.current.getBoundingClientRect();
        setProfileMenuPosition({
          top: rect.bottom + 8,
          left: rect.right - 220 // Align dropdown to the right edge
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
  }, [isProfileMenuOpen]);

  // Payroll company filter menu position
  useEffect(() => {
    if (!isPayrollCompanyMenuOpen) return;

    const updatePosition = () => {
      if (payrollFilterButtonRef.current) {
        const rect = payrollFilterButtonRef.current.getBoundingClientRect();
        const menuWidth = 280;
        const left = Math.min(rect.left, window.innerWidth - menuWidth - 12);
        setPayrollFilterMenuPosition({
          top: rect.bottom + 8,
          left: Math.max(8, left),
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
  }, [isPayrollCompanyMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown && !isProfileMenuOpen && !isPayrollCompanyMenuOpen) return;
    
    const handleClickOutside = (event) => {
      const target = event.target;
      
      // Handle navigation dropdown
      if (openDropdown) {
        const clickedDropdown = target.closest(`[data-dropdown-id="${openDropdown}"]`);
        const clickedButton = target.closest(`[data-item-id="${openDropdown}"]`);
        
        if (!clickedDropdown && !clickedButton) {
          setOpenDropdown(null);
        }
      }
      
      // Handle profile menu
      if (isProfileMenuOpen) {
        const clickedProfileMenu = target.closest('[data-profile-menu]');
        const clickedProfileButton = target.closest('[data-profile-button]');
        
        if (!clickedProfileMenu && !clickedProfileButton) {
          setIsProfileMenuOpen(false);
        }
      }

      if (isPayrollCompanyMenuOpen) {
        const clickedPayrollMenu = target.closest('[data-payroll-company-menu]');
        const clickedPayrollTrigger = target.closest('[data-payroll-company-trigger]');
        if (!clickedPayrollMenu && !clickedPayrollTrigger) {
          setIsPayrollCompanyMenuOpen(false);
        }
      }
    };
    
    // Use a small delay to ensure dropdown is rendered before attaching listener
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [openDropdown, isProfileMenuOpen, isPayrollCompanyMenuOpen, menuItems, pathname]);

  // Get company name (only use state, don't read sessionStorage during render to avoid hydration mismatch)
  const getCompanyName = () => {
    return formatCompanyName(selectedCompany);
  };

  const shouldShowPayrollCompanyFilter =
    Boolean(pathname?.includes('/hrms')) && String(getCompanyName() || '').toLowerCase() === 'thrive';

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

  // Get portal-specific title
  const getPortalTitle = () => {
    if (pathname?.includes('/asset-tracker')) {
      const formattedName = getCompanyName();
      if (formattedName) {
        return `${formattedName} Assets Console`;
      }
      return 'Assets Management Console';
    } else if (pathname?.includes('/hrms')) {
      return 'HRMS Admin Portal';
    } else if (pathname?.includes('/finance')) {
      return 'Finance Console';
    } else if (pathname?.includes('/query-tracker')) {
      return 'Query Tracker Console';
    } else if (pathname?.includes('/employee-portal')) {
      return 'Employee Portal';
    }
    return 'HRMS Admin Portal'; // Default
  };

  // Get portal-specific description
  const getPortalDescription = () => {
    if (pathname?.includes('/asset-tracker')) {
      return 'Track and manage your company assets efficiently from a centralized platform.';
    } else if (pathname?.includes('/hrms')) {
      return 'Monitor employee attendance, recruitment, and finances from a single workspace.';
    } else if (pathname?.includes('/finance')) {
      return 'Manage your financial operations, invoices, and reconciliations seamlessly.';
    } else if (pathname?.includes('/query-tracker')) {
      return 'Track and resolve queries efficiently from a unified dashboard.';
    } else if (pathname?.includes('/employee-portal')) {
      return 'Access your personal information, attendance, and leave requests.';
    }
    return 'Monitor employee attendance, recruitment, and finances from a single workspace.'; // Default
  };


  return (
    <nav className="relative bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 sticky top-0 z-40 shadow-lg overflow-hidden border-b">
      {/* Decorative blur circles */}
      <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
      
      <div className="relative max-w-[1600px] mx-auto flex flex-col px-6 text-white">
        {/* Top header row */}
        <div className="flex items-start justify-between py-2">
          {/* Left side - brand and title */}
          <div className="flex-1">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-sky-300 font-semibold">
              VECTORLYTICS HRMS
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-bold text-white leading-tight">{getPortalTitle()}</h1>
            <p className="mt-1 text-sm text-slate-200 leading-relaxed">
              {getPortalDescription()}
            </p>
          </div>

          {/* Right side - user actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Thrive-only: Payroll company filter */}
            {shouldShowPayrollCompanyFilter && (
              <div className="relative flex items-center">
                <div
                  data-payroll-company-trigger
                  className="flex items-center gap-2 rounded-full bg-white/10 border border-white/10 pl-3 pr-1.5 h-10 backdrop-blur-sm"
                >
                  <span className="text-xs text-white/80 whitespace-nowrap">Payroll</span>
                  <button
                    ref={payrollFilterButtonRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (payrollFilterButtonRef.current) {
                        const rect = payrollFilterButtonRef.current.getBoundingClientRect();
                        const menuWidth = 280;
                        const left = Math.min(rect.left, window.innerWidth - menuWidth - 12);
                        setPayrollFilterMenuPosition({
                          top: rect.bottom + 8,
                          left: Math.max(8, left),
                        });
                      }
                      setIsPayrollCompanyMenuOpen((open) => !open);
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/15 px-2.5 py-1.5 text-white text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition-colors"
                    title="Filter by payroll company"
                    aria-expanded={isPayrollCompanyMenuOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="max-w-[200px] truncate">
                      {payrollCompanyFilter === 'all' ? 'All' : payrollCompanyFilter}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 opacity-90 transition-transform ${isPayrollCompanyMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                {isPayrollCompanyMenuOpen &&
                  typeof window !== 'undefined' &&
                  createPortal(
                    <div
                      data-payroll-company-menu
                      role="listbox"
                      className="bg-white rounded-xl shadow-xl border border-indigo-200/70 p-2 min-w-[260px] max-w-[min(320px,calc(100vw-24px))]"
                      style={{
                        zIndex: 10000,
                        position: 'fixed',
                        top: `${payrollFilterMenuPosition.top}px`,
                        left: `${payrollFilterMenuPosition.left}px`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Payroll company
                      </p>
                      <ul className="flex flex-col gap-1">
                        {PAYROLL_COMPANY_FILTER_OPTIONS.map((value) => {
                          const label = value === 'all' ? 'All' : value;
                          const selected = payrollCompanyFilter === value;
                          return (
                            <li key={value}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => {
                                  setPayrollCompanyFilter(value);
                                  setIsPayrollCompanyMenuOpen(false);
                                  if (typeof window !== 'undefined') {
                                    sessionStorage.setItem(PAYROLL_COMPANY_FILTER_SESSION_KEY, value);
                                    writeCookie(PAYROLL_COMPANY_FILTER_COOKIE, value);
                                    window.dispatchEvent(
                                      new CustomEvent('hrms:payrollCompanyChange', {
                                        detail: { payrollCompany: value },
                                      })
                                    );
                                  }
                                  router.refresh?.();
                                }}
                                className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                                  selected
                                    ? 'bg-indigo-50 text-indigo-900 font-medium'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                    selected
                                      ? 'border-indigo-600 bg-indigo-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                                </span>
                                <span className="min-w-0 flex-1 leading-snug">{label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>,
                    document.body
                  )}
              </div>
            )}

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

            {/* Profile Menu */}
            <div className="relative" data-profile-button>
              <button 
                ref={profileButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (profileButtonRef.current) {
                    const rect = profileButtonRef.current.getBoundingClientRect();
                    setProfileMenuPosition({
                      top: rect.bottom + 8,
                      left: rect.right - 220
                    });
                  }
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="h-10 px-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white backdrop-blur-sm transition-colors flex items-center justify-center gap-2"
                title="Profile Menu"
              >
                <User className="h-5 w-5 flex-shrink-0" />
                {user && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {user.name || 'Admin User'}
                  </span>
                )}
              </button>
              
              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && typeof window !== 'undefined' && createPortal(
                <div 
                  data-profile-menu
                  className="bg-white rounded-lg shadow-lg border border-blue-200 py-2 min-w-[200px]"
                  style={{ 
                    zIndex: 10000,
                    position: 'fixed',
                    top: `${profileMenuPosition.top}px`,
                    left: `${profileMenuPosition.left}px`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {/* User Info Section */}
                  {user && (
                    <>
                      <div className="px-4 py-3 border-b border-slate-200">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{user.name || 'Admin User'}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{user.email || 'admin@vectorlytics.com'}</span>
                          <span className="text-xs text-slate-500 mt-1">
                            Role: {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 text-slate-600 hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4 text-slate-400" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        {menuItems.length > 0 && (
          <div className="pb-2 border-t border-white/5 relative">
            <div className="overflow-x-auto">
              <nav className="flex items-center gap-0.5 pt-2 relative" style={{ minWidth: 'max-content' }}>
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
                        className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1 rounded-full ${
                          active
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-white/90 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {displayLabel}
                        {hasChildren && (
                          isDropdownOpen ? (
                            <ChevronUp className="h-3 w-3 text-white" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
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
                            const isChildActive = isActive(child.path, true); // Use exact match only for child items
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
