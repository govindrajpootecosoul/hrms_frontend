'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/hrms-1/ui/card';
import { Button } from '@/components/hrms-1/ui/button';
import { Badge } from '@/components/hrms-1/ui/badge';
import { Input } from '@/components/hrms-1/ui/input';
import { Textarea } from '@/components/hrms-1/ui/textarea';
import { Label } from '@/components/hrms-1/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/hrms-1/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/hrms-1/ui/select';
import {
  Users,
  Calendar,
  Cake,
  Clock,
  TrendingUp,
  Award,
  Plus,
  ClipboardCheck,
  FileSpreadsheet,
  Megaphone,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { apiCall, mockData } from '@/lib/hrms-1/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/hrms-1/utils';


export default function DashboardPage() {
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [monthlyHeadcounts, setMonthlyHeadcounts] = useState([]);
  const [upcomingLeavesAndFestivals, setUpcomingLeavesAndFestivals] = useState([]);
  const [birthdayCalendar, setBirthdayCalendar] = useState([]);
  const [workAnniversaryCalendar, setWorkAnniversaryCalendar] = useState([]);
  const [combinedCalendar, setCombinedCalendar] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    sendEmail: true,
    sendPush: true,
  });
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Use mock data directly - bypass backend
    try {
      // Ensure mockData is available
      if (!mockData || !mockData.dashboard) {
        console.error('Mock data not available');
        return;
      }

      // Set stats
      setStats(mockData.dashboard.stats);
      
      // Set monthly headcounts
      setMonthlyHeadcounts(mockData.dashboard.monthlyHeadcounts || []);
      
      // Set upcoming leaves and festivals
      setUpcomingLeavesAndFestivals(mockData.dashboard.upcomingLeavesAndFestivals || []);
      
      // Set birthday calendar
      const birthdays = mockData.dashboard.birthdayCalendar || [];
      setBirthdayCalendar(birthdays);
      
      // Set work anniversary calendar
      const anniversaries = mockData.dashboard.workAnniversaryCalendar || [];
      setWorkAnniversaryCalendar(anniversaries);
      setRecentActivities(mockData.dashboard.recentActivities || []);
      setUpcomingEvents(mockData.dashboard.upcomingEvents || []);
      
      // Combine and sort by date
      const combined = [
        ...birthdays.map((item: any) => ({ ...item, type: 'Birthday', icon: Cake })),
        ...anniversaries.map((item: any) => ({ ...item, type: 'Work Anniversary', icon: Award })),
      ].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
      setCombinedCalendar(combined);

      console.log('Dashboard data loaded:', {
        stats: mockData.dashboard.stats,
        monthlyHeadcounts: mockData.dashboard.monthlyHeadcounts?.length,
        upcomingLeavesAndFestivals: mockData.dashboard.upcomingLeavesAndFestivals?.length,
        birthdayCalendar: birthdays.length,
        workAnniversaryCalendar: anniversaries.length,
        combinedCalendar: combined.length,
        recentActivities: mockData.dashboard.recentActivities?.length,
        upcomingEvents: mockData.dashboard.upcomingEvents?.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleKPIClick = (title: string) => {
    if (title === 'Total Employees') {
      // Navigate to reports page
      router.push('/reports');
    } else if (title === 'Pending Leaves') {
      // Navigate to Leave Management > Leave Manage tab
      router.push('/attendance/leave?tab=manage');
    }
    // Today Attendance and Upcoming Birthdays don't have navigation
  };

  const kpiCards = [
    { 
      title: 'Total Employees', 
      value: stats?.totalEmployees || 0, 
      icon: Users, 
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      textColor: 'text-white',
      titleColor: 'text-white/90',
      shadow: 'shadow-blue-500/30',
      showBifurcation: true,
      activeCount: stats?.activeEmployees || 0,
      activeColor: 'text-cyan-200',
      inactiveColor: 'text-white/70',
      clickable: true,
    },
    { 
      title: 'Today\'s Attendance', 
      value: stats?.todayAttendance || 0, 
      icon: Clock, 
      gradient: 'from-purple-600 via-violet-600 to-purple-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      textColor: 'text-white',
      titleColor: 'text-white/90',
      shadow: 'shadow-purple-500/30',
      clickable: false,
    },
    { 
      title: 'Pending Leaves', 
      value: stats?.pendingLeaves || 0, 
      icon: Calendar, 
      gradient: 'from-orange-600 via-red-500 to-orange-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      textColor: 'text-white',
      titleColor: 'text-white/90',
      shadow: 'shadow-orange-500/30',
      clickable: true,
    },
    { 
      title: 'Upcoming Birthdays', 
      value: stats?.upcomingBirthdays || 0, 
      icon: Cake, 
      gradient: 'from-red-600 via-pink-600 to-red-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      textColor: 'text-white',
      titleColor: 'text-white/90',
      shadow: 'shadow-red-500/30',
      clickable: false,
    },
  ];

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Onboard a new team member',
      icon: Plus,
      buttonText: '+ Add',
      action: () => router.push('/employees?view=add'),
    },
    {
      title: 'Approve Leaves',
      description: 'Review pending leave requests',
      icon: ClipboardCheck,
      buttonText: 'View',
      action: () => router.push('/attendance/leave?tab=manage'),
    },
    {
      title: 'Run Reports',
      description: 'View workforce analytics',
      icon: FileSpreadsheet,
      buttonText: 'Open',
      action: () => router.push('/reports'),
    },
    {
      title: 'Broadcast Update',
      description: 'Send HR announcement',
      icon: Megaphone,
      buttonText: 'Compose',
      type: 'broadcast',
    },
  ];

  const policyReminders = [
    {
      title: 'PF Compliance Filing',
      dueDate: 'Due in 5 days',
      owner: 'Payroll Ops',
      severity: 'high',
    },
    {
      title: 'Quarterly Engagement Survey',
      dueDate: 'Opens Monday',
      owner: 'People Success',
      severity: 'medium',
    },
    {
      title: 'Update Travel Allowance Slabs',
      dueDate: 'Pending approval',
      owner: 'Finance',
      severity: 'low',
    },
  ];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              onClick={() => kpi.clickable && handleKPIClick(kpi.title)}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                kpi.clickable ? 'cursor-pointer active:scale-[0.98]' : ''
              }`}
              title={kpi.clickable ? `Click to view ${kpi.title === 'Total Employees' ? 'employee reports' : 'pending leaves'}` : undefined}
            >
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-100`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 p-5 lg:p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Icon */}
                  <div className={`${kpi.iconBg} p-3 rounded-lg backdrop-blur-sm flex-shrink-0 shadow-lg`}>
                    <Icon className={`h-6 w-6 ${kpi.iconColor}`} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-bold ${kpi.titleColor} mb-2 uppercase tracking-wider truncate`}>
                      {kpi.title}
                    </p>
                    <div className="flex flex-col gap-1">
                      <h3 className={`text-3xl lg:text-4xl font-bold ${kpi.textColor} leading-tight drop-shadow-md`}>
                        {kpi.value}
                      </h3>
                      {kpi.showBifurcation && (
                        <div className="flex items-center gap-2 text-[10px] mt-2 pt-2 border-t border-white/20">
                          <span className={`${kpi.activeColor} font-semibold`}>
                            Active {kpi.activeCount}
                          </span>
                          <span className="text-white/50">•</span>
                          <span className={`${kpi.inactiveColor} font-medium`}>
                            Inactive {kpi.value - kpi.activeCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative glow effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-dashed border-slate-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
          <CardDescription className="text-sm text-slate-600">Jump into frequent HR workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <div
                  key={action.title}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                  onClick={() => {
                    if (action.type === 'broadcast') {
                      setBroadcastStatus(null);
                      setIsBroadcastOpen(true);
                    } else {
                      action.action?.();
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight text-slate-900 mb-1">{action.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 text-xs px-3 py-1.5 h-auto border-slate-300 hover:bg-slate-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (action.type === 'broadcast') {
                          setBroadcastStatus(null);
                          setIsBroadcastOpen(true);
                        } else {
                          action.action?.();
                        }
                      }}
                    >
                      {action.buttonText}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left Column - Charts and Cards */}
        <div className="lg:col-span-9 space-y-4">
          {/* Employee Insights */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Employee Insights</CardTitle>
              <CardDescription className="text-xs">Monthly headcount trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyHeadcounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="headcount" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Birthday Calendar & Work Anniversary */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Birthday Calendar & Work Anniversary</CardTitle>
              <CardDescription className="text-xs">This month for birthday and work anniversaries</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {combinedCalendar.slice(0, 10).map((item: any, index: number) => {
                  const Icon = item.icon || Cake;
                  const isBirthday = item.type === 'Birthday';
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="p-4 border-b border-border/50 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-1.5 rounded-lg ${
                            isBirthday 
                              ? 'bg-pink-100 text-pink-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.department}</p>
                            {!isBirthday && item.years && (
                              <p className="text-xs text-primary font-semibold mt-0.5">
                                {item.years} {item.years === 1 ? 'year' : 'years'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* People Pulse */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">People Pulse</CardTitle>
              <CardDescription className="text-xs">Latest announcements across the organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.slice(0, 6).map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-lg border px-3 py-2 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {item.type}
                    </Badge>
                    <span>
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-tight mt-1">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upcoming Leaves and Festivals */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming Leaves & Festivals</CardTitle>
              <CardDescription className="text-xs">Upcoming leaves and holidays</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[800px] overflow-y-auto">
                {upcomingLeavesAndFestivals.slice(0, 10).map((item: any, index: number) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="p-4 border-b border-border/50 last:border-b-0"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant={item.type === 'Festival' ? 'default' : 'secondary'}
                          className={`text-[10px] px-1.5 py-0 ${
                            item.type === 'Festival' 
                              ? 'bg-purple-500 hover:bg-purple-600' 
                              : 'bg-orange-500 hover:bg-orange-600'
                          }`}
                        >
                          {item.type === 'Festival' ? '🎉 Festival' : '📅 Leave'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.reason}
                        </p>
                        {item.department && item.department !== 'All' && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {item.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Broadcast dialog */}
      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send company-wide update</DialogTitle>
            <DialogDescription>
              Share urgent information, policy changes or celebrations with all employees.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="broadcast-title">Subject</Label>
              <Input
                id="broadcast-title"
                placeholder="e.g. FY25 Kickoff Townhall"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="broadcast-message">Message</Label>
              <Textarea
                id="broadcast-message"
                placeholder="Share the update, logistics or key talking points..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))}
                rows={5}
              />
              <p className="text-xs text-muted-foreground text-right">
                Delivered to {stats?.totalEmployees || 0} employees
              </p>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={broadcastForm.priority}
                onValueChange={(value) => setBroadcastForm((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High / Urgent</SelectItem>
                  <SelectItem value="info">Informational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Send email notification</p>
                  <p className="text-xs text-muted-foreground">Delivers to official inbox</p>
                </div>
                <ToggleSwitch
                  checked={broadcastForm.sendEmail}
                  onChange={(checked) => setBroadcastForm((prev) => ({ ...prev, sendEmail: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Send in-app push</p>
                  <p className="text-xs text-muted-foreground">Shows in notifications center</p>
                </div>
                <ToggleSwitch
                  checked={broadcastForm.sendPush}
                  onChange={(checked) => setBroadcastForm((prev) => ({ ...prev, sendPush: checked }))}
                />
              </div>
            </div>

            {broadcastStatus && (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm text-primary">
                {broadcastStatus}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsBroadcastOpen(false)}
              disabled={broadcastLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!broadcastForm.title || !broadcastForm.message) {
                  setBroadcastStatus('Please add both a subject and message before sending.');
                  return;
                }
                setBroadcastLoading(true);
                setTimeout(() => {
                  setBroadcastLoading(false);
                  setBroadcastStatus('Broadcast scheduled – employees will be notified shortly.');
                  setBroadcastForm({
                    title: '',
                    message: '',
                    priority: 'normal',
                    sendEmail: true,
                    sendPush: true,
                  });
                }, 1200);
              }}
              disabled={broadcastLoading}
            >
              {broadcastLoading ? 'Sending...' : 'Send notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Talent Pipeline & Compliance */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Talent Pipeline & Events</CardTitle>
            <CardDescription className="text-xs">New hires, interviews, trainings, or workshops</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event: any) => (
              <div key={event.id} className="rounded-lg border px-3 py-2">
                <p className="font-semibold text-sm">{event.title}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{event.type}</span>
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Compliance & Reminders</CardTitle>
            <CardDescription className="text-xs">Track critical HR obligations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {policyReminders.map((reminder) => (
              <div key={reminder.title} className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{reminder.title}</p>
                  <Badge
                    variant={reminder.severity === 'high' ? 'destructive' : reminder.severity === 'medium' ? 'secondary' : 'outline'}
                    className={cn(
                      "text-[10px]",
                      reminder.severity === 'high' && 'bg-red-500 hover:bg-red-600',
                      reminder.severity === 'medium' && 'bg-orange-500 hover:bg-orange-600',
                      reminder.severity === 'low' && 'bg-blue-500 hover:bg-blue-600'
                    )}
                  >
                    {reminder.severity === 'high'
                      ? 'High'
                      : reminder.severity === 'medium'
                        ? 'Medium'
                        : 'Low'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{reminder.dueDate}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Owner: {reminder.owner}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
