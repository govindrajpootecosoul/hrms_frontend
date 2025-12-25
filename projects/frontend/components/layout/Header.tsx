'use client';

import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

// Map paths to page titles
const pageTitles: Record<string, string> = {
  '/dashboard': '',
  '/employees': 'Employees',
  '/org-chart': 'Organisation Chart',
  '/attendance': 'Attendance & Leave Management',
  '/attendance/overview': 'Attendance Overview',
  '/attendance/leave': 'Leave Management',
  '/recruitment': 'Recruitment',
  '/recruitment/analytics': 'HR Analytics',
  '/recruitment/recruitment': 'Recruitment',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

// Function to get page title from pathname
const getPageTitle = (pathname: string): string => {
  // Check exact match first
  if (pathname in pageTitles) {
    return pageTitles[pathname];
  }
  
  // Check if pathname starts with any key
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + '/')) {
      return title;
    }
  }
  
  // Default fallback
  return 'HRMS Portal';
};

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname || '');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-6" style={{ backgroundColor: '#073349' }}>
      <div className="flex items-center gap-4">
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
              <User className="h-5 w-5" />
              <span>{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="text-white hover:bg-white/10"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

