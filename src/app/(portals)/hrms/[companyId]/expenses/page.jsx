'use client';

import { useParams } from 'next/navigation';
import { Receipt, RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertCircle, Wallet, TrendingUp } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import BarGraph from '@/components/charts/BarGraph';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

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

  const kpiCards = [
    {
      title: 'TOTAL CLAIMS SUBMITTED',
      value: expenseStats.totalClaimsSubmitted,
      icon: FileText,
      gradient: 'from-blue-600 via-blue-500 to-blue-700',
    },
    {
      title: 'PENDING APPROVALS',
      value: expenseStats.pendingApprovals,
      icon: AlertCircle,
      gradient: 'from-orange-500 via-orange-400 to-orange-600',
    },
    {
      title: 'APPROVED CLAIMS (MTD)',
      value: expenseStats.approvedClaimsMTD,
      icon: CheckCircle,
      gradient: 'from-green-600 via-green-500 to-green-700',
    },
    {
      title: 'REJECTED CLAIMS',
      value: expenseStats.rejectedClaims,
      icon: XCircle,
      gradient: 'from-pink-500 via-pink-400 to-pink-600',
    },
    {
      title: 'TOTAL OUTSTANDING ADVANCES',
      value: `₹${expenseStats.totalOutstandingAdvances.toLocaleString()}`,
      icon: Wallet,
      gradient: 'from-cyan-500 via-cyan-400 to-cyan-600',
    },
    {
      title: 'TOTAL SETTLED AMOUNT',
      value: `₹${expenseStats.totalSettledAmount.toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-purple-600 via-purple-500 to-purple-700',
    },
    {
      title: 'AVG REIMBURSEMENT TIME (DAYS)',
      value: expenseStats.avgReimbursementTime,
      icon: Clock,
      gradient: 'from-slate-700 via-slate-600 to-slate-800',
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
          'Approved': { className: 'text-green-600', label: 'Approved' },
          'Rejected': { className: 'text-red-600', label: 'Rejected' },
          'Pending Finance': { className: 'text-blue-600', label: 'Pending Finance' },
          'Pending HR': { className: 'text-blue-600', label: 'Pending HR' },
          'Pending Manager': { className: 'text-blue-600', label: 'Pending Manager' }
        };
        const config = statusConfig[value] || { className: 'text-slate-600', label: value };
        return (
          <span className={`text-sm font-medium ${config.className}`}>
            {config.label}
          </span>
        );
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">
            Expense & Reimbursement Overview
          </h1>
          <p className="text-sm text-slate-600">
            Monitor claims, advances, and settlements across the organisation.
          </p>
        </div>
        <Button
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          icon={<RefreshCw className="w-4 h-4" />}
          iconPosition="left"
        >
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{card.value}</div>
              <div className="text-xs text-white/90 uppercase tracking-wide">{card.title}</div>
            </div>
          );
        })}
      </div>

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
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900">Recent Claims</h2>
            <p className="text-sm text-slate-600">Last 10 claims awaiting action</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {recentClaimsColumns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {recentClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  {recentClaimsColumns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      {column.render
                        ? column.render(claim[column.key], claim)
                        : claim[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;

