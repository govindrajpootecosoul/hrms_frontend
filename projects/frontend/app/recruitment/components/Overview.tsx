'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  UserCheck,
  TrendingUp,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
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
import { Progress } from '@/components/ui/progress';
import { useCandidates } from '../context/CandidateContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// Sample KPI data
const kpiData = {
  totalActiveHRs: 12,
  totalCandidatesContacted: 245,
  interviewsScheduled: 89,
  offersRolledOut: 45,
  offersAccepted: 38,
  onboardingsCompleted: 32,
  avgConversionRate: 15.5,
  avgTimeToHire: 18,
  avgJoiningToConfirmation: 85,
  attritionRate: 8.2,
};

// Sample HR Performance data
const hrPerformanceData = [
  { name: 'Sarah Johnson', contacted: 45, finalized: 12 },
  { name: 'Mike Wilson', contacted: 38, finalized: 10 },
  { name: 'David Lee', contacted: 42, finalized: 11 },
  { name: 'Emma Brown', contacted: 35, finalized: 9 },
  { name: 'James Taylor', contacted: 40, finalized: 8 },
  { name: 'Lisa Anderson', contacted: 45, finalized: 13 },
];

// Status mapping for recruitment funnel
const statusOrder = ['New', 'Shortlisted', 'Screening', 'In Interview', 'Feedback Call', 'Finalized', 'Hired', 'On Hold'];
const statusDisplayNames: Record<string, string> = {
  'New': 'New',
  'Shortlisted': 'Shortlist',
  'Screening': 'Screening',
  'In Interview': 'Interview Aligned',
  'Feedback Call': 'Feedback Call',
  'Finalized': 'Finalized',
  'Hired': 'Hired',
  'On Hold': 'On Hold',
};

// Sample Today's Calls by HR data
const todaysCallsData = [
  { name: 'Sarah Johnson', calls: 8 },
  { name: 'Mike Wilson', calls: 6 },
  { name: 'David Lee', calls: 7 },
  { name: 'Emma Brown', calls: 5 },
  { name: 'James Taylor', calls: 6 },
  { name: 'Lisa Anderson', calls: 9 },
];

// Sample Candidate for Interview in Pipeline by HR data
const interviewPipelineData = [
  { hrName: 'Sarah Johnson', total: 18, completed: 12, inProgress: 6 },
  { hrName: 'Mike Wilson', total: 15, completed: 10, inProgress: 5 },
  { hrName: 'David Lee', total: 16, completed: 11, inProgress: 5 },
  { hrName: 'Emma Brown', total: 12, completed: 8, inProgress: 4 },
  { hrName: 'James Taylor', total: 14, completed: 9, inProgress: 5 },
  { hrName: 'Lisa Anderson', total: 17, completed: 12, inProgress: 5 },
];

// Sample Location data
const locationData = [
  { location: 'Bangalore', hires: 12 },
  { location: 'Mumbai', hires: 8 },
  { location: 'Delhi', hires: 6 },
  { location: 'Hyderabad', hires: 4 },
  { location: 'Pune', hires: 2 },
];

// Sample HR Activity data
const hrActivityData = [
  {
    hrName: 'Sarah Johnson',
    totalCalls: 145,
    shortlisted: 28,
    interviewsScheduled: 18,
    offersSent: 12,
    hiresClosed: 10,
    conversionRate: 6.9,
    avgResponseTime: '2.5 hrs',
  },
  {
    hrName: 'Mike Wilson',
    totalCalls: 132,
    shortlisted: 24,
    interviewsScheduled: 15,
    offersSent: 10,
    hiresClosed: 8,
    conversionRate: 6.1,
    avgResponseTime: '3.2 hrs',
  },
  {
    hrName: 'David Lee',
    totalCalls: 138,
    shortlisted: 26,
    interviewsScheduled: 16,
    offersSent: 11,
    hiresClosed: 9,
    conversionRate: 6.5,
    avgResponseTime: '2.8 hrs',
  },
  {
    hrName: 'Emma Brown',
    totalCalls: 118,
    shortlisted: 22,
    interviewsScheduled: 12,
    offersSent: 8,
    hiresClosed: 7,
    conversionRate: 5.9,
    avgResponseTime: '3.5 hrs',
  },
  {
    hrName: 'James Taylor',
    totalCalls: 125,
    shortlisted: 23,
    interviewsScheduled: 14,
    offersSent: 9,
    hiresClosed: 7,
    conversionRate: 5.6,
    avgResponseTime: '3.0 hrs',
  },
  {
    hrName: 'Lisa Anderson',
    totalCalls: 142,
    shortlisted: 27,
    interviewsScheduled: 17,
    offersSent: 12,
    hiresClosed: 10,
    conversionRate: 7.0,
    avgResponseTime: '2.3 hrs',
  },
];

