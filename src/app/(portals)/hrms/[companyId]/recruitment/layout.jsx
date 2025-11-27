'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Users, Briefcase, Sparkles } from 'lucide-react';
import Tabs from '@/components/common/Tabs';

export default function RecruitmentLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const companyId = params.companyId;

  const tabs = [
    {
      id: 'sourcing-screening',
      label: 'Sourcing & Screening',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'recruitment-hiring',
      label: 'Recruitment & Hiring',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: <Sparkles className="w-4 h-4" />,
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

  return (
    <div className="min-h-screen space-y-8">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      {children}
    </div>
  );
}


