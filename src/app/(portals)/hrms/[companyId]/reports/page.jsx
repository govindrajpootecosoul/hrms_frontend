'use client';

import { FileText, Download, FileCode2, CalendarClock } from 'lucide-react';
import StatisticsCards from '@/components/hrms/StatisticsCards';

const ReportsPage = () => {
  // Mock stats for the reports overview - replace with real data later
  const reportStats = [
    {
      key: 'total-reports',
      title: 'Total Reports Generated',
      value: 247,
      icon: <FileText className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
    },
    {
      key: 'reports-downloaded-today',
      title: 'Reports Downloaded Today',
      value: 18,
      icon: <Download className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
    },
    {
      key: 'active-report-types',
      title: 'Active Report Types',
      value: 11,
      icon: <FileCode2 className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #7c3aed, #a855f7)', // purple gradient
    },
    {
      key: 'scheduled-reports',
      title: 'Scheduled Reports',
      value: 5,
      icon: <CalendarClock className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // amber gradient
    }
  ];

  return (
    <div className="min-h-screen space-y-8">
      <StatisticsCards cards={reportStats} />
      {/* Additional reports content will go here */}
    </div>
  );
};

export default ReportsPage;


