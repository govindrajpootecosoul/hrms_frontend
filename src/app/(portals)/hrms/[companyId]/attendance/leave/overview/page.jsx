'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import { Users, AlertCircle, CheckCircle2, XCircle, Calendar, Stethoscope, Star, FileText, Home, Ban } from 'lucide-react';
import BarGraph from '@/components/charts/BarGraph';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const AttendanceLeaveOverviewPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [leaveStats, setLeaveStats] = useState({
    totalOnLeave: 0,
    leaveForApproval: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0
  });
  
  const [leaveUtilizationData, setLeaveUtilizationData] = useState([
    { name: 'Utilized', data: [] },
    { name: 'Remaining', data: [] }
  ]);
  
  const [employeeNames, setEmployeeNames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch leave overview data
  useEffect(() => {
    const fetchLeaveOverview = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        // Get company name from multiple sources
        let company = currentCompany?.name;
        if (!company && typeof window !== 'undefined') {
          company = sessionStorage.getItem('selectedCompany') || 
                   sessionStorage.getItem('adminSelectedCompany');
        }
        // If still no company and companyId is a number, try to map it
        if (!company && companyId && companyId !== 'undefined') {
          // Try to get from sessionStorage with companyId key
          if (typeof window !== 'undefined') {
            company = sessionStorage.getItem(`company_${companyId}`);
          }
        }
        
        const params = new URLSearchParams();
        if (company) {
          params.append('company', company);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        if (company) {
          headers['x-company'] = company;
        }
        
        console.log('[Leave Overview] Fetching with company:', company);

        const [statsRes, utilizationRes] = await Promise.all([
          fetch(`/api/hrms-portal/leaves/overview/stats?${params.toString()}`, { headers }),
          fetch(`/api/hrms-portal/leaves/overview/utilization?${params.toString()}`, { headers })
        ]);

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.success) {
            setLeaveStats(statsJson.data);
          }
        }

        if (utilizationRes.ok) {
          const utilJson = await utilizationRes.json();
          if (utilJson.success && utilJson.data.utilization) {
            const utilization = utilJson.data.utilization;
            const names = utilization.map(item => item.employee);
            const utilized = utilization.map(item => item.utilized);
            const remaining = utilization.map(item => item.remaining);
            
            setEmployeeNames(names);
            setLeaveUtilizationData([
              { name: 'Utilized', data: utilized },
              { name: 'Remaining', data: remaining }
            ]);
          }
        }
      } catch (err) {
        console.error('Fetch leave overview error:', err);
        toast.error('Failed to load leave overview data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveOverview();
  }, [companyId, currentCompany, toast]);

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
            {loading ? (
              <div className="flex items-center justify-center h-[460px]">
                <div className="text-slate-600">Loading leave utilization data...</div>
              </div>
            ) : employeeNames.length === 0 ? (
              <div className="flex items-center justify-center h-[460px]">
                <div className="text-slate-600">No leave utilization data available</div>
              </div>
            ) : (
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLeaveOverviewPage;




