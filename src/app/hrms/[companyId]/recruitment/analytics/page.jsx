'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { 
  Briefcase,
  FileText,
  Star,
  Calendar, 
  Handshake, 
  CheckCircle2, 
  Clock,
  Timer, 
  Percent,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function SectionCard({ title, description, children, rightSlot }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description ? <p className="text-sm text-slate-600 mt-1">{description}</p> : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      <div className="mx-auto w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-800">{title}</div>
      {description ? <div className="mt-1 text-sm text-slate-600">{description}</div> : null}
    </div>
  );
}

export default function HRAnalyticsPage() {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [selectedHR, setSelectedHR] = useState('All HRs');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [kpiCards, setKpiCards] = useState([]);
  const [pipelineByHR, setPipelineByHR] = useState([]);
  const [recruitmentFunnel, setRecruitmentFunnel] = useState([]);
  const [todaysCallsData, setTodaysCallsData] = useState([]);
  const [hrPerformanceData, setHrPerformanceData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [hrActivityData, setHrActivityData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [hrList, setHrList] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Function to get company name
  const getCompanyName = () => {
    let company = currentCompany?.name;
    if (!company && typeof window !== 'undefined') {
      company = sessionStorage.getItem('selectedCompany') || 
               sessionStorage.getItem('adminSelectedCompany');
    }
    if (!company && companyId && companyId !== 'undefined') {
      if (typeof window !== 'undefined') {
        company = sessionStorage.getItem(`company_${companyId}`);
      }
    }
    return company;
  };

  // Fetch recruitment analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const company = getCompanyName();
        
        const params = new URLSearchParams();
        if (company) {
          params.append('company', company);
        }
        if (selectedMonth) {
          params.append('month', selectedMonth);
        }
        if (selectedHR && selectedHR !== 'All HRs') {
          params.append('hr', selectedHR);
        }
        if (selectedDept && selectedDept !== 'All Departments') {
          params.append('department', selectedDept);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        if (company) {
          headers['x-company'] = company;
        }

        const res = await fetch(`/api/hrms-portal/recruitment/analytics?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            
            // Set KPI Cards
            if (data.kpiCards) {
              setKpiCards([
                { 
                  title: 'Total active jobs', 
                  value: String(data.kpiCards.totalActiveJobs || 0), 
                  icon: Briefcase, 
                  accent: 'border-indigo-200',
                  iconBg: 'bg-indigo-50',
                  iconColor: 'text-indigo-700',
                },
                { 
                  title: 'Total applications', 
                  value: String(data.kpiCards.totalApplications || 0), 
                  icon: FileText, 
                  accent: 'border-sky-200',
                  iconBg: 'bg-sky-50',
                  iconColor: 'text-sky-700',
                },
                { 
                  title: 'Shortlisted', 
                  value: String(data.kpiCards.shortlisted || 0), 
                  icon: Star, 
                  accent: 'border-amber-200',
                  iconBg: 'bg-amber-50',
                  iconColor: 'text-amber-700',
                },
                { 
                  title: 'Interviews scheduled', 
                  value: String(data.kpiCards.interviewsScheduled || 0), 
                  icon: Calendar, 
                  accent: 'border-rose-200',
                  iconBg: 'bg-rose-50',
                  iconColor: 'text-rose-700',
                },
                { 
                  title: 'Offers sent', 
                  value: String(data.kpiCards.offersSent || 0), 
                  icon: Handshake, 
                  accent: 'border-teal-200',
                  iconBg: 'bg-teal-50',
                  iconColor: 'text-teal-700',
                },
                { 
                  title: 'Hired', 
                  value: String(data.kpiCards.hired || 0), 
                  icon: CheckCircle2, 
                  accent: 'border-emerald-200',
                  iconBg: 'bg-emerald-50',
                  iconColor: 'text-emerald-700',
                },
                { 
                  title: 'Avg. time to hire', 
                  value: data.kpiCards.avgTimeToHire || '0%', 
                  icon: Clock, 
                  accent: 'border-slate-200',
                  iconBg: 'bg-slate-50',
                  iconColor: 'text-slate-700',
                },
                { 
                  title: 'Avg. interview time', 
                  value: data.kpiCards.avgInterviewTime || '0 Days', 
                  icon: Timer, 
                  accent: 'border-slate-200',
                  iconBg: 'bg-slate-50',
                  iconColor: 'text-slate-700',
                },
                { 
                  title: 'Avg. offer acceptance rate', 
                  value: data.kpiCards.avgOfferAcceptanceRate || '0%', 
                  icon: Percent, 
                  accent: 'border-violet-200',
                  iconBg: 'bg-violet-50',
                  iconColor: 'text-violet-700',
                },
                { 
                  title: 'Offer rejection rate', 
                  value: data.kpiCards.offerRejectionRate || '0%', 
                  icon: ArrowDown, 
                  accent: 'border-slate-200',
                  iconBg: 'bg-slate-50',
                  iconColor: 'text-slate-700',
                },
              ]);
            }
            
            // Set other data
            setPipelineByHR(data.pipelineByHR || []);
            setRecruitmentFunnel(data.recruitmentFunnel || []);
            setTodaysCallsData(data.todaysCallsData || []);
            setHrPerformanceData(data.hrPerformanceData || []);
            setLocationData(data.locationData || []);
            setHrActivityData(data.hrActivityData || []);
            setRecentActivities(data.recentActivities || []);
            setHrList(['All HRs', ...(data.hrList || [])]);
            setDepartments(['All Departments', ...(data.departments || [])]);
          }
        }
      } catch (err) {
        console.error('Fetch recruitment analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [companyId, currentCompany, selectedMonth, selectedHR, selectedDept]);

  // Helper function to get color for pipeline items
  const getPipelineColor = (index) => {
    const colors = ['bg-indigo-500', 'bg-teal-500', 'bg-sky-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-emerald-500'];
    return colors[index % colors.length];
  };

  // Helper function to get color for funnel stages
  const getFunnelColor = (stage) => {
    const colorMap = {
      'New': 'bg-indigo-500',
      'Shortlisted': 'bg-sky-500',
      'Screening': 'bg-slate-300',
      'Interview Aligned': 'bg-amber-500',
      'Feedback Call': 'bg-slate-300',
      'Finalized': 'bg-teal-500',
      'Hired': 'bg-slate-300',
      'On Hold': 'bg-slate-300'
    };
    return colorMap[stage] || 'bg-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-900">HR Analytics</h1>
          <p className="text-sm text-slate-600 mt-1">Recruitment analytics and operational insights</p>
        </div>

        {/* Filter Bar */}
        <div className="w-full lg:w-auto">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300"
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
                <select
                  value={selectedHR}
                  onChange={(e) => setSelectedHR(e.target.value)}
                  className="h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300"
                >
                  {hrList.map((hr) => (
                    <option key={hr} value={hr}>{hr}</option>
                  ))}
                </select>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="sm:ml-auto">
                <button
                  type="button"
                  className="h-10 w-full sm:w-auto flex items-center justify-center gap-2 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-900 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">Loading analytics data...</div>
        </div>
      )}

      {/* KPI Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`group bg-white rounded-2xl border ${card.accent} shadow-[0_1px_0_0_rgba(15,23,42,0.04)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl border border-slate-200/60 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</div>
              <div className="mt-1 text-sm text-slate-600">{card.title}</div>
            </div>
          );
        })}
        </div>
      )}

      {/* Main Content Grid */}
      {!loading && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate for Interview in Pipeline by HR */}
          <SectionCard
            title="Candidates in interview pipeline (by HR)"
            description="Pending interview candidates grouped by recruiter"
          >
            <div className="space-y-4">
              {pipelineByHR.length > 0 ? (
                pipelineByHR.map((hr, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2 gap-4">
                      <span className="text-sm font-medium text-slate-700 truncate">{hr.name}</span>
                      <span className="text-sm text-slate-600 whitespace-nowrap">{hr.candidates} candidates ({hr.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${getPipelineColor(index)} h-2.5 rounded-full transition-all`}
                        style={{ width: `${hr.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No pipeline data yet"
                  description="Once recruiters start moving candidates, you’ll see the distribution here."
                />
              )}
            </div>
          </SectionCard>

          {/* Recruitment Percent */}
          <SectionCard
            title="Recruitment funnel"
            description="Candidate distribution by pipeline stage"
          >
            <div className="space-y-4">
              {recruitmentFunnel.length > 0 ? (
                recruitmentFunnel.map((stage, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2 gap-4">
                      <span className="text-sm font-medium text-slate-700 truncate">{stage.stage}</span>
                      <span className="text-sm text-slate-600 whitespace-nowrap">{stage.candidates} candidate ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${getFunnelColor(stage.stage)} h-2.5 rounded-full transition-all`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No funnel data yet"
                  description="Apply filters or wait for candidates to enter the pipeline."
                />
              )}
            </div>
          </SectionCard>

          {/* Today's Calls by HR */}
          <SectionCard
            title="Today’s calls (by HR)"
            description="Calls made by each recruiter"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={todaysCallsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="calls" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {todaysCallsData?.length ? null : (
              <div className="mt-4">
                <EmptyState
                  icon={Clock}
                  title="No call activity for the selected filters"
                  description="Try changing the timeframe or HR filter to see activity."
                />
              </div>
            )}
          </SectionCard>

          {/* HR Performance Comparison */}
          <SectionCard
            title="HR performance comparison"
            description="Shortlisted vs positioned by recruiter"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hrPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="shortlisted" fill="#4f46e5" radius={[8, 8, 0, 0]} name="Shortlisted" />
                <Bar dataKey="positioned" fill="#0f766e" radius={[8, 8, 0, 0]} name="Positioned" />
              </BarChart>
            </ResponsiveContainer>
            {hrPerformanceData?.length ? null : (
              <div className="mt-4">
                <EmptyState
                  icon={Star}
                  title="No performance data yet"
                  description="Once candidates are shortlisted/positioned, this chart will populate."
                />
              </div>
            )}
          </SectionCard>

          {/* Location Based Hiring Distribution */}
          <SectionCard
            title="Location-based hiring"
            description="Hiring distribution by region"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {locationData?.length ? null : (
              <div className="mt-4">
                <EmptyState
                  icon={Handshake}
                  title="No location distribution yet"
                  description="This will appear once hires are captured with locations."
                />
              </div>
            )}
          </SectionCard>

          {/* HR Activity Table */}
          <SectionCard
            title="HR activity"
            description="Operational metrics for each recruiter"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">HR</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Calls</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Shortlisted</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Interviews</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Offers</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Hires</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Conversion</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Avg. response</th>
                  </tr>
                </thead>
                <tbody>
                  {hrActivityData?.length ? (
                    hrActivityData.map((hr, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-sm text-slate-800 font-medium">{hr.hrName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{hr.totalCalls}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{hr.shortlisted}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{hr.interviewsScheduled}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{hr.offersSent}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{hr.hiresClosed}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{hr.conversion}%</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{hr.avgResponseTime}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 px-4">
                        <EmptyState
                          icon={CheckCircle2}
                          title="No HR activity yet"
                          description="Once recruiters start working, you’ll see metrics summarized here."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1">
          {/* Recent Activity Log */}
          <div className="sticky top-6">
            <SectionCard
              title="Recent activity"
              description="Latest recruitment events"
            >
              <div className="space-y-3">
                {recentActivities?.length ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-3">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-slate-300" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{activity.hr}</p>
                        <p className="text-xs text-slate-600 mt-1">{activity.activity}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${activity.statusColor} whitespace-nowrap`}>
                        {activity.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={RefreshCw}
                    title="No recent activity"
                    description="Activity will appear here as recruiters work on candidates."
                  />
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
