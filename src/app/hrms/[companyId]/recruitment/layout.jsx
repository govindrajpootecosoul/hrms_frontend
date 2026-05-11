'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';

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
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-900">Recruitment</h1>
            <p className="text-sm text-slate-600 mt-1">Manage hiring pipeline and candidate lifecycle</p>
          </div>

          {/* Tabs */}
          <div className="inline-flex items-center gap-1 rounded-2xl bg-slate-100 p-1 border border-slate-200/70">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-xl ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
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
      <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}


