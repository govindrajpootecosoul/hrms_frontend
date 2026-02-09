'use client';

import { Users, AlertCircle, CheckCircle2, XCircle, Calendar, Stethoscope, Star, FileText, Home, Ban } from 'lucide-react';
import BarGraph from '@/components/charts/BarGraph';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const AttendanceLeaveOverviewPage = () => {
  // Mock data for statistics cards
  const leaveStats = {
    totalOnLeave: 0,
    leaveForApproval: 18,
    approvedThisMonth: 4,
    rejectedThisMonth: 3
  };

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

  // Leave Policy items
  const leavePolicyItems = [
    {
      id: 'casual-leave',
      title: 'Casual Leave',
      description: 'Annual leave entitlement by category',
      days: '12 days/year',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'sick-leave',
      title: 'Sick Leave',
      description: 'Paid leave for medical reasons',
      days: '6 days/year',
      icon: Stethoscope,
      color: 'text-green-600'
    },
    {
      id: 'earned-leave',
      title: 'Earned Leave',
      description: 'Accrued based on tenure',
      days: '10 days/year',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: 'compensatory-off',
      title: 'Compensatory Off',
      description: 'Time off in lieu of extra work',
      days: '0 days/year',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 'work-from-home',
      title: 'Work From Home',
      description: 'Flexible remote work policy',
      days: 'Unlimited*',
      icon: Home,
      color: 'text-indigo-600'
    },
    {
      id: 'loss-of-pay',
      title: 'Loss of Pay (LOP)',
      description: 'Unpaid leave as per policy',
      days: 'As per policy',
      icon: Ban,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total On Leave',
            value: leaveStats.totalOnLeave,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
          },
          {
            title: 'Leave For Approval',
            value: leaveStats.leaveForApproval,
            icon: AlertCircle,
            gradient: 'from-orange-600 via-amber-600 to-orange-700',
          },
          {
            title: 'Approved This Month',
            value: leaveStats.approvedThisMonth,
            icon: CheckCircle2,
            gradient: 'from-green-600 via-emerald-600 to-green-700',
          },
          {
            title: 'Rejected This Month',
            value: leaveStats.rejectedThisMonth,
            icon: XCircle,
            gradient: 'from-red-600 via-rose-600 to-red-700',
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${kpi.gradient} shadow-lg`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 text-white">{kpi.value}</div>
                <div className="text-xs text-white/90 uppercase tracking-wide">{kpi.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave Policy List + Yearly Utilization Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Leave Policy List - Left */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Leave Policy</h2>
                <p className="text-sm text-slate-600 mt-1">Annual leave entitlements by category</p>
              </div>
              <Button
                size="sm"
                className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                icon={<FileText className="w-4 h-4" />}
              >
                Edit Policy
              </Button>
            </div>
            <div className="space-y-3">
              {leavePolicyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-neutral-100 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    </div>
                    <div className="text-sm font-medium text-slate-900">{item.days}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * WFH subject to manager approval and business requirements
            </p>
          </Card>
        </div>

        {/* Bar Chart - Right */}
        <div className="lg:col-span-2">
          <Card className="border-2 p-6">
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLeaveOverviewPage;


