'use client';

import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/lib/auth';
import { mockData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Send, Clock4 } from 'lucide-react';
import { eachDayOfInterval, endOfMonth, format, getDaysInMonth, isWeekend, startOfMonth, subMonths } from 'date-fns';

type AttendanceStatus = 'present' | 'absent' | 'wfh' | 'weekend';

type CalendarPattern = {
  absent?: number[];
  wfh?: number[];
};

type CalendarData = {
  month: Date;
  key: string;
  modifiers: Record<AttendanceStatus, Date[]>;
};

type RequestTab = 'time-off' | 'regularization' | 'on-duty';

const legendMeta: Array<{ key: AttendanceStatus; label: string; dot: string }> = [
  { key: 'present', label: 'Present', dot: 'bg-emerald-500' },
  { key: 'absent', label: 'Absent', dot: 'bg-rose-500' },
  { key: 'wfh', label: 'Work From Home', dot: 'bg-sky-500' },
  { key: 'weekend', label: 'Weekend', dot: 'bg-slate-300' },
];

const modifierPalette: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.25)]',
  absent: 'bg-rose-50 text-rose-700 border border-rose-200 shadow-[0_1px_2px_rgba(244,63,94,0.25)]',
  wfh: 'bg-sky-50 text-sky-700 border border-sky-200 shadow-[0_1px_2px_rgba(14,165,233,0.25)]',
  weekend: 'text-slate-400',
};

const monthPatterns: Record<string, CalendarPattern> = {
  '2025-01': { absent: [3, 9, 22], wfh: [6, 13, 27] },
  '2024-12': { absent: [4, 11, 18], wfh: [2, 16, 30] },
  '2024-11': { absent: [5, 12, 25], wfh: [8, 19, 28] },
};

const createCalendarData = (monthDate: Date, pattern?: CalendarPattern): CalendarData => {
  const monthKey = format(monthDate, 'yyyy-MM');
  const config = pattern ?? { absent: [4, 12, 20, 26], wfh: [3, 10, 17, 24] };
  const mergedPattern = {
    absent: config.absent ?? [],
    wfh: config.wfh ?? [],
  };
  const modifiers: Record<AttendanceStatus, Date[]> = {
    present: [],
    absent: [],
    wfh: [],
    weekend: [],
  };

  eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) }).forEach((date) => {
    const dayNumber = date.getDate();
    if (mergedPattern.absent.includes(dayNumber)) {
      modifiers.absent.push(date);
      return;
    }
    if (mergedPattern.wfh.includes(dayNumber)) {
      modifiers.wfh.push(date);
      return;
    }
    if (isWeekend(date)) {
      modifiers.weekend.push(date);
      return;
    }
    modifiers.present.push(date);
  });

  return { month: monthDate, key: monthKey, modifiers };
};

const parseMonthValue = (value: string) => {
  const [year, month] = value.split('-').map((segment) => Number(segment));
  return startOfMonth(new Date(year, (month ?? 1) - 1, 1));
};

