'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText } from 'lucide-react';

export default function LeavesLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const companyId = params.companyId;

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    { 
      id: 'manage', 
      label: 'Leave Manage', 
      icon: <FileText className="w-4 h-4" />
    }
  ];

  // Determine active tab based on pathname
  const activeTab = pathname.includes('/manage') ? 'manage' : 'overview';

  const handleTabChange = (tabId) => {
    const basePath = `/hrms/${companyId}/leaves`;
    if (tabId === 'overview') {
      router.push(basePath);
    } else {
      router.push(`${basePath}/${tabId}`);
    }
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Leave Management
        </h1>
        <p className="text-lg text-slate-600">
          Manage employee leave requests and approvals
        </p>
      </div>

      {/* Tabs (pill-style, Reports-like) */}
      <div className="rounded-xl border-2 border-neutral-200 bg-white p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {tab.icon ? <span className={isActive ? 'text-white' : 'text-neutral-500'}>{tab.icon}</span> : null}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
