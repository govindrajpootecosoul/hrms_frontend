'use client';

import { Briefcase, CheckCircle2, CalendarClock, Users, Hourglass } from 'lucide-react';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import Table from '@/components/common/Table';

const RecruitmentHiringPage = () => {
  const hiringStats = {
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
      value: hiringStats.totalCandidates,
      icon: <Users className="w-6 h-6" />,
      color: 'primary',
    },
    {
      key: 'shortlisted',
      title: 'Shortlisted',
      value: hiringStats.shortlisted,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'secondary',
    },
    {
      key: 'in-interview',
      title: 'In Interview',
      value: hiringStats.inInterview,
      icon: <CalendarClock className="w-6 h-6" />,
      color: 'warning',
    },
    {
      key: 'hired',
      title: 'Hired',
      value: hiringStats.hired,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'success',
    },
    {
      key: 'on-hold',
      title: 'On Hold',
      value: hiringStats.onHold,
      icon: <Hourglass className="w-6 h-6" />,
      color: 'danger',
    },
  ];

  const tableColumns = [
    { key: 'name', title: 'Candidate' },
    { key: 'role', title: 'Role' },
    { key: 'stage', title: 'Stage' },
    { key: 'panel', title: 'Panel' },
    { key: 'schedule', title: 'Schedule' },
  ];

  const tableData = [
    {
      id: 1,
      name: 'Sneha Reddy',
      role: 'Senior Product Manager',
      stage: 'Panel Interview',
      panel: 'PM + Design',
      schedule: 'Tomorrow • 3:00 PM',
    },
    {
      id: 2,
      name: 'Vikram Singh',
      role: 'Backend Engineer',
      stage: 'Technical Interview',
      panel: 'Engineering',
      schedule: 'Fri • 11:30 AM',
    },
    {
      id: 3,
      name: 'Anita Desai',
      role: 'People Partner',
      stage: 'HR Discussion',
      panel: 'HR',
      schedule: 'Mon • 4:15 PM',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Recruitment & Hiring</h1>
        <p className="text-sm text-neutral-500">
          Orchestrate interviews, evaluations, and hiring decisions with a clean, guided flow.
        </p>
      </div>

      <StatisticsCards cards={statCards} compact />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Interview Schedule
            </h2>
            <p className="text-xs text-neutral-500">
              Upcoming interviews across all open roles.
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

export default RecruitmentHiringPage;

