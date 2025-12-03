'use client';

import { Users, Search, Target, CalendarCheck, Hourglass } from 'lucide-react';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import Table from '@/components/common/Table';

const RecruitmentSourcingScreeningPage = () => {
  const sourcingStats = {
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
      value: sourcingStats.totalCandidates,
      icon: <Users className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
    },
    {
      key: 'shortlisted',
      title: 'Shortlisted',
      value: sourcingStats.shortlisted,
      icon: <Target className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #7c3aed, #a855f7)', // purple gradient
    },
    {
      key: 'in-interview',
      title: 'In Interview',
      value: sourcingStats.inInterview,
      icon: <CalendarCheck className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // amber gradient
    },
    {
      key: 'hired',
      title: 'Hired',
      value: sourcingStats.hired,
      icon: <Search className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
    },
    {
      key: 'on-hold',
      title: 'On Hold',
      value: sourcingStats.onHold,
      icon: <Hourglass className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #b91c1c, #f97316)', // deep red to amber
    },
  ];

  const tableColumns = [
    { key: 'name', title: 'Candidate' },
    { key: 'role', title: 'Role' },
    { key: 'stage', title: 'Stage' },
    { key: 'source', title: 'Source' },
    { key: 'updated', title: 'Last Updated' },
  ];

  const tableData = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Product Designer',
      stage: 'Screening',
      source: 'LinkedIn',
      updated: '2h ago',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Frontend Engineer',
      stage: 'Shortlisted',
      source: 'Referral',
      updated: '5h ago',
    },
    {
      id: 3,
      name: 'Rahul Mehta',
      role: 'Talent Partner',
      stage: 'Sourced',
      source: 'Agency',
      updated: 'Yesterday',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Recruitment</h1>
        <p className="text-sm text-neutral-500">
          Manage hiring pipeline and candidate lifecycle across sourcing channels.
        </p>
      </div>

      <StatisticsCards cards={statCards} compact />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Candidate Pipeline
            </h2>
            <p className="text-xs text-neutral-500">
              A quick view of who is moving through sourcing & screening.
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

export default RecruitmentSourcingScreeningPage;


