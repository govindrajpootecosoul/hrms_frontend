'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlarmClock, BarChart3, CalendarDays, Clock4, Percent, Send, Timer } from 'lucide-react';
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

function GlassCard({ className = '', children, tone = 'light' }) {
  const base =
    tone === 'dark'
      ? 'rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl text-white shadow-[0_20px_80px_rgba(2,6,23,0.18)]'
      : 'rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-md text-slate-900 shadow-xl shadow-slate-100/50';
  return (
    <div
      className={[
        base,
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase();
  const cls =
    s === 'present'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      : s === 'absent'
        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
        : s === 'weekend'
          ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
          : s === 'wfh'
            ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {status || '—'}
    </span>
  );
}

function FloatingField({ id, label, children }) {
  return (
    <div className="group relative">
      {children}
      <label
        htmlFor={id}
        className={[
          'pointer-events-none absolute left-3 top-2 text-[11px] font-semibold text-slate-500 transition',
          'group-focus-within:text-slate-700',
        ].join(' ')}
      >
        {label}
      </label>
    </div>
  );
}

const parseClockToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const txt = String(timeStr).trim();
  // Accept "HH:MM", "HH:MM:SS", or "HH.MM".
  const m = txt.match(/^(\d{1,2})[:.](\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
};

const minutesToClock = (mins) => {
  if (!Number.isFinite(mins)) return '—';
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const formatHmsTimer = (minutes) => {
  const totalSeconds = Math.floor(Math.max(0, minutes || 0) * 60);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

function baseMinutesFromCheckinStatus({ status, checkInTime, totalMinutes, nowDate }) {
  let baseMinutes = Number(totalMinutes || 0);
  if (status === 'checked-in' && checkInTime) {
    try {
      const checkInMs = new Date(checkInTime).getTime();
      const nowMs = (nowDate instanceof Date ? nowDate : new Date()).getTime();
      if (Number.isFinite(checkInMs) && Number.isFinite(nowMs)) {
        const currentSessionMinutes = Math.max(0, (nowMs - checkInMs) / 60000);
        // Backend totalMinutes may already include the running session.
        baseMinutes = Math.max(0, baseMinutes - currentSessionMinutes);
      }
    } catch {
      // ignore
    }
  }
  return baseMinutes;
}

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
  const [regularizationTime, setRegularizationTime] = useState({ start: '', end: '' });
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
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [now, setNow] = useState(() => new Date(Date.now()));
  const [checkState, setCheckState] = useState({
    status: 'checked-out',
    checkInTime: null,
    totalMinutes: 0,
  });
  const [myRequestsOpen, setMyRequestsOpen] = useState(false);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsTab, setMyRequestsTab] = useState('all'); // all | regularization | on-duty | time-off
  const [teamOpen, setTeamOpen] = useState(false);
  const [managerScope, setManagerScope] = useState({ isManager: false, departments: [] });
  const [loadingManagerScope, setLoadingManagerScope] = useState(false);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loadingTeamRequests, setLoadingTeamRequests] = useState(false);
  const [decisionBusyId, setDecisionBusyId] = useState(null);
  
  useEffect(() => {
    if (!user) return;
    const fromUser = user.company && String(user.company).trim();
    const fromSession = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
    const company = fromUser || fromSession;
    if (company) {
      setSelectedCompany(company);
      if (typeof window !== 'undefined' && fromUser) {
        sessionStorage.setItem('selectedCompany', fromUser);
      }
    }
  }, [user]);

  const fetchManagerScope = async () => {
    if (!user?.id) return;
    try {
      setLoadingManagerScope(true);
      const token = localStorage.getItem('auth_token');
      const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const params = new URLSearchParams();
      params.append('userId', user.id);
      if (company) params.append('company', company);

      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (company) headers['x-company'] = company;

      const res = await fetch(`/api/portals/employee-portal/manager-scope?${params.toString()}`, { headers });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.data) {
        setManagerScope(json.data);
      } else {
        setManagerScope({ isManager: false, departments: [] });
      }
    } catch {
      setManagerScope({ isManager: false, departments: [] });
    } finally {
      setLoadingManagerScope(false);
    }
  };

  const fetchTeamRequests = async () => {
    if (!user?.id) return;
    try {
      setLoadingTeamRequests(true);
      const token = localStorage.getItem('auth_token');
      const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const params = new URLSearchParams();
      params.append('managerUserId', user.id);
      params.append('status', 'pending');
      params.append('type', 'time-off');
      if (company) params.append('company', company);

      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (company) headers['x-company'] = company;

      const res = await fetch(`/api/portals/employee-portal/team-attendance-requests?${params.toString()}`, { headers });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.data) {
        const raw = Array.isArray(json.data.requests) ? json.data.requests : [];
        const normalized = raw
          .map((r) => {
            const id = r?.id || r?._id || r?.requestId;
            const idStr = id == null ? '' : String(id);
            return { ...r, id: idStr };
          })
          .filter((r) => r.id && r.id !== 'undefined' && r.id !== 'null');
        setTeamRequests(normalized);
      } else {
        setTeamRequests([]);
      }
    } catch {
      setTeamRequests([]);
    } finally {
      setLoadingTeamRequests(false);
    }
  };

  const decideTeamRequest = async ({ requestId, action, rejectionReason }) => {
    if (!user?.id) return;
    setDecisionBusyId(requestId);
    try {
      const token = localStorage.getItem('auth_token');
      const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      if (company) headers['x-company'] = company;

      const qs = new URLSearchParams();
      if (company) qs.append('company', company);

      const res = await fetch(
        `/api/portals/employee-portal/team-attendance-requests/${encodeURIComponent(requestId)}/decide${qs.toString() ? `?${qs.toString()}` : ''}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action,
            decidedByUserId: user.id,
            decidedByName: user.name || user.email || user.id,
            rejectionReason: rejectionReason || '',
          }),
        }
      );
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setSubmitMessage({ type: 'success', text: action === 'approve' ? 'Request approved.' : 'Request rejected.' });
        setTimeout(() => setSubmitMessage({ type: '', text: '' }), 2500);
        await fetchTeamRequests();
      } else {
        setSubmitMessage({ type: 'error', text: json?.error || 'Failed to update request' });
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Failed to update request' });
    } finally {
      setDecisionBusyId(null);
    }
  };

  useEffect(() => {
    fetchManagerScope();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedCompany]);

  useEffect(() => {
    if (teamOpen && managerScope?.isManager) fetchTeamRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamOpen, managerScope?.isManager]);

  useEffect(() => {
    // Keep derived timeWindow string in sync for backend payload compatibility.
    const start = regularizationTime.start;
    const end = regularizationTime.end;
    const next = start && end ? `${start} - ${end}` : '';
    setRegularizationForm((prev) => (prev.timeWindow === next ? prev : { ...prev, timeWindow: next }));
  }, [regularizationTime.start, regularizationTime.end]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date(Date.now() + serverOffsetMs)), 1000);
    return () => clearInterval(tick);
  }, [serverOffsetMs]);

  useEffect(() => {
    // Best-effort server time sync for tamper-resistant timer.
    const sync = async () => {
      try {
        const res = await fetch('/api/portals/employee-portal/time', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const serverTimeMs = json?.data?.serverTimeMs;
        if (typeof serverTimeMs === 'number' && Number.isFinite(serverTimeMs)) {
          setServerOffsetMs(serverTimeMs - Date.now());
          setNow(new Date(serverTimeMs));
        }
      } catch {
        // ignore
      }
    };
    sync();
    const interval = setInterval(sync, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
        if (user.empCode) {
          params.append('empCode', user.empCode);
        }
        params.append('timeframe', timeframe);
        if (timeframe === 'prev' && selectedMonth) {
          params.append('month', selectedMonth);
        }
        if (company) {
          params.append('company', company);
        }

        const res = await fetch(
          `/api/portals/employee-portal/attendance?${params.toString()}`,
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

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.employeeId) return;
      try {
        const token = localStorage.getItem('auth_token');
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        let url = `/api/portals/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
        if (company) url += `&company=${encodeURIComponent(company)}`;
        const res = await fetch(url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && json?.data) {
          const status = json.data.status || 'checked-out';
          const checkInTime = json.data.checkInTime || null;
          const totalMinutes = Number(json.data.totalMinutes || 0);
          const baseMinutes = baseMinutesFromCheckinStatus({
            status,
            checkInTime,
            totalMinutes,
            // Use a fresh (server-offset) timestamp so this effect doesn't need to depend on `now`.
            nowDate: new Date(Date.now() + serverOffsetMs),
          });
          setCheckState({
            status,
            checkInTime,
            totalMinutes: baseMinutes,
          });
        }
      } catch {
        // ignore
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [user?.employeeId, selectedCompany, serverOffsetMs]);

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
        if (!regularizationForm.date || !regularizationTime.start || !regularizationTime.end) {
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

      const res = await fetch('/api/portals/employee-portal/attendance-request', {
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
          setRegularizationTime({ start: '', end: '' });
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

  const totalHoursPast7Days = useMemo(() => {
    const rows = attendanceData?.attendanceLast7Days || [];
    return rows.reduce((sum, d) => {
      const h = Number(d?.hours);
      return sum + (Number.isFinite(h) ? h : 0);
    }, 0);
  }, [attendanceData]);

  const totalHoursThisMonthAccurate = useMemo(() => {
    const rows = attendanceData?.attendanceThisMonth || [];
    return rows.reduce((sum, d) => {
      const h = Number(d?.hours);
      return sum + (Number.isFinite(h) ? h : 0);
    }, 0);
  }, [attendanceData]);

  const totalHoursPreviousMonthAccurate = useMemo(() => {
    const rows = attendanceData?.attendancePreviousMonth || [];
    return rows.reduce((sum, d) => {
      const h = Number(d?.hours);
      return sum + (Number.isFinite(h) ? h : 0);
    }, 0);
  }, [attendanceData]);

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
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="[&>th]:px-5 [&>th]:py-4 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wider">
              <th>Date</th>
              <th>Day</th>
              <th>Status</th>
              <th>In</th>
              <th>Out</th>
              <th className="text-right">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900">
            {attendance.map((day) => (
              <tr key={day.date || `${day.day}-${day.status}-${day.hours}`} className="transition hover:bg-slate-50">
                <td className="px-5 py-4 text-slate-900">
                  {day.date ? format(new Date(day.date), 'MMM dd, yyyy') : '—'}
                </td>
                <td className="px-5 py-4 text-slate-600">{day.day || (day.date ? format(new Date(day.date), 'EEE') : '—')}</td>
                <td className="px-5 py-4">
                  <StatusPill status={day.status} />
                </td>
                <td className="px-5 py-4 text-slate-600">{day.punchIn || '—'}</td>
                <td className="px-5 py-4 text-slate-600">{day.punchOut || '—'}</td>
                <td className="px-5 py-4 text-right font-semibold text-slate-900">{day.hours ? `${Number(day.hours).toFixed(1)}h` : '—'}</td>
              </tr>
            ))}
            {attendance.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-slate-600" colSpan={6}>
                  No attendance records found for this period.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );

  const workedMinutes = useMemo(() => {
    const base = Number(checkState.totalMinutes || 0);
    if (checkState.status !== 'checked-in' || !checkState.checkInTime) return Math.max(0, base);
    const t0 = new Date(checkState.checkInTime).getTime();
    if (!Number.isFinite(t0)) return Math.max(0, base);
    const elapsed = (now.getTime() - t0) / 60000;
    return Math.max(0, base + elapsed);
  }, [checkState, now]);

  const attendancePercent = useMemo(() => {
    if (!attendance || attendance.length === 0) return 0;
    const working = attendance.filter((d) => String(d.status).toLowerCase() !== 'weekend').length;
    if (working === 0) return 0;
    const present = attendance.filter((d) => String(d.status).toLowerCase() === 'present').length;
    return Math.round((present / working) * 100);
  }, [attendance]);

  const averageLogin = useMemo(() => {
    const inTimes = (attendance || [])
      .map((d) => parseClockToMinutes(d.punchIn))
      .filter((v) => v != null);
    if (inTimes.length === 0) return null;
    const avg = inTimes.reduce((a, b) => a + b, 0) / inTimes.length;
    return Math.round(avg);
  }, [attendance]);

  const leaveBalance = Number(attendanceData?.leaveBalance ?? attendanceData?.quickStats?.leaveBalance ?? 0);

  const handleClockToggle = async () => {
    if (!user?.employeeId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
      const endpoint = checkState.status === 'checked-in' ? 'checkout' : 'checkin';
      let url = `/api/portals/employee-portal/${endpoint}`;
      if (company) url += `?company=${encodeURIComponent(company)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ employeeId: user.employeeId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        setSubmitMessage({ type: 'error', text: json?.error || 'Failed to update check-in status' });
        return;
      }
      // Refresh status quickly.
      setSubmitMessage({ type: 'success', text: checkState.status === 'checked-in' ? 'Checked out successfully.' : 'Checked in successfully.' });
      setTimeout(() => setSubmitMessage({ type: '', text: '' }), 2500);
    } catch (e) {
      setSubmitMessage({ type: 'error', text: 'Clock action failed. Please try again.' });
    }
  };

  const fetchMyAttendanceRequests = async () => {
    if (!user?.employeeId) return;
    try {
      setMyRequestsLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const params = new URLSearchParams();
      params.append('employeeId', user.employeeId);
      if (company) params.append('company', company);

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      if (company) headers['x-company'] = company;

      const res = await fetch(`/api/portals/employee-portal/attendance-requests?${params.toString()}`, { headers });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.data) {
        const all = Array.isArray(json.data.requests) ? json.data.requests.slice() : [];
        all.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
        setMyRequests(all);
      } else {
        setMyRequests([]);
      }
    } catch {
      setMyRequests([]);
    } finally {
      setMyRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (myRequestsOpen) fetchMyAttendanceRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRequestsOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!myRequestsOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [myRequestsOpen]);

  const filteredMyRequests = useMemo(() => {
    const tab = String(myRequestsTab || 'all');
    if (tab === 'all') return myRequests;
    return myRequests.filter((r) => String(r.type || '').toLowerCase() === tab);
  }, [myRequests, myRequestsTab]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">VECTORLYTICS HRMS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">History, clock, and requests in one place.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Clock4}
          label="Total Hours"
          value={loadingData ? '—' : `${Number(totalHoursPast7Days || 0).toFixed(1)}h`}
          sub="Past 7 days"
        />
        <StatCard
          icon={AlarmClock}
          label="This Month Hours"
          value={loadingData ? '—' : `${Number(totalHoursThisMonthAccurate || 0).toFixed(1)}h`}
          sub="This month"
        />
        <StatCard
          icon={Percent}
          label="Previous Month Hours"
          value={loadingData ? '—' : `${Number(totalHoursPreviousMonthAccurate || 0).toFixed(1)}h`}
          sub="Previous month"
        />
        <StatCard icon={CalendarDays} label="Leave Balance" value={Number.isFinite(leaveBalance) ? `${leaveBalance} days` : '—'} sub="As available from backend" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
        {/* Left: History */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Attendance history</p>
              <p className="text-sm text-slate-600">A clean, minimal view of your punches and status.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={timeframe} onValueChange={(val) => setTimeframe(val)} className="w-full sm:w-auto">
                <TabsList className="rounded-2xl border border-slate-200 bg-white">
                  <TabsTrigger value="7d">Past 7 days</TabsTrigger>
                  <TabsTrigger value="month">This month</TabsTrigger>
                  <TabsTrigger value="prev">Previous month</TabsTrigger>
                </TabsList>
              </Tabs>
              {timeframe === 'prev' && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-10 w-full rounded-2xl border-slate-200 bg-white text-sm sm:w-48">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            {loadingData ? (
              <div className="py-14 text-center text-sm text-slate-600">Loading attendance…</div>
            ) : (
              <div className="rounded-[28px] bg-white">
                {renderAttendanceRows()}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sticky sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <GlassCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clock</p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-900">{formatHmsTimer(workedMinutes)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {checkState.status === 'checked-in' ? 'Active session' : 'Not clocked in'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Timer className="h-5 w-5" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleClockToggle}
              className={[
                'mt-4 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                checkState.status === 'checked-in'
                  ? 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
                  : 'border-slate-200 bg-slate-900 text-white hover:bg-slate-800',
              ].join(' ')}
            >
              {checkState.status === 'checked-in' ? 'Clock out' : 'Clock in'}
            </button>

            {submitMessage.text ? (
              <div
                className={[
                  'mt-3 rounded-2xl px-3 py-2 text-sm',
                  submitMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/20',
                ].join(' ')}
              >
                {submitMessage.text}
              </div>
            ) : null}
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Attendance requests</p>
                <p className="text-sm text-slate-500">Regularization, on-duty, leave.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <Tabs value={requestTab} onValueChange={(val) => setRequestTab(val)} className="space-y-4">
                <TabsList className="grid grid-cols-3 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  <TabsTrigger value="regularization" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
                    Reg.
                  </TabsTrigger>
                  <TabsTrigger value="on-duty" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
                    On duty
                  </TabsTrigger>
                  <TabsTrigger value="time-off" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
                    Leave
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="regularization" className="space-y-3">
                  <FloatingField id="regularization-date" label="Date">
                    <Input
                      id="regularization-date"
                      type="date"
                      value={regularizationForm.date}
                      onChange={(e) => setRegularizationForm({ ...regularizationForm, date: e.target.value })}
                      className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                      placeholder=" "
                    />
                  </FloatingField>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FloatingField id="regularization-window-start" label="Start">
                      <Input
                        id="regularization-window-start"
                        type="time"
                        value={regularizationTime.start}
                        onChange={(e) => setRegularizationTime((prev) => ({ ...prev, start: e.target.value }))}
                        className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                        placeholder=" "
                      />
                    </FloatingField>
                    <FloatingField id="regularization-window-end" label="End">
                      <Input
                        id="regularization-window-end"
                        type="time"
                        value={regularizationTime.end}
                        onChange={(e) => setRegularizationTime((prev) => ({ ...prev, end: e.target.value }))}
                        className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                        placeholder=" "
                      />
                    </FloatingField>
                  </div>

                  <FloatingField id="regularization-notes" label="Notes">
                    <Textarea
                      id="regularization-notes"
                      rows={3}
                      value={regularizationForm.notes}
                      onChange={(e) => setRegularizationForm({ ...regularizationForm, notes: e.target.value })}
                      className="min-h-[96px] rounded-2xl border-slate-300 bg-white pt-6 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                      placeholder=" "
                    />
                  </FloatingField>

                  <Button
                    className="h-11 w-full rounded-2xl bg-white text-slate-900 hover:bg-white/90"
                    onClick={() => handleSubmitRequest('regularization')}
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Submitting…' : 'Send request'}
                  </Button>
                </TabsContent>

                <TabsContent value="on-duty" className="space-y-3">
                  <FloatingField id="on-duty-date" label="Duty date">
                    <Input
                      id="on-duty-date"
                      type="date"
                      value={onDutyForm.date}
                      onChange={(e) => setOnDutyForm({ ...onDutyForm, date: e.target.value })}
                      className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                      placeholder=" "
                    />
                  </FloatingField>
                  <FloatingField id="on-duty-location" label="Location / client">
                    <Input
                      id="on-duty-location"
                      type="text"
                      value={onDutyForm.location}
                      onChange={(e) => setOnDutyForm({ ...onDutyForm, location: e.target.value })}
                      className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                      placeholder=" "
                    />
                  </FloatingField>
                  <FloatingField id="on-duty-details" label="Details">
                    <Textarea
                      id="on-duty-details"
                      rows={3}
                      value={onDutyForm.details}
                      onChange={(e) => setOnDutyForm({ ...onDutyForm, details: e.target.value })}
                      className="min-h-[96px] rounded-2xl border-slate-300 bg-white pt-6 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                      placeholder=" "
                    />
                  </FloatingField>
                  <Button
                    className="h-11 w-full rounded-2xl bg-white text-slate-900 hover:bg-white/90"
                    onClick={() => handleSubmitRequest('on-duty')}
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Submitting…' : 'Send request'}
                  </Button>
                </TabsContent>

                <TabsContent value="time-off" className="space-y-3">
                  <div className="group relative">
                    <Select value={timeOffForm.leaveType} onValueChange={(value) => setTimeOffForm({ ...timeOffForm, leaveType: value })}>
                      <SelectTrigger id="leave-type" className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                        <SelectItem value="Compensatory Off">Compensatory Off</SelectItem>
                        <SelectItem value="LOP">LOP (Loss of Pay)</SelectItem>
                      <SelectItem value="Time Off">Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <label htmlFor="leave-type" className="pointer-events-none absolute left-3 top-2 text-[11px] font-semibold text-slate-500">
                      Leave type
                    </label>
                  </div>

                  <FloatingField id="range" label="Date range">
                    <Input
                      id="range"
                      type="text"
                      value={timeOffForm.dateRange}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, dateRange: e.target.value })}
                      className="h-12 rounded-2xl border-slate-300 bg-white pt-5 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                      placeholder=" "
                    />
                  </FloatingField>
                  <FloatingField id="reason" label="Reason">
                    <Textarea
                      id="reason"
                      rows={3}
                      value={timeOffForm.reason}
                      onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                      className="min-h-[96px] rounded-2xl border-slate-300 bg-white pt-6 text-slate-900 placeholder:text-transparent focus-visible:ring-0"
                      placeholder=" "
                    />
                  </FloatingField>
                  <Button
                    className="h-11 w-full rounded-2xl bg-white text-slate-900 hover:bg-white/90"
                    onClick={() => handleSubmitRequest('time-off')}
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Submitting…' : 'Send request'}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Tip: Duplicate requests for the same date are blocked automatically.
              </div>

              <div className="mt-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-2xl border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    onClick={() => setMyRequestsOpen(true)}
                  >
                    My attendance requests
                  </Button>
                  {managerScope?.isManager ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full rounded-2xl border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                      onClick={() => setTeamOpen(true)}
                      disabled={loadingManagerScope}
                    >
                      Team requests
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Quick notes</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Timer className="h-4 w-4" />
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                Clocking in marks the day as Present.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                Attendance % is calculated for the selected timeframe.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                Use requests for missed punches or time off.
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>

      {myRequestsOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setMyRequestsOpen(false)}
          />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-lg font-semibold text-slate-900">My Attendance Requests</p>
                <p className="text-sm text-slate-500">All history (regularization, on-duty, leave)</p>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={() => setMyRequestsOpen(false)}>
                Close
              </Button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'regularization', label: 'Regularization' },
                    { id: 'on-duty', label: 'On-duty' },
                    { id: 'time-off', label: 'Leave' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMyRequestsTab(t.id)}
                      className={[
                        'rounded-xl px-3 py-2 text-xs font-semibold transition',
                        myRequestsTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                      ].join(' ')}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={fetchMyAttendanceRequests}
                  disabled={myRequestsLoading}
                >
                  {myRequestsLoading ? 'Refreshing…' : 'Refresh'}
                </Button>
              </div>

              <div className="mt-5 pb-4">
                {myRequestsLoading ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                    Loading requests…
                  </div>
                ) : filteredMyRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                    No requests found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMyRequests.slice(0, 50).map((req) => {
                      const status = String(req.status || 'pending').toLowerCase();
                      const statusColor =
                        status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';

                      const typeLabel =
                        req.type === 'regularization'
                          ? 'Regularization'
                          : req.type === 'on-duty'
                            ? 'On-duty'
                            : req.type === 'time-off'
                              ? 'Leave'
                              : req.type || 'Request';

                      return (
                        <div key={String(req.id || req._id || req.requestId || req.submittedAt)} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor}`}>
                                {status}
                              </span>
                              <span className="text-sm font-semibold text-slate-900">{typeLabel}</span>
                            {req.leaveType ? (
                              <span className="text-xs font-semibold text-slate-500">• {req.leaveType === 'Time Off' ? 'Leave' : req.leaveType}</span>
                            ) : null}
                            </div>
                            <div className="text-xs text-slate-500">
                              {req.submittedAt ? format(new Date(req.submittedAt), 'MMM dd, yyyy hh:mm a') : '—'}
                            </div>
                          </div>

                          <div className="mt-2 grid gap-1 text-sm text-slate-700">
                            {req.date ? <div><span className="text-slate-500">Date:</span> {req.date}</div> : null}
                            {req.timeWindow ? <div><span className="text-slate-500">Time window:</span> {req.timeWindow}</div> : null}
                            {req.location ? <div><span className="text-slate-500">Location:</span> {req.location}</div> : null}
                            {req.dateRange ? <div><span className="text-slate-500">Date range:</span> {req.dateRange}</div> : null}
                            {req.reason ? <div><span className="text-slate-500">Reason:</span> {req.reason}</div> : null}
                            {req.notes ? <div><span className="text-slate-500">Notes:</span> {req.notes}</div> : null}
                            {req.details ? <div><span className="text-slate-500">Details:</span> {req.details}</div> : null}
                            {req.rejectionReason ? (
                              <div className="text-rose-700">
                                <span className="text-rose-600">Rejection reason:</span> {req.rejectionReason}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {teamOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setTeamOpen(false)}
          />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-lg font-semibold text-slate-900">Team requests</p>
                <p className="text-sm text-slate-500">
                  Pending time-off requests for your managed departments: {managerScope?.departments?.join(', ') || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={fetchTeamRequests}
                  disabled={loadingTeamRequests}
                >
                  {loadingTeamRequests ? 'Refreshing…' : 'Refresh'}
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => setTeamOpen(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
              {loadingTeamRequests ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                  Loading team requests…
                </div>
              ) : teamRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
                  No pending team requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {teamRequests.map((req) => (
                    <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                              Pending
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {req.employeeName || req.employeeId}
                            </span>
                            {req.employeeDepartment ? (
                              <span className="text-xs font-semibold text-slate-500">• {req.employeeDepartment}</span>
                            ) : null}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            <span className="text-slate-500">Type:</span> {req.leaveType ? (req.leaveType === 'Time Off' ? 'Leave' : req.leaveType) : 'Leave'}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            <span className="text-slate-500">Date range:</span> {req.dateRange || '—'}
                          </div>
                          {req.reason ? (
                            <div className="mt-1 text-sm text-slate-700">
                              <span className="text-slate-500">Reason:</span> {req.reason}
                            </div>
                          ) : null}
                          {req.submittedAt ? (
                            <div className="mt-1 text-xs text-slate-500">
                              Submitted {format(new Date(req.submittedAt), 'MMM dd, yyyy hh:mm a')}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 sm:justify-end">
                          <Button
                            type="button"
                            className="rounded-2xl"
                            onClick={() => decideTeamRequest({ requestId: req.id, action: 'approve' })}
                            disabled={decisionBusyId === req.id}
                          >
                            {decisionBusyId === req.id ? '…' : 'Approve'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                            onClick={() => {
                              const reason = window.prompt('Rejection reason (optional):', '') || '';
                              decideTeamRequest({ requestId: req.id, action: 'reject', rejectionReason: reason });
                            }}
                            disabled={decisionBusyId === req.id}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
