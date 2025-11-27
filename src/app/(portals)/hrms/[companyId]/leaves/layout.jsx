'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText } from 'lucide-react';
import Tabs from '@/components/common/Tabs';

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
      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {/* Tab content */}
      {children}
    </div>
  );
}
