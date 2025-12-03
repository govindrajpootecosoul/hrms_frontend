'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { BarChart3, Receipt, Wallet, CheckSquare, FileCheck } from 'lucide-react';
import Tabs from '@/components/common/Tabs';

export default function ExpensesLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const companyId = params.companyId;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'advances',
      label: 'Advances',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'claims-policies',
      label: 'Claims and Policies',
      icon: <FileCheck className="w-4 h-4" />,
    },
  ];

  const getActiveTab = () => {
    if (pathname.includes('/expenses/expenses')) return 'expenses';
    if (pathname.includes('/expenses/advances')) return 'advances';
    if (pathname.includes('/expenses/approvals')) return 'approvals';
    if (pathname.includes('/expenses/claims-policies')) return 'claims-policies';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabId) => {
    const basePath = `/hrms/${companyId}/expenses`;

    if (tabId === 'overview') {
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

