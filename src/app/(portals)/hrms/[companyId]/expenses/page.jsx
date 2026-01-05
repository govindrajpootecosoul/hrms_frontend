'use client';

import { useParams } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import BarGraph from '@/components/charts/BarGraph';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';

const ExpensesPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  

  // Mock statistics
  const expenseStats = {
    totalClaimsSubmitted: 128,
    pendingApprovals: 18,
    approvedClaimsMTD: 92,
    rejectedClaims: 6,
    totalOutstandingAdvances: 18500,
    totalSettledAmount: 74200,
    avgReimbursementTime: 4.2
  };

  const statCards = [
    {
      key: 'total-claims-submitted',
      title: 'TOTAL CLAIMS SUBMITTED',
      value: expenseStats.totalClaimsSubmitted,
      icon: <Receipt className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // blue gradient
    },
    {
      key: 'pending-approvals',
      title: 'PENDING APPROVALS',
      value: expenseStats.pendingApprovals,
      icon: <Receipt className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #f97316)', // orange gradient
    },
    {
      key: 'approved-claims-mtd',
      title: 'APPROVED CLAIMS (MTD)',
      value: expenseStats.approvedClaimsMTD,
      icon: <Receipt className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
    },
    {
      key: 'rejected-claims',
      title: 'REJECTED CLAIMS',
      value: expenseStats.rejectedClaims,
      icon: <Receipt className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #ec4899, #f472b6)', // pink/magenta gradient
    },
    {
      key: 'total-outstanding-advances',
      title: 'TOTAL OUTSTANDING ADVANCES',
      value: `₹${expenseStats.totalOutstandingAdvances.toLocaleString()}`,
      icon: <Receipt className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #6366f1, #8b5cf6)', // blue-purple gradient
    },
    {
      key: 'total-settled-amount',
      title: 'TOTAL SETTLED AMOUNT',
      value: `₹${expenseStats.totalSettledAmount.toLocaleString()}`,
      icon: <Receipt className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #7c3aed, #a855f7)', // purple gradient
    },
    {
      key: 'avg-reimbursement-time',
      title: 'AVG REIMBURSEMENT TIME (DAYS)',
      value: expenseStats.avgReimbursementTime,
      icon: <Receipt className="w-6 h-6" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #4b5563, #6b7280)', // dark grey gradient
    }
  ];

  // Chart data
  // 1. Expense Category Breakdown (Pie Chart)
  const expenseCategoryData = [42000, 15800, 28600, 11200, 5400];
  const expenseCategoryLabels = ['Travel', 'Meals', 'Office Supplies', 'Communication', 'Other'];
  const expenseCategoryColors = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];

  // 2. Monthly Claims vs Settlements (Line Chart)
  const monthlyClaimsData = [
    { name: 'Raised', data: [42, 45, 52, 55, 58, 62] },
    { name: 'Settled', data: [35, 40, 50, 58, 55, 50] }
  ];
  const monthlyClaimsCategories = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const monthlyClaimsColors = ['#3b82f6', '#10b981'];

  // 3. Department-wise Consumption (Bar Chart)
  const departmentConsumptionData = [38000, 23000, 19500, 8000, 20000];
  const departmentConsumptionCategories = ['Sales', 'Engineering', 'Marketing', 'HR', 'Operations'];
  const departmentConsumptionColors = ['#f97316'];

  // 4. Advance vs Actual Expense (Stacked Bar Chart)
  const advanceVsActualData = [
    { name: 'Advance', data: [20000, 25008, 30000, 32000, 35008] },
    { name: 'Actual', data: [18000, 22000, 25008, 28000, 30000] }
  ];
  const advanceVsActualCategories = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const advanceVsActualColors = ['#1e40af', '#60a5fa'];

  // Recent Claims data
  const recentClaims = [
    {
      id: '1',
      employeeName: 'John Doe',
      type: 'Non-Advance',
      amount: 1200,
      date: '2025-01-12',
      status: 'Pending Finance'
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      type: 'Advance Settlement',
      amount: 4600,
      date: '2025-01-19',
      status: 'Pending HR'
    },
    {
      id: '3',
      employeeName: 'Emily Chen',
      type: 'Non-Advance',
      amount: 980,
      date: '2025-01-18',
      status: 'Pending Manager'
    },
    {
      id: '4',
      employeeName: 'Robert Taylor',
      type: 'Non-Advance',
      amount: 1500,
      date: '2025-01-16',
      status: 'Approved'
    },
    {
      id: '5',
      employeeName: 'Mike Davis',
      type: 'Non-Advance',
      amount: 890,
      date: '2025-01-14',
      status: 'Rejected'
    }
  ];

  const recentClaimsColumns = [
    {
      key: 'employeeName',
      title: 'Employee',
      render: (value) => (
        <span className="font-medium text-neutral-900">{value}</span>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="font-semibold text-neutral-900">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'date',
      title: 'Date',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          'Approved': { variant: 'success', label: 'Approved' },
          'Rejected': { variant: 'danger', label: 'Rejected' },
          'Pending Finance': { variant: 'info', label: 'Pending Finance' },
          'Pending HR': { variant: 'info', label: 'Pending HR' },
          'Pending Manager': { variant: 'info', label: 'Pending Manager' }
        };
        const config = statusConfig[value] || { variant: 'info', label: value };
        return <Badge size="sm">{config.label}</Badge>;
      }
    },
    {
      key: 'action',
      title: 'Action',
      render: (value, row) => (
        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          View
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Overview
        </h1>
        <p className="text-lg text-neutral-600">
          Monitor claims, advances, and settlements across the organisation.
        </p>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards cards={statCards} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown - Pie Chart */}
        <PieChart
          title="Expense Category Breakdown"
          subtitle="Share of total spending by category"
          data={expenseCategoryData}
          labels={expenseCategoryLabels}
          colors={expenseCategoryColors}
          height={350}
          showLegend={true}
          legendPosition="bottom"
          showDataLabels={true}
        />

        {/* Monthly Claims vs Settlements - Line Chart */}
        <LineChart
          title="Monthly Claims vs Settlements"
          subtitle="Raised compared to settled claims"
          data={monthlyClaimsData}
          categories={monthlyClaimsCategories}
          height={350}
          colors={monthlyClaimsColors}
          showLegend={true}
          showMarkers={true}
          smooth={true}
        />

        {/* Department-wise Consumption - Bar Chart */}
        <BarGraph
          title="Department-wise Consumption"
          subtitle="Expense utilisation by department"
          data={departmentConsumptionData}
          categories={departmentConsumptionCategories}
          height={350}
          colors={departmentConsumptionColors}
          showGrid={true}
          yAxisTitle="Expense Utilisation"
        />

        {/* Advance vs Actual Expense - Stacked Bar Chart */}
        <BarGraph
          title="Advance vs Actual Expense"
          subtitle="Track advance release and utilisation"
          data={advanceVsActualData}
          categories={advanceVsActualCategories}
          height={350}
          colors={advanceVsActualColors}
          stacked={true}
          showLegend={true}
          showGrid={true}
          yAxisTitle="Amount"
        />
      </div>

      {/* Recent Claims Table */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Claims</h2>
          <p className="text-sm text-neutral-600">Last 10 claims awaiting action.</p>
        </div>
        <Table
          columns={recentClaimsColumns}
          data={recentClaims}
          loading={false}
          pagination={false}
          emptyMessage="No recent claims found."
        />
      </div>
    </div>
  );
};

export default ExpensesPage;

