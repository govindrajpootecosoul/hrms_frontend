'use client';

import { Sparkles, Users, TrendingUp, Hourglass } from 'lucide-react';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import Table from '@/components/common/Table';

const RecruitmentOnboardingPage = () => {
  const onboardingStats = {
    totalCandidates: 16,
    shortlisted: 1,
    inInterview: 13,
    hired: 0,
    onHold: 1,
  };

  const statCards = [
    {
      key: 'total-candidates',
      title: 'Total Candidates',
      value: onboardingStats.totalCandidates,
      icon: <Users className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
    },
    {
      key: 'shortlisted',
      title: 'Shortlisted',
      value: onboardingStats.shortlisted,
      icon: <Sparkles className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #7c3aed, #a855f7)', // purple gradient
    },
    {
      key: 'in-interview',
      title: 'In Interview',
      value: onboardingStats.inInterview,
      icon: <TrendingUp className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // amber gradient
    },
    {
      key: 'hired',
      title: 'Hired',
      value: onboardingStats.hired,
      icon: <Users className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
    },
    {
      key: 'on-hold',
      title: 'On Hold',
      value: onboardingStats.onHold,
      icon: <Hourglass className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #b91c1c, #f97316)', // deep red to amber
    },
  ];

  const tableColumns = [
    { key: 'name', title: 'New Hire' },
    { key: 'role', title: 'Role' },
    { key: 'location', title: 'Location' },
    { key: 'startDate', title: 'Start Date' },
    { key: 'status', title: 'Onboarding Status' },
  ];

  const tableData = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Product Designer',
      location: 'Bangalore',
      startDate: '10 Dec 2025',
      status: 'Pre-boarding',
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Marketing Lead',
      location: 'Remote',
      startDate: '18 Dec 2025',
      status: 'Day 1 complete',
    },
    {
      id: 3,
      name: 'David Brown',
      role: 'Sales Manager',
      location: 'Mumbai',
      startDate: '05 Jan 2026',
      status: 'Planned',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Onboarding</h1>
        <p className="text-sm text-neutral-500">
          Design delightful first days for new hires with structured, trackable journeys.
        </p>
      </div>

      <StatisticsCards cards={statCards} compact />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Onboarding Cohort
            </h2>
            <p className="text-xs text-neutral-500">
              Track upcoming and in-progress onboarding journeys.
            </p>
          </div>
        </div>
        <Table
          columns={tableColumns}
          data={tableData}
          pagination={false}
          scrollable
          maxHeight="340px"
        />
      </div>
    </div>
  );
};

export default RecruitmentOnboardingPage;

