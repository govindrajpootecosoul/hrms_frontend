'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertCircle, Wallet, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import BarGraph from '@/components/charts/BarGraph';
import Button from '@/components/common/Button';

const ExpensesOverviewPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [loading, setLoading] = useState(false);
  const [expenseStats, setExpenseStats] = useState({
    totalClaimsSubmitted: 128,
    pendingApprovals: 18,
    approvedClaimsMTD: 92,
    rejectedClaims: 6,
    totalOutstandingAdvances: 18500,
    totalSettledAmount: 74200,
    avgReimbursementTime: 4.2
  });

  // Fetch data function (simulated)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, fetch from API here
      // const response = await fetch(`/api/expenses/overview?companyId=${companyId}`);
      // const data = await response.json();
      // setExpenseStats(data);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const handleRefresh = () => {
    fetchData();
  };

  const kpiCards = [
    {
      title: 'TOTAL CLAIMS SUBMITTED',
      value: expenseStats.totalClaimsSubmitted,
      icon: FileText,
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
      shadow: 'shadow-blue-500/30',
    },
    {
      title: 'PENDING APPROVALS',
      value: expenseStats.pendingApprovals,
      icon: AlertCircle,
      gradient: 'from-orange-600 via-amber-600 to-orange-700',
      shadow: 'shadow-orange-500/30',
    },
    {
      title: 'APPROVED CLAIMS (MTD)',
      value: expenseStats.approvedClaimsMTD,
      icon: CheckCircle,
      gradient: 'from-green-600 via-emerald-600 to-green-700',
      shadow: 'shadow-green-500/30',
    },
    {
      title: 'REJECTED CLAIMS',
      value: expenseStats.rejectedClaims,
      icon: XCircle,
      gradient: 'from-red-600 via-rose-600 to-red-700',
      shadow: 'shadow-red-500/30',
    },
    {
      title: 'TOTAL OUTSTANDING ADVANCES',
      value: `₹${expenseStats.totalOutstandingAdvances.toLocaleString()}`,
      icon: Wallet,
      gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
      shadow: 'shadow-cyan-500/30',
    },
    {
      title: 'TOTAL SETTLED AMOUNT',
      value: `₹${expenseStats.totalSettledAmount.toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-purple-600 via-violet-600 to-purple-700',
      shadow: 'shadow-purple-500/30',
    },
    {
      title: 'AVG REIMBURSEMENT TIME (DAYS)',
      value: expenseStats.avgReimbursementTime,
      icon: Clock,
      gradient: 'from-slate-600 via-slate-500 to-slate-700',
      shadow: 'shadow-slate-500/30',
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
  const monthlyClaimsColors = ['#2563eb', '#22c55e']; // Blue for raised, Green for settled

  // 3. Department-wise Consumption (Bar Chart)
  const departmentConsumptionData = [38000, 23000, 19500, 8000, 20000];
  const departmentConsumptionCategories = ['Sales', 'Engineering', 'Marketing', 'HR', 'Operations'];
  const departmentConsumptionColors = ['#f97316']; // Orange

  // 4. Advance vs Actual Expense (Stacked Bar Chart)
  const advanceVsActualData = [
    { name: 'Advance', data: [20000, 25008, 30000, 32000, 35008] },
    { name: 'Actual', data: [18000, 22000, 25008, 28000, 30000] }
  ];
  const advanceVsActualCategories = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const advanceVsActualColors = ['#0ea5e9', '#22d3ee']; // Cyan for advance, Teal for actual

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600">Loading expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
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
          onClick={handleRefresh}
          disabled={loading}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          iconPosition="left"
        >
          Refresh Data
        </Button>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer group`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-100`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 p-4 lg:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm flex-shrink-0 shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-white/90 mb-2 uppercase tracking-wide truncate">
                      {card.title}
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                      {card.value}
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Decorative blur circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>
          );
        })}
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown - Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300">
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
        </div>

        {/* Monthly Claims vs Settlements - Line Chart */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300">
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
        </div>

        {/* Department-wise Consumption - Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300">
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
        </div>

        {/* Advance vs Actual Expense - Stacked Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300">
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
      </div>

      {/* Enhanced Recent Claims Table */}
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {recentClaims.map((claim) => {
                const statusConfig = {
                  'Approved': { className: 'text-green-600', label: 'Approved' },
                  'Rejected': { className: 'text-red-600', label: 'Rejected' },
                  'Pending Finance': { className: 'text-blue-600', label: 'Pending Finance' },
                  'Pending HR': { className: 'text-blue-600', label: 'Pending HR' },
                  'Pending Manager': { className: 'text-blue-600', label: 'Pending Manager' }
                };
                const status = statusConfig[claim.status] || { className: 'text-slate-600', label: claim.status };
                
                return (
                  <tr key={claim.id} className="hover:bg-slate-50/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900">{claim.employeeName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{claim.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">₹{claim.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{claim.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* HR Copilot Floating Button */}
      <button className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-slate-900 transition-colors flex items-center gap-2 z-50">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">HR Copilot</span>
      </button>
    </div>
  );
};

export default ExpensesOverviewPage;
