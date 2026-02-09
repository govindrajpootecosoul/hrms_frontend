'use client';

import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar } from './AdminSidebar';
import { FloatingActionButton } from '../ui/FloatingActionButton';

export function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6 pb-24">{children}</main>
        <FloatingActionButton />
      </div>
    </div>
  );
}








































