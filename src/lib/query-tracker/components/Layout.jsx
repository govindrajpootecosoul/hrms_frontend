'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryTrackerAuth } from '../hooks/useQueryTrackerAuth';
import { useCompany } from '@/lib/context/CompanyContext';
import Navbar from '@/components/layout/Navbar';
import Icon from './Icon';
import { Home, LayoutDashboard, List, FileText, Settings as SettingsIcon } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useQueryTrackerAuth();
  const { currentCompany } = useCompany();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', path: '/query-tracker/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'queries', path: '/query-tracker/queries', label: 'Queries List', icon: <List className="w-4 h-4" /> },
    { id: 'reports', path: '/query-tracker/reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout(); // This will redirect to main login page
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Use the same Navbar component as Asset Tracker */}
      <Navbar 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
        menuItems={menuItems}
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