// Sample Recent Activity data
const recentActivityData = [
  {
    date: '2025-01-20',
    hr: 'Sarah Johnson',
    action: 'Offer Sent',
    candidate: 'John Doe',
    status: 'Success',
    remarks: 'Senior Software Engineer position',
  },
  {
    date: '2025-01-20',
    hr: 'Mike Wilson',
    action: 'Interview Scheduled',
    candidate: 'Jane Smith',
    status: 'Success',
    remarks: 'Product Manager - Round 2',
  },
  {
    date: '2025-01-19',
    hr: 'David Lee',
    action: 'Candidate Shortlisted',
    candidate: 'Robert Brown',
    status: 'Success',
    remarks: 'Full Stack Developer',
  },
  {
    date: '2025-01-19',
    hr: 'Emma Brown',
    action: 'Offer Declined',
    candidate: 'Emily Davis',
    status: 'Failed',
    remarks: 'Salary expectations not met',
  },
  {
    date: '2025-01-18',
    hr: 'James Taylor',
    action: 'Onboarding Completed',
    candidate: 'Michael Chen',
    status: 'Success',
    remarks: 'Cloud Engineer - All steps completed',
  },
  {
    date: '2025-01-18',
    hr: 'Lisa Anderson',
    action: 'Offer Accepted',
    candidate: 'Alex Thompson',
    status: 'Success',
    remarks: 'Data Scientist position',
  },
  {
    date: '2025-01-17',
    hr: 'Sarah Johnson',
    action: 'Interview Completed',
    candidate: 'Lisa Anderson',
    status: 'Success',
    remarks: 'Technical round - Passed',
  },
  {
    date: '2025-01-17',
    hr: 'Mike Wilson',
    action: 'Candidate Contacted',
    candidate: 'David Kumar',
    status: 'Pending',
    remarks: 'Initial screening call',
  },
  {
    date: '2025-01-16',
    hr: 'David Lee',
    action: 'HR Verification',
    candidate: 'Robert Brown',
    status: 'Success',
    remarks: 'Documents verified successfully',
  },
  {
    date: '2025-01-16',
    hr: 'Emma Brown',
    action: 'Policy Acknowledgment',
    candidate: 'Emily Davis',
    status: 'Success',
    remarks: 'All policies acknowledged',
  },
];

