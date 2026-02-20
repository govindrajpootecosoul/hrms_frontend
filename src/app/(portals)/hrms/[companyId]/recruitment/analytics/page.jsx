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
          // For HRMS Admin Portal - don't send company header to allow all data access
          // headers['x-company'] = company;
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
                  title: 'TOTAL ACTIVE JOBS', 
                  value: String(data.kpiCards.totalActiveJobs || 0), 
                  icon: Briefcase, 
                  gradient: 'from-purple-600 via-purple-500 to-purple-700'
                },
                { 
                  title: 'TOTAL APPLICATIONS', 
                  value: String(data.kpiCards.totalApplications || 0), 
                  icon: FileText, 
                  gradient: 'from-blue-600 via-blue-500 to-blue-700'
                },
                { 
                  title: 'SHORTLISTED', 
                  value: String(data.kpiCards.shortlisted || 0), 
                  icon: Star, 
                  gradient: 'from-orange-500 via-orange-400 to-orange-600'
                },
                { 
                  title: 'INTERVIEWS SCHEDULED', 
                  value: String(data.kpiCards.interviewsScheduled || 0), 
                  icon: Calendar, 
                  gradient: 'from-red-600 via-red-500 to-red-700'
                },
                { 
                  title: 'OFFERS SENT', 
                  value: String(data.kpiCards.offersSent || 0), 
                  icon: Handshake, 
                  gradient: 'from-green-600 via-green-500 to-green-700'
                },
                { 
                  title: 'HIRED', 
                  value: String(data.kpiCards.hired || 0), 
                  icon: CheckCircle2, 
                  gradient: 'from-emerald-500 via-emerald-400 to-emerald-600'
                },
                { 
                  title: 'AVG. TIME TO HIRE', 
                  value: data.kpiCards.avgTimeToHire || '0%', 
                  icon: Clock, 
                  gradient: 'from-blue-800 via-blue-700 to-blue-900'
                },
                { 
                  title: 'AVG. INTERVIEW TIME', 
                  value: data.kpiCards.avgInterviewTime || '0 Days', 
                  icon: Timer, 
                  gradient: 'from-red-800 via-red-700 to-red-900'
                },
                { 
                  title: 'AVG. OFFER ACCEPTANCE RATE', 
                  value: data.kpiCards.avgOfferAcceptanceRate || '0%', 
                  icon: Percent, 
                  gradient: 'from-purple-600 via-purple-500 to-purple-700'
                },
                { 
                  title: 'OFFER REJECTION RATE', 
                  value: data.kpiCards.offerRejectionRate || '0%', 
                  icon: ArrowDown, 
                  gradient: 'from-blue-800 via-blue-700 to-blue-900'
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
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-emerald-400', 'bg-orange-500', 'bg-purple-500', 'bg-blue-800', 'bg-cyan-400'];
    return colors[index % colors.length];
  };

  // Helper function to get color for funnel stages
  const getFunnelColor = (stage) => {
    const colorMap = {
      'New': 'bg-blue-500',
      'Shortlisted': 'bg-cyan-400',
      'Screening': 'bg-slate-300',
      'Interview Aligned': 'bg-orange-500',
      'Feedback Call': 'bg-slate-300',
      'Finalized': 'bg-emerald-400',
      'Hired': 'bg-slate-300',
      'On Hold': 'bg-slate-300'
    };
    return colorMap[stage] || 'bg-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Analytics</h1>
          <p className="text-sm text-slate-600 mt-1">Comprehensive recruitment analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filters */}
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {hrList.map((hr) => (
              <option key={hr} value={hr}>{hr}</option>
            ))}
          </select>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Auto Refresh</span>
          </button>
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
              className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg`}
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
      )}

      {/* Main Content Grid */}
      {!loading && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate for Interview in Pipeline by HR */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Candidate for Interview in Pipeline by HR</h3>
              <p className="text-sm text-slate-600 mt-1">Pending interview candidates by HR</p>
            </div>
            <div className="space-y-4">
              {pipelineByHR.length > 0 ? (
                pipelineByHR.map((hr, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{hr.name}</span>
                      <span className="text-sm text-slate-600">{hr.candidates} candidates ({hr.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div 
                        className={`${getPipelineColor(index)} h-2.5 rounded-full transition-all`}
                        style={{ width: `${hr.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">No pipeline data available</div>
              )}
            </div>
          </div>

          {/* Recruitment Percent */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recruitment Percent</h3>
              <p className="text-sm text-slate-600 mt-1">Candidate distribution by status</p>
            </div>
            <div className="space-y-4">
              {recruitmentFunnel.length > 0 ? (
                recruitmentFunnel.map((stage, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                      <span className="text-sm text-slate-600">{stage.candidates} candidate ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div 
                        className={`${getFunnelColor(stage.stage)} h-2.5 rounded-full transition-all`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">No recruitment funnel data available</div>
              )}
            </div>
          </div>

          {/* Today's Calls by HR */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Today's Calls by HR</h3>
              <p className="text-sm text-slate-600 mt-1">Number of calls made by each HR</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={todaysCallsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="calls" fill="#9333ea" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* HR Performance Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">HR Performance Comparison</h3>
              <p className="text-sm text-slate-600 mt-1">Shortlisted vs Positioned by each HR</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hrPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="shortlisted" fill="#9333ea" radius={[8, 8, 0, 0]} name="Shortlisted" />
                <Bar dataKey="positioned" fill="#10b981" radius={[8, 8, 0, 0]} name="Positioned" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Location Based Hiring Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Location Based Hiring Distribution</h3>
              <p className="text-sm text-slate-600 mt-1">Hiring by region</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* HR Activity Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">HR Activity Table</h3>
              <p className="text-sm text-slate-600 mt-1">Performance metrics for each HR recruiter</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">HR Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Total Calls</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Shortlisted</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Interviews Scheduled</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Offers Sent</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Hires Closed</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Conversion %</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Avg. Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  {hrActivityData.map((hr, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-700 font-medium">{hr.hrName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{hr.totalCalls}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{hr.shortlisted}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{hr.interviewsScheduled}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{hr.offersSent}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{hr.hiresClosed}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{hr.conversion}%</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{hr.avgResponseTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1">
          {/* Recent Activity Log */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity Log</h3>
              <p className="text-sm text-slate-600 mt-1">Last 10 recruitment activities</p>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="border-l-2 border-slate-200 pl-4 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{activity.hr}</p>
                      <p className="text-xs text-slate-600 mt-1">{activity.activity}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${activity.statusColor} whitespace-nowrap ml-2`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
