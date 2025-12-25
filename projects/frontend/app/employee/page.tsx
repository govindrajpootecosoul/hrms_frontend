'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { mockData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Play,
  Square,
  CalendarCheck,
  ClipboardList,
  Megaphone,
  Laptop,
  CheckCircle2,
  BookOpen,
  HeartPulse,
  PartyPopper,
} from 'lucide-react';

const WORKDAY_TARGET_MINUTES = 8 * 60;

type TimeState = {
  date: string;
  status: 'checked-in' | 'checked-out';
  checkInTime: string | null;
  totalMinutes: number;
  history: Array<{ action: string; time: string; meta?: string }>;
};

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadInitialState = (): TimeState => {
  if (typeof window === 'undefined') {
    return { date: getTodayKey(), status: 'checked-out', checkInTime: null, totalMinutes: 0, history: [] };
  }
  const stored = window.localStorage.getItem('employee-time-state');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as TimeState;
      if (parsed.date !== getTodayKey()) {
        return { date: getTodayKey(), status: 'checked-out', checkInTime: null, totalMinutes: 0, history: [] };
      }
      return parsed;
    } catch {
      return { date: getTodayKey(), status: 'checked-out', checkInTime: null, totalMinutes: 0, history: [] };
    }
  }
  return { date: getTodayKey(), status: 'checked-out', checkInTime: null, totalMinutes: 0, history: [] };
};

