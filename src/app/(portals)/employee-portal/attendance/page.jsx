'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/lib/context/AuthContext';
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
import { API_BASE_URL } from '@/lib/utils/constants';

const legendMeta = [
  { key: 'present', label: 'Present', dot: 'bg-emerald-500' },
  { key: 'absent', label: 'Absent', dot: 'bg-rose-500' },
  { key: 'wfh', label: 'Work From Home', dot: 'bg-sky-500' },
  { key: 'weekend', label: 'Weekend', dot: 'bg-slate-300' },
];

const modifierPalette = {
  present: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.25)]',
  absent: 'bg-rose-50 text-rose-700 border border-rose-200 shadow-[0_1px_2px_rgba(244,63,94,0.25)]',
  wfh: 'bg-sky-50 text-sky-700 border border-sky-200 shadow-[0_1px_2px_rgba(14,165,233,0.25)]',
  weekend: 'text-slate-400',
};

const monthPatterns = {
  '2025-01': { absent: [3, 9, 22], wfh: [6, 13, 27] },
  '2024-12': { absent: [4, 11, 18], wfh: [2, 16, 30] },
  '2024-11': { absent: [5, 12, 25], wfh: [8, 19, 28] },
};

const createCalendarData = (monthDate, pattern) => {
  const monthKey = format(monthDate, 'yyyy-MM');
  const config = pattern ?? { absent: [4, 12, 20, 26], wfh: [3, 10, 17, 24] };
  const mergedPattern = {
    absent: config.absent ?? [],
    wfh: config.wfh ?? [],
  };
  const modifiers = {
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

const parseMonthValue = (value) => {
  const [year, month] = value.split('-').map((segment) => Number(segment));
  return startOfMonth(new Date(year, (month ?? 1) - 1, 1));
};

export default function EmployeeAttendancePage() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedMonth, setSelectedMonth] = useState(() => format(subMonths(new Date(), 1), 'yyyy-MM'));
  const [requestTab, setRequestTab] = useState('regularization');
  const currentMonthDate = startOfMonth(new Date());
  const thisMonthKey = format(currentMonthDate, 'yyyy-MM');
  const previousMonthDate = useMemo(() => parseMonthValue(selectedMonth), [selectedMonth]);

  // Get company from sessionStorage
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Form states for attendance requests
  const [regularizationForm, setRegularizationForm] = useState({
    date: '',
    timeWindow: '',
    notes: ''
  });
  const [onDutyForm, setOnDutyForm] = useState({
    date: '',
    location: '',
    details: ''
  });
  const [timeOffForm, setTimeOffForm] = useState({
    dateRange: '',
    reason: '',
    leaveType: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const company = sessionStorage.getItem('selectedCompany');
      setSelectedCompany(company);
    }
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.employeeId) return;
      try {
        setLoadingData(true);
        const token = localStorage.getItem('auth_token');
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        
        // Build query params
        const params = new URLSearchParams();
        params.append('employeeId', user.employeeId);
        params.append('timeframe', timeframe);
        if (timeframe === 'prev' && selectedMonth) {
          params.append('month', selectedMonth);
        }
        if (company) {
          params.append('company', company);
        }

        const res = await fetch(
          `/api/employee-portal/attendance?${params.toString()}`,
          { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
        );
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setAttendanceData(json.data);
          }
        }
      } catch (err) {
        console.error('Attendance fetch failed', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAttendance();
  }, [user, timeframe, selectedMonth, selectedCompany]);

  // Handle attendance request submission
  const handleSubmitRequest = async (type) => {
    if (!user?.employeeId) {
      setSubmitMessage({ type: 'error', text: 'Employee ID not found. Please log in again.' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('auth_token');
      const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
      
      let requestData = {
        employeeId: user.employeeId,
        type
      };

      if (type === 'regularization') {
        if (!regularizationForm.date || !regularizationForm.timeWindow) {
          setSubmitMessage({ type: 'error', text: 'Please fill in all required fields' });
          setSubmitting(false);
          return;
        }
        requestData = {
          ...requestData,
          date: regularizationForm.date,
          timeWindow: regularizationForm.timeWindow,
          notes: regularizationForm.notes
        };
      } else if (type === 'on-duty') {
        if (!onDutyForm.date || !onDutyForm.location) {
          setSubmitMessage({ type: 'error', text: 'Please fill in all required fields' });
          setSubmitting(false);
          return;
        }
        requestData = {
          ...requestData,
          date: onDutyForm.date,
          location: onDutyForm.location,
          details: onDutyForm.details
        };
      } else if (type === 'time-off') {
        if (!timeOffForm.dateRange || !timeOffForm.reason || !timeOffForm.leaveType) {
          setSubmitMessage({ type: 'error', text: 'Please fill in all required fields including leave type' });
          setSubmitting(false);
          return;
        }
        requestData = {
          ...requestData,
          dateRange: timeOffForm.dateRange,
          reason: timeOffForm.reason,
          leaveType: timeOffForm.leaveType
        };
      }

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch('/api/employee-portal/attendance-request', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSubmitMessage({ type: 'success', text: 'Request submitted successfully!' });
        
        // Reset form
        if (type === 'regularization') {
          setRegularizationForm({ date: '', timeWindow: '', notes: '' });
        } else if (type === 'on-duty') {
          setOnDutyForm({ date: '', location: '', details: '' });
        } else if (type === 'time-off') {
          setTimeOffForm({ dateRange: '', reason: '', leaveType: '' });
        }

        // Clear message after 3 seconds
        setTimeout(() => {
          setSubmitMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setSubmitMessage({ type: 'error', text: json.error || 'Failed to submit request' });
      }
    } catch (err) {
      console.error('Submit request error:', err);
      setSubmitMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get attendance data based on timeframe
  const attendance = useMemo(() => {
    if (!attendanceData) return [];
    if (timeframe === '7d') {
      return attendanceData.attendanceLast7Days || [];
    } else if (timeframe === 'month') {
      return attendanceData.attendanceThisMonth || [];
    } else {
      return attendanceData.attendancePreviousMonth || [];
    }
  }, [attendanceData, timeframe]);

  const totalHours = useMemo(() => {
    if (!attendanceData) return 0;
    if (timeframe === '7d') {
      return attendanceData.totalHours7Days || 0;
    } else if (timeframe === 'month') {
      return attendanceData.totalHoursThisMonth || 0;
    } else {
      return attendanceData.totalHoursPreviousMonth || 0;
    }
  }, [attendanceData, timeframe]);

  // Create calendar data from live attendance data
  const thisMonthCalendar = useMemo(() => {
    if (!attendanceData?.attendanceThisMonth) {
      return createCalendarData(currentMonthDate, { absent: [], wfh: [] });
    }
    
    const attendanceMap = new Map();
    attendanceData.attendanceThisMonth.forEach((day) => {
      // Use date string as key for accurate matching (format: YYYY-MM-DD)
      const dateKey = day.date;
      attendanceMap.set(dateKey, day);
    });

    const absent = [];
    const wfh = [];
    const present = [];
    const weekend = [];

    eachDayOfInterval({ start: startOfMonth(currentMonthDate), end: endOfMonth(currentMonthDate) }).forEach((date) => {
      // Create date key in YYYY-MM-DD format to match attendance data
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = attendanceMap.get(dateKey);
      
      if (isWeekend(date)) {
        weekend.push(date);
      } else if (dayData) {
        if (dayData.status === 'Absent') {
          absent.push(date);
        } else if (dayData.status === 'WFH') {
          wfh.push(date);
        } else if (dayData.status === 'Present') {
          present.push(date);
        }
      } else {
        // No check-in data, assume absent
        absent.push(date);
      }
    });

    return {
      month: currentMonthDate,
      key: thisMonthKey,
      modifiers: { present, absent, wfh, weekend },
    };
  }, [attendanceData, currentMonthDate, thisMonthKey]);

  const previousMonthCalendar = useMemo(() => {
    if (!attendanceData?.attendancePreviousMonth) {
      return createCalendarData(previousMonthDate, { absent: [], wfh: [] });
    }
    
    const attendanceMap = new Map();
    attendanceData.attendancePreviousMonth.forEach((day) => {
      // Use date string as key for accurate matching (format: YYYY-MM-DD)
      const dateKey = day.date;
      attendanceMap.set(dateKey, day);
    });

    const absent = [];
    const wfh = [];
    const present = [];
    const weekend = [];

    eachDayOfInterval({ start: startOfMonth(previousMonthDate), end: endOfMonth(previousMonthDate) }).forEach((date) => {
      // Create date key in YYYY-MM-DD format to match attendance data
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = attendanceMap.get(dateKey);
      
      if (isWeekend(date)) {
        weekend.push(date);
      } else if (dayData) {
        if (dayData.status === 'Absent') {
          absent.push(date);
        } else if (dayData.status === 'WFH') {
          wfh.push(date);
        } else if (dayData.status === 'Present') {
          present.push(date);
        }
      } else {
        // No check-in data, assume absent
        absent.push(date);
      }
    });

    return {
      month: previousMonthDate,
      key: format(previousMonthDate, 'yyyy-MM'),
      modifiers: { present, absent, wfh, weekend },
    };
  }, [attendanceData, previousMonthDate]);

  const renderAttendanceRows = () => (
    <div className="space-y-2">
      {attendance.map((day) => (
        <div key={day.date || `${day.day}-${day.status}-${day.hours}`} className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm">
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

  const renderCalendarView = (calendarData, hint) => (
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
              <Tabs value={timeframe} onValueChange={(val) => setTimeframe(val)} className="w-full lg:w-auto">
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
                    {/* Generate month options for last 6 months */}
                    {Array.from({ length: 6 }, (_, i) => {
                      const date = subMonths(new Date(), i);
                      const value = format(date, 'yyyy-MM');
                      const label = format(date, 'MMM yyyy');
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock4 className="h-4 w-4" />
                {loadingData ? '...' : `${totalHours.toFixed(1)} hrs`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading attendance data...</p>
              </div>
            ) : (
              <Tabs value={timeframe}>
                <TabsContent value="7d">
                  {attendance.length > 0 ? renderAttendanceRows() : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No attendance data available for the past 7 days
                    </div>
                  )}
                </TabsContent>
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
                        {/* Generate month options for last 6 months */}
                        {Array.from({ length: 6 }, (_, i) => {
                          const date = subMonths(new Date(), i);
                          const value = format(date, 'yyyy-MM');
                          const label = format(date, 'MMM yyyy');
                          return (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          );
                        })}
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
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg shadow-emerald-100/60">
          <CardHeader>
            <CardTitle className="text-slate-900">Attendance requests</CardTitle>
            <CardDescription>Manage regularization, on-duty or time-off in one place</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={requestTab} onValueChange={(val) => setRequestTab(val)} className="space-y-4">
              <TabsList className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
                <TabsTrigger value="regularization">Attendance regularization</TabsTrigger>
                <TabsTrigger value="on-duty">On duty request</TabsTrigger>
                <TabsTrigger value="time-off">Request time off</TabsTrigger>
              </TabsList>

              <TabsContent value="regularization" className="space-y-4 rounded-2xl border border-emerald-200/50 bg-white/90 p-4 shadow-sm">
                {submitMessage.text && (
                  <div className={`p-3 rounded-lg text-sm ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="regularization-date">Date to adjust</Label>
                  <Input 
                    id="regularization-date" 
                    type="date" 
                    className="rounded-xl" 
                    value={regularizationForm.date}
                    onChange={(e) => setRegularizationForm({ ...regularizationForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regularization-window">Time window</Label>
                  <Input 
                    id="regularization-window" 
                    type="text" 
                    placeholder="e.g. 09:30 AM – 06:30 PM" 
                    value={regularizationForm.timeWindow}
                    onChange={(e) => setRegularizationForm({ ...regularizationForm, timeWindow: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regularization-notes">Notes</Label>
                  <Textarea 
                    id="regularization-notes" 
                    rows={4} 
                    placeholder="Explain the missing punch or discrepancy" 
                    value={regularizationForm.notes}
                    onChange={(e) => setRegularizationForm({ ...regularizationForm, notes: e.target.value })}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmitRequest('regularization')}
                  disabled={submitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Send regularization'}
                </Button>
              </TabsContent>

              <TabsContent value="on-duty" className="space-y-4 rounded-2xl border border-emerald-200/50 bg-white/90 p-4 shadow-sm">
                {submitMessage.text && (
                  <div className={`p-3 rounded-lg text-sm ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="on-duty-date">Duty date</Label>
                  <Input 
                    id="on-duty-date" 
                    type="date" 
                    className="rounded-xl" 
                    value={onDutyForm.date}
                    onChange={(e) => setOnDutyForm({ ...onDutyForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="on-duty-location">Location / client</Label>
                  <Input 
                    id="on-duty-location" 
                    type="text" 
                    placeholder="e.g. Client HQ, Mumbai" 
                    value={onDutyForm.location}
                    onChange={(e) => setOnDutyForm({ ...onDutyForm, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="on-duty-details">Details</Label>
                  <Textarea 
                    id="on-duty-details" 
                    rows={4} 
                    placeholder="Share agenda, travel plan or approvals needed" 
                    value={onDutyForm.details}
                    onChange={(e) => setOnDutyForm({ ...onDutyForm, details: e.target.value })}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmitRequest('on-duty')}
                  disabled={submitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit on-duty request'}
                </Button>
              </TabsContent>

              <TabsContent value="time-off" className="space-y-4 rounded-2xl border border-emerald-200/50 bg-white/90 p-4 shadow-sm">
                {submitMessage.text && (
                  <div className={`p-3 rounded-lg text-sm ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={timeOffForm.leaveType} onValueChange={(value) => setTimeOffForm({ ...timeOffForm, leaveType: value })}>
                    <SelectTrigger id="leave-type" className="rounded-xl">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                      <SelectItem value="Compensatory Off">Compensatory Off</SelectItem>
                      <SelectItem value="LOP">LOP (Loss of Pay)</SelectItem>
                      <SelectItem value="Time Off">Time Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="range">Date range</Label>
                  <Input 
                    id="range" 
                    type="text" 
                    placeholder="e.g. 22 Jan - 24 Jan" 
                    value={timeOffForm.dateRange}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, dateRange: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Short note for your manager" 
                    rows={4} 
                    value={timeOffForm.reason}
                    onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmitRequest('time-off')}
                  disabled={submitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit request'}
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

      {/* Previous Attendance History Table */}
      <Card className="border-none bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Previous Attendance History</CardTitle>
          <CardDescription>Detailed view of your past attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="text-center py-8 text-sm text-slate-600">Loading attendance history...</div>
          ) : !attendanceData ? (
            <div className="text-center py-8 text-sm text-slate-600">No attendance data available</div>
          ) : (
            <div className="space-y-4">
              {/* Combine all attendance data for history view */}
              {(() => {
                const allAttendance = [
                  ...(attendanceData.attendanceLast7Days || []).map(day => ({ ...day, period: 'Last 7 Days' })),
                  ...(attendanceData.attendanceThisMonth || []).map(day => ({ ...day, period: 'This Month' })),
                  ...(attendanceData.attendancePreviousMonth || []).map(day => ({ ...day, period: 'Previous Month' }))
                ];
                
                // Remove duplicates and sort by date
                const uniqueAttendance = Array.from(
                  new Map(allAttendance.map(item => [item.day || item.date, item])).values()
                ).sort((a, b) => {
                  const dateA = new Date(a.date || a.day);
                  const dateB = new Date(b.date || b.day);
                  return dateB - dateA;
                });

                if (uniqueAttendance.length === 0) {
                  return <div className="text-center py-8 text-sm text-slate-600">No attendance records found</div>;
                }

                return (
                  <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Day</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Hours</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Period</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {uniqueAttendance.slice(0, 30).map((day, index) => {
                            const statusColors = {
                              'Present': 'bg-green-100 text-green-800 border-green-200',
                              'Absent': 'bg-red-100 text-red-800 border-red-200',
                              'WFH': 'bg-sky-100 text-sky-800 border-sky-200',
                              'Weekend': 'bg-slate-100 text-slate-600 border-slate-200'
                            };
                            const statusColor = statusColors[day.status] || 'bg-gray-100 text-gray-800 border-gray-200';
                            
                            return (
                              <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-slate-900">
                                  {day.date ? format(new Date(day.date), 'MMM dd, yyyy') : day.day || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {day.day || (day.date ? format(new Date(day.date), 'EEE') : 'N/A')}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge className={`${statusColor} border font-medium`}>
                                    {day.status || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                  {day.hours ? `${day.hours.toFixed(1)} hrs` : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {day.period || 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {uniqueAttendance.length > 30 && (
                      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600 text-center">
                        Showing last 30 records. Use the filters above to view specific periods.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
