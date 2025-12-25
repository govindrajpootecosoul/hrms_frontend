'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { mockData } from '@/lib/api';

const PIE_COLORS = ['#2563eb', '#f97316', '#22c55e', '#a855f7', '#ef4444'];

export default function ExpensesOverviewPage() {
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const response = await api.get('/expenses/overview');
        setOverview(response.data);
      } catch (error) {
        console.warn('Using mock overview data for expenses');
        setOverview(mockData.expensesModule.overview);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading expense dashboard...</p>
      </div>
    );
  }

  const { kpis, categoryBreakdown, monthlyTrends, departmentSpend, advanceComparison, recentClaims } = overview;

  const kpiCards = [
    { title: 'Total Claims Submitted', value: kpis.totalClaims.toString(), gradient: 'from-blue-600 via-blue-500 to-indigo-600' },
    { title: 'Pending Approvals', value: kpis.pendingApprovals.toString(), gradient: 'from-amber-500 via-orange-500 to-rose-500' },
    { title: 'Approved Claims (MTD)', value: kpis.approvedClaims.toString(), gradient: 'from-emerald-500 via-green-500 to-lime-500' },
    { title: 'Rejected Claims', value: kpis.rejectedClaims.toString(), gradient: 'from-rose-500 via-pink-500 to-fuchsia-500' },
    { title: 'Total Outstanding Advances', value: `₹${kpis.outstandingAdvances.toLocaleString()}`, gradient: 'from-cyan-500 via-blue-500 to-indigo-500' },
    { title: 'Total Settled Amount', value: `₹${kpis.settledAmount.toLocaleString()}`, gradient: 'from-purple-500 via-violet-500 to-purple-700' },
    { title: 'Avg Reimbursement Time (Days)', value: kpis.avgReimbursementTime.toFixed(1), gradient: 'from-slate-600 via-slate-500 to-slate-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expense & Reimbursement Overview</h1>
          <p className="text-muted-foreground">
            Monitor claims, advances, and settlements across the organisation.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className={`text-white bg-gradient-to-br ${kpi.gradient} shadow-lg`}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-white/80">{kpi.title}</p>
              <h3 className="text-3xl font-bold mt-3">{kpi.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Expense Category Breakdown</CardTitle>
            <CardDescription>Share of total spending by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Claims vs Settlements</CardTitle>
            <CardDescription>Raised compared to settled claims</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="raised" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="settled" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Department-wise Consumption</CardTitle>
            <CardDescription>Expense utilisation by department</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentSpend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Advance vs Actual Expense</CardTitle>
            <CardDescription>Track advance release and utilisation</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advanceComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="advance" stackId="a" fill="#0ea5e9" />
                <Bar dataKey="actual" stackId="a" fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription>Last 10 claims awaiting action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2">Employee</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.map((claim: any) => (
                  <tr key={claim.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{claim.employee}</td>
                    <td>{claim.type}</td>
                    <td>₹{claim.amount.toLocaleString()}</td>
                    <td>{claim.date}</td>
                    <td>
                      <span className="text-xs rounded-full px-2 py-1 bg-blue-100 text-blue-700">
                        {claim.status}
                      </span>
                    </td>
                    <td>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}


