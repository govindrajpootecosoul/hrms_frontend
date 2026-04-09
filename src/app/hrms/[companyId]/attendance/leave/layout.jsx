'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, FileText } from 'lucide-react';

export default function AttendanceLeaveLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [companyId, setCompanyId] = useState(params?.companyId);

  // Get companyId from params or sessionStorage if undefined
  useEffect(() => {
    let validCompanyId = params?.companyId;
    
    // If companyId is undefined, try to get it from sessionStorage
    if (!validCompanyId || validCompanyId === 'undefined') {
      if (typeof window !== 'undefined') {
        const storedCompanyId = sessionStorage.getItem('selectedCompany') || 
                               sessionStorage.getItem('selected_company_id') ||
                               localStorage.getItem('selected_company_id');
        if (storedCompanyId) {
          validCompanyId = storedCompanyId;
        }
      }
    }

    // If still no valid companyId, redirect to dashboard
    if (!validCompanyId || validCompanyId === 'undefined') {
      router.replace('/hrms/dashboard');
      return;
    }

    setCompanyId(validCompanyId);

    // Redirect to overview if on base leave path or undefined path
    // Only redirect if NOT already on overview or manage page
    const isOnBasePath = pathname === `/hrms/${validCompanyId}/attendance/leave` || 
                         pathname === `/hrms/undefined/attendance/leave` ||
                         (pathname && pathname.endsWith('/attendance/leave') && !pathname.includes('/overview') && !pathname.includes('/manage'));
    
    if (isOnBasePath && validCompanyId && validCompanyId !== 'undefined') {
      router.replace(`/hrms/${validCompanyId}/attendance/leave/overview`);
    }
  }, [pathname, params?.companyId, router]);

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
  const getActiveTab = () => {
    if (pathname && pathname.includes('/attendance/leave/manage')) return 'manage';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabId) => {
    if (!companyId || companyId === 'undefined') {
      console.error('CompanyId is not available');
      return;
    }
    const basePath = `/hrms/${companyId}/attendance/leave`;
    if (tabId === 'overview') {
      router.push(`${basePath}/overview`);
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