export default function EmployeeAttendancePage() {
  const { user } = useAuth();
  const attendance = mockData.employeePortal.attendanceLast7Days;
  const [timeframe, setTimeframe] = useState<'7d' | 'month' | 'prev'>('7d');
  const [selectedMonth, setSelectedMonth] = useState(() => format(subMonths(new Date(), 1), 'yyyy-MM'));
  const [requestTab, setRequestTab] = useState<RequestTab>('time-off');
  const currentMonthDate = startOfMonth(new Date());
  const thisMonthKey = format(currentMonthDate, 'yyyy-MM');
  const previousMonthDate = useMemo(() => parseMonthValue(selectedMonth), [selectedMonth]);

  const totalHours = useMemo(() => {
    return attendance.reduce((sum, day) => sum + (day.hours || 0), 0);
  }, [attendance]);

  const thisMonthCalendar = useMemo(() => {
    const pattern = monthPatterns[thisMonthKey] ?? {
      absent: [4, 11, 18, 25].filter((day) => day <= getDaysInMonth(currentMonthDate)),
      wfh: [2, 9, 16, 23].filter((day) => day <= getDaysInMonth(currentMonthDate)),
    };
    return createCalendarData(currentMonthDate, pattern);
  }, [currentMonthDate, thisMonthKey]);

  const previousMonthCalendar = useMemo(() => {
    const key = format(previousMonthDate, 'yyyy-MM');
    const pattern =
      monthPatterns[key] ??
      {
        absent: [5, 12, 19, 26].filter((day) => day <= getDaysInMonth(previousMonthDate)),
        wfh: [3, 10, 17, 24].filter((day) => day <= getDaysInMonth(previousMonthDate)),
      };
    return createCalendarData(previousMonthDate, pattern);
  }, [previousMonthDate]);

  const renderAttendanceRows = () => (
    <div className="space-y-2">
      {attendance.map((day) => (
        <div
          key={day.day}
          className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm"
        >
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="w-12 justify-center">
              {day.day}
            </Badge>
            <span>{day.status}</span>
          </div>
          <span className="font-medium">{day.hours ? `${day.hours} hrs` : '-'}</span>
        </div>
      ))}
    </div>
  );

  const renderCalendarView = (calendarData: CalendarData, hint?: string) => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <p className="text-sm font-medium text-slate-900">{format(calendarData.month, 'MMMM yyyy')}</p>
          {hint && <p>{hint}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {legendMeta.map((legend) => (
            <div key={legend.key} className="flex items-center gap-1.5 whitespace-nowrap font-medium text-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full ${legend.dot}`} />
              <span>{legend.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-lg shadow-slate-200/60">
        <Calendar
          showOutsideDays={false}
          defaultMonth={calendarData.month}
          fromMonth={calendarData.month}
          toMonth={calendarData.month}
          className="mx-auto w-full max-w-sm [&_.rdp-table]:w-full [&_.rdp-day_button]:transition-all"
          classNames={{
            caption_label: 'text-base font-semibold text-slate-900',
            head_cell: 'text-xs font-semibold text-slate-500',
            day: 'h-10 w-10 rounded-xl text-sm font-medium',
          }}
          modifiers={calendarData.modifiers}
          modifiersClassNames={{
            present: modifierPalette.present,
            absent: modifierPalette.absent,
            wfh: modifierPalette.wfh,
            weekend: modifierPalette.weekend,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Attendance center</p>
        <h1 className="text-2xl font-semibold">My time & availability</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg shadow-blue-200/60">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-slate-900">Attendance pulse</CardTitle>
              <CardDescription>Switch between recent metrics</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={timeframe} onValueChange={(val: typeof timeframe) => setTimeframe(val)} className="w-full lg:w-auto">
                <TabsList className="grid grid-cols-3 bg-slate-100">
                  <TabsTrigger value="7d">Past 7 days</TabsTrigger>
                  <TabsTrigger value="month">This month</TabsTrigger>
                  <TabsTrigger value="prev">Previous month</TabsTrigger>
                </TabsList>
              </Tabs>
              {timeframe === 'prev' && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-01">Jan 2025</SelectItem>
                    <SelectItem value="2024-12">Dec 2024</SelectItem>
                    <SelectItem value="2024-11">Nov 2024</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock4 className="h-4 w-4" />
                {totalHours.toFixed(1)} hrs
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={timeframe}>
              <TabsContent value="7d">{renderAttendanceRows()}</TabsContent>
              <TabsContent value="month">{renderCalendarView(thisMonthCalendar)}</TabsContent>
              <TabsContent value="prev">
                <div className="mb-3 flex flex-col gap-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Compare older months</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm font-medium text-slate-700 lg:w-48">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025-01">Jan 2025</SelectItem>
                        <SelectItem value="2024-12">Dec 2024</SelectItem>
                        <SelectItem value="2024-11">Nov 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    Showing data for <span className="font-semibold text-slate-900">{format(previousMonthCalendar.month, 'MMMM yyyy')}</span>
                  </div>
                </div>
                {renderCalendarView(previousMonthCalendar, 'Snapshot of past attendance')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg shadow-emerald-100/60">
          <CardHeader>
            <CardTitle className="text-slate-900">Attendance requests</CardTitle>
            <CardDescription>Manage regularization, on-duty or time-off in one place</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={requestTab} onValueChange={(val) => setRequestTab(val as RequestTab)} className="space-y-4">
              <TabsList className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
                <TabsTrigger value="regularization">Attendance regularization</TabsTrigger>
                <TabsTrigger value="on-duty">On duty request</TabsTrigger>
                <TabsTrigger value="time-off">Request time off</TabsTrigger>
              </TabsList>

              <TabsContent value="regularization" className="space-y-4 rounded-2xl border border-emerald-200/50 bg-white/90 p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="regularization-date">Date to adjust</Label>
                  <Input id="regularization-date" type="date" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regularization-window">Time window</Label>
                  <Input id="regularization-window" type="text" placeholder="e.g. 09:30 AM – 06:30 PM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regularization-notes">Notes</Label>
                  <Textarea id="regularization-notes" rows={4} placeholder="Explain the missing punch or discrepancy" />
                </div>
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send regularization
                </Button>
              </TabsContent>

              <TabsContent value="on-duty" className="space-y-4 rounded-2xl border border-emerald-200/50 bg-white/90 p-4 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="on-duty-date">Duty date</Label>
                  <Input id="on-duty-date" type="date" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="on-duty-location">Location / client</Label>
                  <Input id="on-duty-location" type="text" placeholder="e.g. Client HQ, Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="on-duty-details">Details</Label>
                  <Textarea id="on-duty-details" rows={4} placeholder="Share agenda, travel plan or approvals needed" />
                </div>
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Submit on-duty request
                </Button>
              </TabsContent>

              <TabsContent value="time-off" className="space-y-4 rounded-2xl border border-emerald-200/50 bg-white/90 p-4 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="range">Date range</Label>
              <Input id="range" type="text" placeholder="e.g. 22 Jan - 24 Jan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" placeholder="Short note for your manager" rows={4} />
            </div>
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Submit request
            </Button>
              </TabsContent>
            </Tabs>
            <p className="mt-3 text-xs text-muted-foreground">
              {user?.name} • Approved requests sync back with HR automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-gradient-to-br from-amber-50 to-orange-100/60 shadow-lg shadow-amber-100/70">
        <CardHeader>
          <CardTitle className="text-amber-900">Policy essentials</CardTitle>
          <CardDescription>Key guidelines for attendance & leave</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-amber-900/80 list-disc pl-5">
            <li>Standard workday is 8 hours; overtime is logged automatically after 9 hours.</li>
            <li>Notify your manager on Slack for unplanned leave or delayed check-ins.</li>
            <li>Use Work From Home requests for partial-day remote work.</li>
            <li>Leaves balance updates nightly; contact HR for discrepancies.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-indigo-50 to-blue-100/60 shadow-lg shadow-indigo-100/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-indigo-900">Upcoming schedule</CardTitle>
            <CardDescription>Based on assigned roster</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 bg-white/80">
            <CalendarDays className="h-4 w-4" /> Next 5 days
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <div key={day} className="rounded-lg border border-indigo-100 bg-white/90 p-3 text-sm shadow-sm">
              <p className="font-semibold">{day}</p>
              <p className="text-muted-foreground">Shift: 09:30 AM – 06:30 PM</p>
              <p className="text-xs text-slate-500">
                Location: {index % 2 === 0 ? 'HQ' : 'WFH'} • Manager approval required for changes
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

