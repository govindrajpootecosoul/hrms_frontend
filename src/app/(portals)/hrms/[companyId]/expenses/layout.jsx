'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { BarChart3, Receipt, Wallet, CheckSquare, FileCheck } from 'lucide-react';

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
      id: 'expenses-advances',
      label: 'Expenses & Advances',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'management',
      label: 'Approval Management',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'claims-policies',
      label: 'Claims and Policies',
      icon: <FileCheck className="w-4 h-4" />,
    },
  ];

  const getActiveTab = () => {
    if (pathname.includes('/expenses/expenses-advances')) return 'expenses-advances';
    if (pathname.includes('/expenses/management')) return 'management';
    if (pathname.includes('/expenses/expenses')) return 'expenses';
    if (pathname.includes('/expenses/advances')) return 'advances';
    if (pathname.includes('/expenses/approvals')) return 'approvals';
    if (pathname.includes('/expenses/claims-policies')) return 'claims-policies';
    if (pathname.includes('/expenses/overview')) return 'overview';
    if (pathname === `/hrms/${companyId}/expenses` || pathname.endsWith('/expenses')) return 'overview';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabId) => {
    const basePath = `/hrms/${companyId}/expenses`;

    if (tabId === 'overview') {
      router.push(`${basePath}/overview`);
    } else if (tabId === 'expenses-advances') {
      router.push(`${basePath}/expenses-advances`);
    } else if (tabId === 'management') {
      router.push(`${basePath}/management`);
    } else {
      router.push(`${basePath}/${tabId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Content - No tabs shown */}
      {children}
    </div>
  );
}