const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function EmployeeHomePage() {
  const { user } = useAuth();
  const [timeState, setTimeState] = useState<TimeState>(() => loadInitialState());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('employee-time-state', JSON.stringify(timeState));
    }
  }, [timeState]);

  const workedMinutes = useMemo(() => {
    let minutes = timeState.totalMinutes;
    if (timeState.status === 'checked-in' && timeState.checkInTime) {
      minutes += (now.getTime() - new Date(timeState.checkInTime).getTime()) / 60000;
    }
    return minutes;
  }, [timeState, now]);

  const attendanceTrend = mockData.employeePortal.attendanceLast7Days;
  const announcements = mockData.employeePortal.announcements;
  const tasks = mockData.employeePortal.tasks;
  const quickStats = mockData.employeePortal.quickStats;
  const assets = mockData.employeePortal.assets;
  const requestHistory = mockData.employeePortal.recentRequests;
  const learningJourneys = mockData.employeePortal.learningJourneys;
  const kudos = mockData.employeePortal.kudos;
  const communityHighlights = mockData.employeePortal.communityHighlights;

  const employeeProfile = useMemo(() => {
    if (!user?.employeeId) return null;
    return mockData.employees.find(emp => emp.employeeId === user.employeeId) ?? null;
  }, [user]);

  const greeting = useMemo(() => {
    const hours = now.getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  const handleToggleCheck = () => {
    const timestamp = new Date().toISOString();
    if (timeState.status === 'checked-out') {
      setTimeState(prev => ({
        date: getTodayKey(),
        status: 'checked-in',
        checkInTime: timestamp,
        totalMinutes: prev.date === getTodayKey() ? prev.totalMinutes : 0,
        history: [{ action: 'Checked in', time: timestamp }, ...prev.history].slice(0, 6),
      }));
    } else {
      if (!timeState.checkInTime) return;
      const sessionMinutes = Math.max(
        0,
        (new Date(timestamp).getTime() - new Date(timeState.checkInTime).getTime()) / 60000
      );
      const sessionHours = sessionMinutes / 60;
      setTimeState(prev => ({
        ...prev,
        status: 'checked-out',
        checkInTime: null,
        totalMinutes: prev.totalMinutes + sessionMinutes,
        history: [
          { action: 'Checked out', time: timestamp, meta: `${sessionHours.toFixed(1)} hrs logged` },
          ...prev.history,
        ].slice(0, 6),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-sky-500/20 via-indigo-500/20 to-purple-500/20 shadow-lg shadow-sky-900/10">
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%)' }} />
          <CardHeader className="relative text-slate-900">
            <CardDescription>{greeting}, {user?.name}</CardDescription>
            <CardTitle className="flex flex-wrap items-center gap-2 text-2xl">
              {employeeProfile?.jobTitle || 'Team Member'}
              <Badge className="bg-white/80 text-slate-900 hover:bg-white">
                {employeeProfile?.department}
              </Badge>
            </CardTitle>
            <p className="text-sm text-slate-600">Keep your day in sync with self check-in</p>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex-1">
                <p className="text-sm text-slate-600">Today's logged hours</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-slate-900">{formatDuration(workedMinutes)}</span>
                  <span className="text-xs text-slate-600">Target 8h</span>
                </div>
                <Progress value={Math.min(100, (workedMinutes / WORKDAY_TARGET_MINUTES) * 100)} className="mt-3 h-2 bg-white/40" />
                <p className="mt-1 text-xs text-slate-600">
                  {timeState.status === 'checked-in' && timeState.checkInTime
                    ? `Checked in at ${formatTime(timeState.checkInTime)}`
                    : 'Not checked in yet'}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={handleToggleCheck}
                  className={timeState.status === 'checked-in' ? 'bg-rose-500 hover:bg-rose-600' : ''}
                >
                  {timeState.status === 'checked-in' ? (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      Check out
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Check in
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Log manual entry
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: 'Available leaves', value: `${quickStats.leaveBalance} days`, icon: CalendarCheck },
                { label: 'Next shift', value: quickStats.upcomingShift, icon: Clock },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/90 p-3 shadow-sm"
                  >
                    <div className="rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-inner shadow-blue-200/60">
          <CardHeader>
            <CardTitle className="text-slate-900">My Snapshot</CardTitle>
            <CardDescription>Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl bg-white/80 p-3 shadow-sm">
              <p className="text-xs text-slate-500">Pending requests</p>
              <p className="text-2xl font-semibold text-slate-900">{quickStats.pendingRequests}</p>
              <p className="text-xs text-slate-500">Awaiting approvals</p>
            </div>
            <div className="rounded-xl bg-white/80 p-3 shadow-sm">
              <p className="text-xs text-slate-500">Last payout</p>
              <p className="text-lg font-semibold text-slate-900">{quickStats.lastPayout}</p>
              <p className="text-xs text-slate-500">View payslip in requests</p>
            </div>
            <div className="rounded-xl bg-white/80 p-3 space-y-2 shadow-sm">
              <p className="text-xs font-semibold text-slate-600">Action items</p>
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between border-b border-dashed border-slate-200/60 py-1 text-sm last:border-b-0">
                  <span>{task.label}</span>
                  <Badge variant={task.status === 'done' ? 'outline' : 'secondary'} className="text-[10px]">
                    {task.due}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-none bg-gradient-to-br from-amber-50 to-orange-100/60 shadow-lg shadow-amber-100/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-amber-900">Learning lane</CardTitle>
              <CardDescription>Grow along your curated tracks</CardDescription>
            </div>
            <BookOpen className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            {learningJourneys.map((journey) => (
              <div key={journey.id} className="rounded-lg bg-white/80 p-3 shadow-sm">
                <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                  <span>{journey.title}</span>
                  <Badge variant="outline" className="border-amber-200 text-amber-700">{journey.badge}</Badge>
                </div>
                <p className="text-xs text-amber-700/80">Due {journey.due}</p>
                <Progress value={journey.progress} className="mt-2 h-2" />
                <p className="mt-1 text-xs text-amber-700/80">{journey.progress}% complete</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Explore learning studio
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 shadow-lg shadow-rose-100/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-rose-900">Wellbeing & focus</CardTitle>
              <CardDescription>Micro habits to stay energised</CardDescription>
            </div>
            <HeartPulse className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border bg-rose-50 p-3 text-sm text-rose-700">
              <p className="text-xs uppercase tracking-wide text-rose-500">Mood log</p>
              <p className="text-lg font-semibold">Grounded & productive</p>
              <p className="text-xs text-rose-600/80">Last updated 9:10 AM • Remember to stretch every hour.</p>
            </div>
            <div className="grid gap-2 text-sm">
              {['Hydration break', '10-min walk', 'Breathwork session'].map((habit) => (
                <div key={habit} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span>{habit}</span>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full text-primary">
              View wellbeing playlist
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-indigo-50 to-blue-100/60 shadow-lg shadow-indigo-100/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-indigo-900">Kudos spotlight</CardTitle>
              <CardDescription>Cheers from your teammates</CardDescription>
            </div>
            <PartyPopper className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            {kudos.map((note) => (
              <div key={note.id} className="rounded-lg bg-white/80 p-3 shadow-sm">
                <p className="text-sm font-semibold">{note.from}</p>
                <p className="text-xs text-muted-foreground">{note.date}</p>
                <p className="mt-2 text-sm">{note.message}</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              Send gratitude
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-none bg-white shadow-lg shadow-slate-200/40">
          <CardHeader>
            <CardTitle>Attendance pulse</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendanceTrend.map((day) => (
              <div key={day.day} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-12 justify-center">
                    {day.day}
                  </Badge>
                  <span>{day.status}</span>
                </div>
                <span className="font-medium">{day.hours ? `${day.hours} hrs` : '-'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Company wide updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>{announcement.date}</span>
                  <span>•</span>
                  <span className="capitalize">{announcement.type}</span>
                </div>
                <p className="mt-1 font-semibold">{announcement.title}</p>
                <p className="text-xs text-muted-foreground">{announcement.audience}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-none bg-gradient-to-br from-indigo-50 to-blue-100/60 shadow-inner shadow-blue-200/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My requests</CardTitle>
              <CardDescription>Latest submissions</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              New request
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {requestHistory.map((request) => (
              <div key={request.id} className="rounded-lg bg-white/85 p-3 text-sm shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{request.id}</span>
                  <Badge className="bg-indigo-50 text-indigo-700">{request.status}</Badge>
                </div>
                <p className="mt-1 text-slate-600">{request.details}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{request.type}</span>
                  <span>Submitted {request.submitted}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-inner shadow-emerald-100/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assigned assets</CardTitle>
              <CardDescription>Physical & digital assets</CardDescription>
            </div>
            <Button size="sm" variant="ghost">
              <Laptop className="mr-2 h-4 w-4" />
              Report issue
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.tag} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white/80 p-3 text-sm">
                <div>
                  <p className="font-semibold">{asset.name}</p>
                  <p className="text-xs text-emerald-700/70">{asset.tag}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700" variant="outline">
                  {asset.status}
                </Badge>
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-emerald-200 bg-white/75 p-3 text-sm text-emerald-700">
              Need something else? Raise a hardware or access request.
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Community highlights</CardTitle>
            <CardDescription>Internal events & micro-experiences</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            RSVP
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {communityHighlights.map((highlight) => (
            <div key={highlight.id} className="rounded-lg border bg-white p-3">
              <p className="text-sm font-semibold">{highlight.title}</p>
              <p className="text-xs text-muted-foreground">{highlight.time}</p>
              <p className="text-xs text-muted-foreground">Location: {highlight.location}</p>
              <Button variant="ghost" size="sm" className="mt-2 text-primary">
                View details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-slate-900/5 to-slate-900/0">
        <CardHeader>
          <CardTitle>Check-in history</CardTitle>
          <CardDescription>Recent actions for today</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            {timeState.history.length === 0 && (
              <p className="text-sm text-muted-foreground">No actions captured today yet.</p>
            )}
            {timeState.history.map((entry, index) => (
              <div key={`${entry.time}-${index}`} className="rounded-lg border border-slate-200/70 bg-white/90 p-3 text-sm shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{entry.action}</span>
                </div>
                <p className="text-xs text-muted-foreground">{formatTime(entry.time)}</p>
                {entry.meta && <p className="text-xs text-slate-500">{entry.meta}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-800">Work tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Remember to pause the timer for extended breaks.</li>
              <li>Use manual entry for offsite meetings or travel.</li>
              <li>Once you check out, hours automatically sync to HR.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

