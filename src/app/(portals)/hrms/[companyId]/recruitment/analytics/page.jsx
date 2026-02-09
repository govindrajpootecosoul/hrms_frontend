'use client';

import { useState } from 'react';
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
  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [selectedHR, setSelectedHR] = useState('All HRs');
  const [selectedDept, setSelectedDept] = useState('All Departments');

  // All KPI Cards (10 cards)
  const kpiCards = [
    { 
      title: 'TOTAL ACTIVE JOBS', 
      value: '12', 
      icon: Briefcase, 
      gradient: 'from-purple-600 via-purple-500 to-purple-700'
    },
    { 
      title: 'TOTAL APPLICATIONS', 
      value: '245', 
      icon: FileText, 
      gradient: 'from-blue-600 via-blue-500 to-blue-700'
    },
    { 
      title: 'SHORTLISTED', 
      value: '59', 
      icon: Star, 
      gradient: 'from-orange-500 via-orange-400 to-orange-600'
    },
    { 
      title: 'INTERVIEWS SCHEDULED', 
      value: '45', 
      icon: Calendar, 
      gradient: 'from-red-600 via-red-500 to-red-700'
    },
    { 
      title: 'OFFERS SENT', 
      value: '38', 
      icon: Handshake, 
      gradient: 'from-green-600 via-green-500 to-green-700'
    },
    { 
      title: 'HIRED', 
      value: '32', 
      icon: CheckCircle2, 
      gradient: 'from-emerald-500 via-emerald-400 to-emerald-600'
    },
    { 
      title: 'AVG. TIME TO HIRE', 
      value: '15.5%', 
      icon: Clock, 
      gradient: 'from-blue-800 via-blue-700 to-blue-900'
    },
    { 
      title: 'AVG. INTERVIEW TIME', 
      value: '10 Days', 
      icon: Timer, 
      gradient: 'from-red-800 via-red-700 to-red-900'
    },
    { 
      title: 'AVG. OFFER ACCEPTANCE RATE', 
      value: '05 Days', 
      icon: Percent, 
      gradient: 'from-purple-600 via-purple-500 to-purple-700'
    },
    { 
      title: 'OFFER REJECTION RATE', 
      value: '8.2%', 
      icon: ArrowDown, 
      gradient: 'from-blue-800 via-blue-700 to-blue-900'
    },
  ];

  // Candidate for Interview in Pipeline by HR
  const pipelineByHR = [
    { name: 'David Lee', candidates: 1, percentage: 15.4, color: 'bg-blue-500' },
    { name: 'Emma Brown', candidates: 1, percentage: 15.4, color: 'bg-green-500' },
    { name: 'James Taylor', candidates: 1, percentage: 15.4, color: 'bg-emerald-400' },
    { name: 'Lisa Anderson', candidates: 1, percentage: 15.4, color: 'bg-orange-500' },
    { name: 'Sarah Johnson', candidates: 1, percentage: 15.4, color: 'bg-purple-500' },
    { name: 'Mike Wilson', candidates: 1, percentage: 15.4, color: 'bg-blue-800' },
    { name: 'Zanah Johnson', candidates: 1, percentage: 15.4, color: 'bg-emerald-400' },
  ];

  // Recruitment Funnel
  const recruitmentFunnel = [
    { stage: 'New', candidates: 1, percentage: 5.0, color: 'bg-blue-500' },
    { stage: 'Shortlisted', candidates: 1, percentage: 5.0, color: 'bg-cyan-400' },
    { stage: 'Screening', candidates: 0, percentage: 0.0, color: 'bg-slate-300' },
    { stage: 'Interview Aligned', candidates: 12, percentage: 60.0, color: 'bg-orange-500' },
    { stage: 'Feedback Call', candidates: 0, percentage: 0.0, color: 'bg-slate-300' },
    { stage: 'Finalized', candidates: 1, percentage: 5.0, color: 'bg-emerald-400' },
    { stage: 'Hired', candidates: 0, percentage: 0.0, color: 'bg-slate-300' },
    { stage: 'On Hold', candidates: 0, percentage: 0.0, color: 'bg-slate-300' },
  ];

  // Today's Calls by HR
  const todaysCallsData = [
    { name: 'Sarah Johnson', calls: 7 },
    { name: 'Mike Wilson', calls: 5 },
    { name: 'David Lee', calls: 6 },
    { name: 'Emma Brown', calls: 4 },
    { name: 'James Taylor', calls: 5 },
    { name: 'Lisa Anderson', calls: 8 },
  ];

  // HR Performance Comparison
  const hrPerformanceData = [
    { name: 'Sarah Johnson', shortlisted: 15, positioned: 5 },
    { name: 'Mike Wilson', shortlisted: 13, positioned: 3 },
    { name: 'David Lee', shortlisted: 14, positioned: 4 },
    { name: 'Emma Brown', shortlisted: 12, positioned: 2 },
    { name: 'James Taylor', shortlisted: 14, positioned: 3 },
    { name: 'Lisa Anderson', shortlisted: 15, positioned: 5 },
  ];

  // Location Based Hiring Distribution
  const locationData = [
    { name: 'Bangalore', value: 11 },
    { name: 'Mumbai', value: 7 },
    { name: 'Delhi', value: 5 },
    { name: 'Hyderabad', value: 3 },
    { name: 'Pune', value: 1 },
  ];

  // HR Activity Table
  const hrActivityData = [
    { 
      hrName: 'Sarah Johnson', 
      totalCalls: 128, 
      shortlisted: 24, 
      interviewsScheduled: 18, 
      offersSent: 12, 
      hiresClosed: 10, 
      conversion: 4.9, 
      avgResponseTime: '2.8 hrs' 
    },
    { 
      hrName: 'Mike Wilson', 
      totalCalls: 132, 
      shortlisted: 24, 
      interviewsScheduled: 16, 
      offersSent: 10, 
      hiresClosed: 8, 
      conversion: 4.7, 
      avgResponseTime: '3.2 hrs' 
    },
    { 
      hrName: 'David Lee', 
      totalCalls: 138, 
      shortlisted: 24, 
      interviewsScheduled: 16, 
      offersSent: 11, 
      hiresClosed: 9, 
      conversion: 4.6, 
      avgResponseTime: '2.8 hrs' 
    },
    { 
      hrName: 'Emma Brown', 
      totalCalls: 138, 
      shortlisted: 23, 
      interviewsScheduled: 12, 
      offersSent: 8, 
      hiresClosed: 7, 
      conversion: 4.9, 
      avgResponseTime: '3.6 hrs' 
    },
    { 
      hrName: 'James Taylor', 
      totalCalls: 126, 
      shortlisted: 23, 
      interviewsScheduled: 14, 
      offersSent: 9, 
      hiresClosed: 7, 
      conversion: 4.6, 
      avgResponseTime: '3.0 hrs' 
    },
    { 
      hrName: 'Lisa Anderson', 
      totalCalls: 140, 
      shortlisted: 27, 
      interviewsScheduled: 17, 
      offersSent: 12, 
      hiresClosed: 10, 
      conversion: 7.0, 
      avgResponseTime: '2.5 hrs' 
    },
  ];

  // Recent Activity Log
  const recentActivities = [
    { 
      hr: 'David Lee', 
      activity: 'Candidate Shortlisted', 
      status: 'Approved', 
      statusColor: 'bg-green-500' 
    },
    { 
      hr: 'Emma Brown', 
      activity: 'Offer Declined', 
      status: 'Failed', 
      statusColor: 'bg-red-500' 
    },
    { 
      hr: 'James Taylor', 
      activity: 'Onboarding Completed', 
      status: 'Approved', 
      statusColor: 'bg-green-500' 
    },
    { 
      hr: 'Lisa Anderson', 
      activity: 'Offer Accepted', 
      status: 'Approved', 
      statusColor: 'bg-green-500' 
    },
    { 
      hr: 'Sarah Johnson', 
      activity: 'Interview Completed', 
      status: 'Approved', 
      statusColor: 'bg-green-500' 
    },
    { 
      hr: 'Mike Wilson', 
      activity: 'Interview Scheduled', 
      status: 'Pending', 
      statusColor: 'bg-yellow-500' 
    },
  ];

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
            <option>All HRs</option>
            <option>Sarah Johnson</option>
            <option>Mike Wilson</option>
            <option>David Lee</option>
            <option>Emma Brown</option>
            <option>James Taylor</option>
            <option>Lisa Anderson</option>
          </select>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Sales</option>
            <option>Marketing</option>
            <option>HR</option>
            <option>Operations</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Auto Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Main Content Grid */}
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
              {pipelineByHR.map((hr, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{hr.name}</span>
                    <span className="text-sm text-slate-600">{hr.candidates} candidates ({hr.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className={`${hr.color} h-2.5 rounded-full transition-all`}
                      style={{ width: `${hr.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruitment Percent */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recruitment Percent</h3>
              <p className="text-sm text-slate-600 mt-1">Candidate distribution by status</p>
            </div>
            <div className="space-y-4">
              {recruitmentFunnel.map((stage, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                    <span className="text-sm text-slate-600">{stage.candidates} candidate ({stage.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className={`${stage.color} h-2.5 rounded-full transition-all`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
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
    </div>
  );
}