export default function Overview() {
  const { sourcingCandidates, hiringCandidates } = useCandidates();
  const [dateRange, setDateRange] = useState('thisMonth');
  const [selectedHR, setSelectedHR] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Calculate recruitment funnel data from candidate statuses
  const recruitmentFunnelData = useMemo(() => {
    const allCandidates = [...sourcingCandidates, ...hiringCandidates];
    const statusCounts: Record<string, number> = {
      'New': 0,
      'Shortlisted': 0,
      'Screening': 0,
      'In Interview': 0,
      'Feedback Call': 0,
      'Finalized': 0,
      'Hired': 0,
      'On Hold': 0,
    };

    allCandidates.forEach(candidate => {
      const status = candidate.status;
      // Map "In Interview" to "Screening" if needed, or handle both
      if (status === 'In Interview' || status === 'Screening') {
        if (status === 'Screening') {
          statusCounts['Screening']++;
        } else {
          statusCounts['In Interview']++;
        }
      } else if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    const total = allCandidates.length || 1; // Avoid division by zero

    return statusOrder.map(status => ({
      name: statusDisplayNames[status] || status,
      count: statusCounts[status] || 0,
      percentage: ((statusCounts[status] || 0) / total) * 100,
    }));
  }, [sourcingCandidates, hiringCandidates]);

  // Calculate pending interview pipeline by HR
  const pendingInterviewByHR = useMemo(() => {
    const allCandidates = [...sourcingCandidates, ...hiringCandidates];
    const pendingInterviewCandidates = allCandidates.filter(
      candidate => candidate.status === 'In Interview'
    );

    const hrCounts: Record<string, number> = {};
    
    pendingInterviewCandidates.forEach(candidate => {
      const hr = candidate.assignedTo || 'Unassigned';
      hrCounts[hr] = (hrCounts[hr] || 0) + 1;
    });

    const total = pendingInterviewCandidates.length || 1;
    const hrList = Object.keys(hrCounts).sort();

    return hrList.map(hr => ({
      hrName: hr,
      count: hrCounts[hr],
      percentage: (hrCounts[hr] / total) * 100,
    }));
  }, [sourcingCandidates, hiringCandidates]);

  // Filter HR Activity data
  const filteredHRActivity = useMemo(() => {
    let filtered = hrActivityData;
    
    if (selectedHR !== 'all') {
      filtered = filtered.filter(item => item.hrName === selectedHR);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.hrName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [selectedHR, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const kpiCards = [
    {
      title: 'Total Active HRs',
      value: kpiData.totalActiveHRs,
      icon: Users,
      delta: '+2',
      deltaType: 'up',
      tooltip: 'Number of active HR recruiters',
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    },
    {
      title: 'Candidates Contacted',
      value: kpiData.totalCandidatesContacted,
      icon: Phone,
      delta: '+15',
      deltaType: 'up',
      tooltip: 'Total candidates contacted this month',
      gradient: 'from-purple-600 via-violet-600 to-purple-700',
    },
    {
      title: 'Interviews Scheduled',
      value: kpiData.interviewsScheduled,
      icon: Calendar,
      delta: '+8',
      deltaType: 'up',
      tooltip: 'Total interviews scheduled',
      gradient: 'from-yellow-600 via-amber-600 to-yellow-700',
    },
    {
      title: 'Offers Rolled Out',
      value: kpiData.offersRolledOut,
      icon: FileText,
      delta: '+5',
      deltaType: 'up',
      tooltip: 'Total offers sent to candidates',
      gradient: 'from-orange-600 via-red-600 to-orange-700',
    },
    {
      title: 'Offers Accepted',
      value: kpiData.offersAccepted,
      icon: CheckCircle,
      delta: '+3',
      deltaType: 'up',
      tooltip: 'Offers accepted by candidates',
      gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    },
    {
      title: 'Onboardings Completed',
      value: kpiData.onboardingsCompleted,
      icon: UserCheck,
      delta: '+4',
      deltaType: 'up',
      tooltip: 'Successfully onboarded candidates',
      gradient: 'from-green-600 via-lime-600 to-green-700',
    },
    {
      title: 'Avg. Conversion Rate',
      value: `${kpiData.avgConversionRate}%`,
      icon: TrendingUp,
      delta: '+1.2%',
      deltaType: 'up',
      tooltip: 'Average conversion rate from contact to hire',
      gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
    },
    {
      title: 'Avg. Time-to-Hire',
      value: `${kpiData.avgTimeToHire} Days`,
      icon: Clock,
      delta: '-2',
      deltaType: 'down',
      tooltip: 'Average days from sourcing to hire',
      gradient: 'from-pink-600 via-rose-600 to-pink-700',
    },
    {
      title: 'Joining-to-Confirmation',
      value: `${kpiData.avgJoiningToConfirmation} Days`,
      icon: Clock,
      delta: '-5',
      deltaType: 'down',
      tooltip: 'Average days from joining to confirmation',
      gradient: 'from-indigo-600 via-purple-600 to-indigo-700',
    },
    {
      title: 'Attrition Rate',
      value: `${kpiData.attritionRate}%`,
      icon: XCircle,
      delta: '-0.5%',
      deltaType: 'down',
      tooltip: 'Employee attrition rate',
      gradient: 'from-red-600 via-pink-600 to-red-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedHR} onValueChange={setSelectedHR}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select HR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All HRs</SelectItem>
                  {hrActivityData.map(hr => (
                    <SelectItem key={hr.hrName} value={hr.hrName}>{hr.hrName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={index}
              className={`relative overflow-hidden bg-gradient-to-br ${kpi.gradient} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer group`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-white/90 mb-1 uppercase tracking-wide truncate">
                      {kpi.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold text-white leading-tight">
                        {kpi.value}
                      </h3>
                      <div className={`flex items-center text-[10px] font-semibold ${
                        kpi.deltaType === 'up' ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {kpi.deltaType === 'up' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {kpi.delta}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[9px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  {kpi.tooltip}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-3 relative">
        {/* Left Column - Charts */}
        <div className="md:col-span-2 grid gap-4">
          {/* Candidate for Interview in Pipeline by HR */}
          <Card id="interview-pipeline-end">
            <CardHeader>
              <CardTitle className="text-base">Candidate for Interview in Pipeline by HR</CardTitle>
              <CardDescription>Pending interview candidates by HR</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInterviewByHR.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending interview candidates
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInterviewByHR.map((hr, index) => (
                    <div key={hr.hrName} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium w-32">{hr.hrName}</span>
                        <span className="text-muted-foreground text-xs">
                          {hr.count} candidate{hr.count !== 1 ? 's' : ''} ({hr.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                            style={{
                              width: `${hr.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          >
                            {hr.percentage > 5 && (
                              <span className="text-xs font-semibold text-white">
                                {hr.percentage.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          {hr.percentage <= 5 && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-700">
                              {hr.percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recruitment Funnel */}
          <Card id="recruitment-funnel-start">
            <CardHeader>
              <CardTitle className="text-base">Recruitment Funnel</CardTitle>
              <CardDescription>Candidate distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recruitmentFunnelData.map((item, index) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium w-32">{item.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {item.count} candidates ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        >
                          {item.percentage > 5 && (
                            <span className="text-xs font-semibold text-white">
                              {item.percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                        {item.percentage <= 5 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-700">
                            {item.percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Calls by HR */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Calls by HR</CardTitle>
              <CardDescription>Number of calls made today by each HR</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={todaysCallsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#8884d8" name="Calls Today" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* HR Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">HR Performance Comparison</CardTitle>
              <CardDescription>Candidates contacted vs finalized per HR</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hrPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="contacted" fill="#8884d8" name="Contacted" />
                  <Bar dataKey="finalized" fill="#82ca9d" name="Finalized" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Location-Based Hiring */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location-Based Hiring Distribution</CardTitle>
              <CardDescription>Hires by city/region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hires" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Activity Log */}
        <div className="md:col-span-1">
          <Card className="sticky top-0 flex flex-col" style={{ height: 'calc(300px + 300px + 200px + 16px)', top: '0' }}>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity Log</CardTitle>
              <CardDescription>Last 10 recruitment activities</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="relative h-full overflow-hidden">
                <div 
                  className="absolute w-full"
                  style={{
                    animation: 'scrollActivity 30s linear infinite',
                  }}
                >
                  {/* Duplicate data for seamless scrolling */}
                  {[...recentActivityData, ...recentActivityData].map((activity, index) => (
                    <div key={index} className="px-6 py-3 border-b hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium truncate">{activity.hr}</p>
                        </div>
                        <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold mb-1">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.candidate}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.remarks}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid gap-4">
        {/* HR Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">HR Activity Table</CardTitle>
            <CardDescription>Performance metrics for each HR recruiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by HR name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('hrName')}
                    >
                      HR Name {sortConfig?.key === 'hrName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('totalCalls')}
                    >
                      Total Calls {sortConfig?.key === 'totalCalls' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('shortlisted')}
                    >
                      Shortlisted {sortConfig?.key === 'shortlisted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Interviews Scheduled</TableHead>
                    <TableHead>Offers Sent</TableHead>
                    <TableHead>Hires Closed</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('conversionRate')}
                    >
                      Conversion % {sortConfig?.key === 'conversionRate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Avg. Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHRActivity.map((hr, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{hr.hrName}</TableCell>
                      <TableCell>{hr.totalCalls}</TableCell>
                      <TableCell>{hr.shortlisted}</TableCell>
                      <TableCell>{hr.interviewsScheduled}</TableCell>
                      <TableCell>{hr.offersSent}</TableCell>
                      <TableCell>{hr.hiresClosed}</TableCell>
                      <TableCell>{hr.conversionRate}%</TableCell>
                      <TableCell>{hr.avgResponseTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

