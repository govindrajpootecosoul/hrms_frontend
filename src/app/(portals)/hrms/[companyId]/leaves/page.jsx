'use client';

import { Users, AlertCircle, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import BarGraph from '@/components/charts/BarGraph';
import ListView from '@/components/layout/ListView';

const LeavesOverviewPage = () => {
  // Mock data for statistics cards
  const leaveStats = {
    totalOnLeave: 0,
    leaveForApproval: 4,
    approvedThisMonth: 7,
    rejectedThisMonth: 4
  };

  const statCards = [
    {
      key: 'total-on-leave',
      title: 'Total on Leave',
      value: leaveStats.totalOnLeave,
      icon: <Users className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
      subtitle: 'Currently on leave'
    },
    {
      key: 'leave-for-approval',
      title: 'Leave for Approval',
      value: leaveStats.leaveForApproval,
      icon: <AlertCircle className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // amber gradient
      subtitle: 'Pending approval'
    },
    {
      key: 'approved-this-month',
      title: 'Approved This Month',
      value: leaveStats.approvedThisMonth,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
      subtitle: 'Approved requests'
    },
    {
      key: 'rejected-this-month',
      title: 'Rejected This Month',
      value: leaveStats.rejectedThisMonth,
      icon: <XCircle className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #b91c1c, #f97316)', // deep red to amber
      subtitle: 'Rejected requests'
    }
  ];

  // Mock data for yearly leave utilization
  const employeeNames = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Williams',
    'David Brown',
    'Emily Davis',
    'Robert Wilson',
    'Lisa Anderson',
    'Alex Kumar',
    'Priya Sharma',
    'Rajesh Patel',
    'Sneha Reddy',
    'Vikram Singh',
    'Anita Desai',
    'Rahul Mehta'
  ];

  // Mock data: utilized and remaining leave days for each employee
  const leaveUtilizationData = [
    { name: 'Utilized', data: [5, 12, 8, 3, 7, 15, 4, 2, 9, 6, 11, 13, 14, 5, 1] },
    { name: 'Remaining', data: [7, 0, 4, 9, 5, 0, 8, 10, 3, 6, 1, 0, 0, 7, 11] }
  ];

  // Leave Policy List items - rendered via ListView for a modern, stacked layout
  const leavePolicyItems = [
    {
      id: 'casual-leave',
      title: 'Casual Leave',
      description: 'Annual leave entitlement by category',
      date: '12 days/year',
      tag: { label: 'Policy', variant: 'info' }
    },
    {
      id: 'sick-leave',
      title: 'Sick Leave',
      description: 'Paid leave for medical reasons',
      date: '6 days/year',
      tag: { label: 'Policy', variant: 'success' }
    },
    {
      id: 'earned-leave',
      title: 'Earned Leave',
      description: 'Accrued based on tenure',
      date: '10 days/year',
      tag: { label: 'Policy', variant: 'warning' }
    },
    {
      id: 'compensatory-off',
      title: 'Compensatory Off',
      description: 'Time off in lieu of extra work',
      date: '0 days/year',
      tag: { label: 'Policy', variant: 'info' }
    },
    {
      id: 'work-from-home',
      title: 'Work From Home',
      description: 'Flexible remote work policy',
      date: 'Unlimited*',
      tag: { label: 'Flexible', variant: 'secondary' }
    },
    {
      id: 'loss-of-pay',
      title: 'Loss of Pay (LOP)',
      description: 'Unpaid leave as per policy',
      date: 'As per policy',
      tag: { label: 'Unpaid', variant: 'danger' }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top metrics row */}
      <StatisticsCards cards={statCards} />

      {/* Leave Policy List + Yearly Utilization Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Leave Policy List - Left */}
        <div className="lg:col-span-1 space-y-2">
          <ListView
            title="Leave Policy"
            subtitle="Annual leave entitlements by category"
            items={leavePolicyItems}
            scrollable={false}
            className="h-full"
          />
          <p className="text-xs text-neutral-500 mt-1">
            * WFH subject to manager approval and business requirements
          </p>
        </div>

        {/* Bar Chart - Right */}
        <div className="lg:col-span-2">
          <BarGraph
            title="Yearly Leave Utilization"
            subtitle="Leave utilization per employee for current year"
            data={leaveUtilizationData}
            categories={employeeNames}
            seriesName="Days"
            height={460}
            colors={['#ef4444', '#10b981']}
            showGrid={true}
            showLegend={true}
            stacked={true}
            horizontal={false}
            dataLabels={false}
            yAxisTitle="Days"
            xAxisTitle=""
          />
        </div>
      </div>
    </div>
  );
};

export default LeavesOverviewPage;

