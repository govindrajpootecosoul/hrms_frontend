'use client';

import {
  LayoutDashboard,
  Users,
  Network,
  Calendar,
  Briefcase,
  FileText,
  Settings,
  Clock,
  FileCheck,
  BarChart3,
  UserPlus,
  CreditCard,
  ClipboardList,
  ListChecks,
} from 'lucide-react';

export type AdminMenuItem = {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  subMenu?: Array<{ name: string; href: string; icon: any }>;
};

export const adminMenuItems: AdminMenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'manager'] },
  { name: 'Employees', href: '/employees', icon: Users, roles: ['admin', 'hr', 'manager'] },
  { name: 'Organisation Chart', href: '/org-chart', icon: Network, roles: ['admin', 'hr', 'manager'] },
  {
    name: 'Attendance & Leave',
    href: '/attendance',
    icon: Calendar,
    roles: ['admin', 'hr', 'manager', 'employee'],
    subMenu: [
      { name: 'Attendance Overview', href: '/attendance/overview', icon: Clock },
      { name: 'Leave Management', href: '/attendance/leave', icon: FileCheck },
    ],
  },
  {
    name: 'Recruitment',
    href: '/recruitment',
    icon: Briefcase,
    roles: ['admin', 'hr'],
    subMenu: [
      { name: 'HR Analytics', href: '/recruitment/analytics', icon: BarChart3 },
      { name: 'Recruitment', href: '/recruitment/recruitment', icon: UserPlus },
    ],
  },
  {
    name: 'Expense & Reimbursement',
    href: '/expenses',
    icon: CreditCard,
    roles: ['admin', 'hr', 'manager'],
    subMenu: [
      { name: 'Overview Dashboard', href: '/expenses/overview', icon: BarChart3 },
      { name: 'Expenses & Advances', href: '/expenses/expenses-advances', icon: ClipboardList },
      { name: 'Management', href: '/expenses/management', icon: ListChecks },
    ],
  },
  { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'hr', 'manager'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

