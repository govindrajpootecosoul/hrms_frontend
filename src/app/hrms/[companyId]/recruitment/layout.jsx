'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Users, Briefcase, Sparkles } from 'lucide-react';

export default function RecruitmentLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const companyId = params.companyId;

  const tabs = [
    {
      id: 'sourcing-screening',
      label: 'Sourcing & Screening',
    },
    {
      id: 'recruitment-hiring',
      label: 'Recruitment & Hiring',
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
    },
  ];

  const getActiveTab = () => {
    if (pathname.includes('/recruitment-hiring')) return 'recruitment-hiring';
    if (pathname.includes('/onboarding')) return 'onboarding';
    return 'sourcing-screening';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabId) => {
    const basePath = `/hrms/${companyId}/recruitment`;

    if (tabId === 'sourcing-screening') {
      router.push(basePath);
    } else {
      router.push(`${basePath}/${tabId}`);
    }
  };

  // Don't show tabs on analytics page
  const isAnalyticsPage = pathname?.includes('/analytics');

  return (
    <div className="space-y-6">
      {!isAnalyticsPage && (
        <>
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recruitment</h1>
            <p className="text-sm text-slate-600 mt-1">Manage hiring pipeline and candidate lifecycle</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              let activeBgColor = '';
              if (activeTab === tab.id) {
                if (tab.id === 'sourcing-screening') {
                  activeBgColor = 'bg-yellow-400 text-slate-900';
                } else if (tab.id === 'recruitment-hiring') {
                  activeBgColor = 'bg-blue-600 text-white';
                } else if (tab.id === 'onboarding') {
                  activeBgColor = 'bg-green-500 text-white';
                }
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                    activeTab === tab.id
                      ? `${activeBgColor} shadow-sm`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Content */}
      {children}
    </div>
  );
}


