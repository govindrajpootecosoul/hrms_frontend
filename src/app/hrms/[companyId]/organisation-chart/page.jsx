'use client';

import { Building2, Users, Briefcase, UserSquare2 } from 'lucide-react';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import OrganizationChart from '@/components/hrms/OrganizationChart';

const OrganizationChartPage = () => {
  // Mock stats - replace with real data when available
  const orgStats = [
    {
      key: 'total-departments',
      title: 'Total Departments',
      value: 6,
      icon: <Building2 className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
    },
    {
      key: 'total-employees',
      title: 'Total Employees',
      value: 142,
      icon: <Users className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
    },
    {
      key: 'cxo-leadership',
      title: 'CXO Leadership',
      value: 5,
      icon: <Briefcase className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #7c3aed, #a855f7)', // purple gradient
    },
    {
      key: 'directors',
      title: 'Directors',
      value: 12,
      icon: <UserSquare2 className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // amber gradient
    }
  ];

  return (
    <div className="min-h-screen space-y-8">
      <StatisticsCards cards={orgStats} />
      <div className="flex justify-center items-center">
      <h1 className="text-2xl font-bold text-center">Organization Chart</h1>
      </div>
      <OrganizationChart />
    </div>
  );
};

export default OrganizationChartPage;


