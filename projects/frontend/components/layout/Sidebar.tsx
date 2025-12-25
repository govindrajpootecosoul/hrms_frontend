'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { adminMenuItems } from './admin-menu';

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const filteredMenuItems = adminMenuItems.filter(item => item.roles.includes(userRole));
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // Auto-expand menus if on their pages
    if (pathname?.startsWith('/attendance')) {
      return ['/attendance'];
    }
    if (pathname?.startsWith('/recruitment')) {
      return ['/recruitment'];
    }
    if (pathname?.startsWith('/expenses')) {
      return ['/expenses'];
    }
    return [];
  });

  const toggleMenu = (href: string) => {
    setExpandedMenus(prev =>
      prev.includes(href) ? prev.filter(item => item !== href) : [...prev, href]
    );
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6" style={{ backgroundColor: '#073349' }}>
        <h2 className="text-xl font-bold text-white">HRMS Portal</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const hasSubMenu = item.subMenu && item.subMenu.length > 0;
          const isExpanded = expandedMenus.includes(item.href);
          const isActive = pathname === item.href || (hasSubMenu && pathname?.startsWith(item.href + '/'));
          
          return (
            <div key={item.href}>
              {hasSubMenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon className="h-5 w-5" />
                      <span className="break-normal leading-tight">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && item.subMenu && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subMenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                              isSubActive
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <SubIcon className="h-4 w-4" />
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

