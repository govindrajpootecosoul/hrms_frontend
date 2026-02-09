'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Clock, Calendar, Cake, Plus, BarChart3, FileText, Sparkles } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LineChart from '@/components/charts/LineChart';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';

const Dashboard = () => {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId;

  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    message: '',
    priority: 'Normal',
    sendEmail: false,
    sendPush: false,
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Load mock data
    const loadData = async () => {
      try {
        const apiModule = await import('../../../../../../projects/frontend/lib/api');
        const data = apiModule.mockData;
        setDashboardData(data.dashboard);
        setStats(data.dashboard.stats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to minimal data
        setDashboardData({
          stats: { totalEmployees: 142, activeEmployees: 138, todayAttendance: 135, pendingLeaves: 7, upcomingBirthdays: 12 },
          monthlyHeadcounts: [],
          recentActivities: [],
          upcomingEvents: [],
          upcomingLeavesAndFestivals: [],
          birthdayCalendar: [],
          workAnniversaryCalendar: [],
        });
        setStats({ totalEmployees: 142, activeEmployees: 138, todayAttendance: 135, pendingLeaves: 7, upcomingBirthdays: 12 });
      }
    };
    loadData();
  }, []);

  if (!dashboardData || !stats) {
    return <div className="p-6">Loading...</div>;
  }

  // KPI Cards data
  const kpiCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      active: stats.activeEmployees,
      inactive: stats.totalEmployees - stats.activeEmployees,
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
      shadow: 'shadow-blue-500/30',
      icon: Users,
      clickable: true,
      onClick: () => router.push(`/hrms/${companyId}/employees`),
    },
    {
      title: 'Today Attendance',
      value: stats.todayAttendance,
      gradient: 'from-purple-600 via-violet-600 to-purple-700',
      shadow: 'shadow-purple-500/30',
      icon: Clock,
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      gradient: 'from-orange-600 via-amber-600 to-orange-700',
      shadow: 'shadow-orange-500/30',
      icon: Calendar,
      clickable: true,
      onClick: () => router.push(`/hrms/${companyId}/leaves`),
    },
    {
      title: 'Upcoming Birthdays',
      value: stats.upcomingBirthdays,
      gradient: 'from-pink-600 via-rose-600 to-pink-700',
      shadow: 'shadow-pink-500/30',
      icon: Cake,
    },
  ];

  // Quick Actions
  const handleAddEmployee = () => {
    router.push(`/hrms/${companyId}/employees`);
  };

  const handleApproveLeaves = () => {
    router.push(`/hrms/${companyId}/leaves`);
  };

  const handleRunReports = () => {
    router.push(`/hrms/${companyId}/reports`);
  };

  const handleBroadcastUpdate = () => {
    setShowBroadcastDialog(true);
  };

  const handleSendBroadcast = () => {
    console.log('Sending broadcast:', broadcastData);
    setShowBroadcastDialog(false);
    setBroadcastData({
      subject: '',
      message: '',
      priority: 'Normal',
      sendEmail: false,
      sendPush: false,
    });
  };

  // Format monthly headcounts for chart
  const monthlyHeadcountsData = dashboardData.monthlyHeadcounts.map(item => item.headcount);
  const monthlyHeadcountsCategories = dashboardData.monthlyHeadcounts.map(item => item.month);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to HRMS Portal</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${kpi.clickable ? 'cursor-pointer' : ''}`}
              onClick={kpi.clickable && kpi.onClick ? kpi.onClick : undefined}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-100`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              <div className="relative z-10 p-4 lg:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm flex-shrink-0 shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-white/90 mb-2 uppercase tracking-wide truncate">
                      {kpi.title}
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                      {kpi.value}
                    </h3>
                    {kpi.active !== undefined && kpi.inactive !== undefined && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-white/90">
                          Active: {kpi.active}
                        </span>
                        <span className="text-xs text-white/70">
                          Inactive: {kpi.inactive}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-2 p-6">
        <h2 className="text-base font-semibold mb-1">Quick Actions</h2>
        <p className="text-xs text-slate-600 mb-4">Jump into frequent HR workflows</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border-2 border-neutral-200 p-5 flex items-start justify-between gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <div>
              <h3 className="text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors">Add Employee</h3>
              <p className="text-xs text-slate-600">Onboard a new team member</p>
            </div>
            <Button
              size="sm"
              onClick={handleAddEmployee}
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<Plus className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>

          <div className="rounded-xl border-2 border-neutral-200 p-5 flex items-start justify-between gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <div>
              <h3 className="text-sm font-semibold mb-1 group-hover:text-purple-600 transition-colors">Approve Leaves</h3>
              <p className="text-xs text-slate-600">Review pending leave requests</p>
            </div>
            <Button
              size="sm"
              onClick={handleApproveLeaves}
              className="bg-purple-600 text-white hover:bg-purple-700"
              icon={<Calendar className="w-4 h-4" />}
            >
              View
            </Button>
          </div>

          <div className="rounded-xl border-2 border-neutral-200 p-5 flex items-start justify-between gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <div>
              <h3 className="text-sm font-semibold mb-1 group-hover:text-green-600 transition-colors">Run Reports</h3>
              <p className="text-xs text-slate-600">View workforce analytics</p>
            </div>
            <Button
              size="sm"
              onClick={handleRunReports}
              className="bg-green-600 text-white hover:bg-green-700"
              icon={<BarChart3 className="w-4 h-4" />}
            >
              Open
            </Button>
          </div>

          <div className="rounded-xl border-2 border-neutral-200 p-5 flex items-start justify-between gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <div>
              <h3 className="text-sm font-semibold mb-1 group-hover:text-orange-600 transition-colors">Broadcast Update</h3>
              <p className="text-xs text-slate-600">Send HR announcement</p>
            </div>
            <Button
              size="sm"
              onClick={handleBroadcastUpdate}
              className="bg-orange-600 text-white hover:bg-orange-700"
              icon={<FileText className="w-4 h-4" />}
            >
              Compose
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - 9 cols */}
        <div className="lg:col-span-9 space-y-6">
          {/* Employee Insights Chart */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Employee Insights</h2>
            <p className="text-xs text-slate-600 mb-4">Monthly headcount trend</p>
            <LineChart
              data={monthlyHeadcountsData}
              categories={monthlyHeadcountsCategories}
              seriesName="Headcount"
              height={300}
              colors={['#6366f1']}
              fillArea
              title=""
              subtitle=""
            />
          </Card>

          {/* Birthday Calendar & Work Anniversary */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Birthday Calendar & Work Anniversary</h2>
            <p className="text-xs text-slate-600 mb-4">This month birthdays and work anniversaries</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {dashboardData.birthdayCalendar.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Cake className="w-5 h-5 text-pink-800" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-slate-600">{item.department}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-pink-100 text-pink-800 border border-pink-200 px-2 py-1 rounded-full">Birthday</span>
                </div>
              ))}
              {dashboardData.workAnniversaryCalendar.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-800" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-slate-600">{item.department} • {item.years} years</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-full">Anniversary</span>
                </div>
              ))}
            </div>
          </Card>

          {/* People Pulse */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">People Pulse</h2>
            <p className="text-xs text-slate-600 mb-4">Latest movements across the organization</p>
            <div className="space-y-3">
              {dashboardData.recentActivities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                        {activity.type}
                      </span>
                      <span className="text-xs text-slate-600">{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upcoming Leaves & Festivals */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Upcoming Leaves & Festivals</h2>
            <p className="text-xs text-slate-600 mb-4">Upcoming events and holidays</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {dashboardData.upcomingLeavesAndFestivals.slice(0, 8).map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{item.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.type === 'Festival' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-slate-600">{item.reason} • {item.department}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Talent Pipeline & Events */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Talent Pipeline & Events</h2>
            <p className="text-xs text-slate-600 mb-4">Next 5 interviews, trainings or workshops</p>
            <div className="space-y-3">
              {dashboardData.upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                      {event.type}
                    </span>
                    <span className="text-xs text-slate-600">{event.date}</span>
                  </div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-slate-600">{event.time}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance & Reminders */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Compliance & Reminders</h2>
            <p className="text-xs text-slate-600 mb-4">Track critical HR obligations</p>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border-2 border-red-200 bg-red-50/70 hover:shadow-md transition-all duration-200">
                <p className="text-sm font-medium mb-1">Tax Filing Due</p>
                <p className="text-xs text-slate-600">Due in 5 days</p>
              </div>
              <div className="p-3 rounded-lg border-2 border-amber-200 bg-amber-50/70 hover:shadow-md transition-all duration-200">
                <p className="text-sm font-medium mb-1">Payroll Processing</p>
                <p className="text-xs text-slate-600">Due in 3 days</p>
              </div>
              <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50/70 hover:shadow-md transition-all duration-200">
                <p className="text-sm font-medium mb-1">Quarterly Review</p>
                <p className="text-xs text-slate-600">Due in 10 days</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Broadcast Dialog */}
      <Modal
        isOpen={showBroadcastDialog}
        onClose={() => setShowBroadcastDialog(false)}
        title="Broadcast Update"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-slate-600">
              Recipients: {stats.totalEmployees} employees
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBroadcastDialog(false)}
                className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendBroadcast}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Send Broadcast
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input
              value={broadcastData.subject}
              onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
              placeholder="Enter subject"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={broadcastData.message}
              onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
              placeholder="Enter message"
              rows={5}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <select
              value={broadcastData.priority}
              onChange={(e) => setBroadcastData({ ...broadcastData, priority: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:border-primary-300 focus:ring-primary-200 transition-all duration-200"
            >
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Info">Info</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={broadcastData.sendEmail}
                onChange={(e) => setBroadcastData({ ...broadcastData, sendEmail: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Send email notification</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={broadcastData.sendPush}
                onChange={(e) => setBroadcastData({ ...broadcastData, sendPush: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Send in-app push</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
