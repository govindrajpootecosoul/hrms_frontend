'use client';

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  Calendar,
  Cake,
  CheckCircle,
  XCircle,
  Home,
  CalendarDays,
  Download,
  MessageSquare,
  Send,
  Layers,
  Activity,
  Plus,
  FileText,
  Coins,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Table from '@/components/common/Table';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const parseYmdToLocalDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const formatAttendanceTrendTick = (value) => {
  const dt = parseYmdToLocalDate(value);
  if (!dt) return String(value ?? '');
  // Example: "14 Apr"
  return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

const AttendanceTrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const items = payload
    .filter((p) => p && p.dataKey && typeof p.value === 'number')
    .map((p) => ({
      key: p.dataKey,
      name: p.name || p.dataKey,
      value: p.value,
      color: p.color,
    }));

  const total = items.reduce((sum, it) => sum + (Number.isFinite(it.value) ? it.value : 0), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur px-3 py-2 shadow-lg">
      <div className="text-xs font-semibold text-slate-900">
        {formatAttendanceTrendTick(label)} <span className="text-slate-500 font-medium">•</span>{' '}
        <span className="text-slate-700 font-medium">Total:</span> {total.toLocaleString()}
      </div>
      <div className="mt-2 space-y-1.5">
        {items.map((it) => {
          const pct = total > 0 ? Math.round((it.value / total) * 100) : 0;
          return (
            <div key={it.key} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: it.color }}
                />
                <span className="text-slate-700 font-medium truncate">{it.name}</span>
              </div>
              <div className="text-slate-900 font-semibold tabular-nums whitespace-nowrap">
                {it.value.toLocaleString()}{' '}
                <span className="text-slate-500 font-medium">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Memoized KPI Card component - only re-renders when its value changes
const KPICard = memo(({ kpi, index }) => {
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
});

KPICard.displayName = 'KPICard';

const Dashboard = () => {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();

  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [commandCenter, setCommandCenter] = useState(null);

  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    message: '',
    priority: 'Normal',
    sendEmail: false,
    sendPush: false,
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    wfhToday: 0,
    lateCheckIns: 0,
    leaveApprovals: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
    upcomingBirthdays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(new Date());

  // Calendar event modal state
  const [showCalendarEventModal, setShowCalendarEventModal] = useState(false);
  const [selectedCalendarDateKey, setSelectedCalendarDateKey] = useState(null);
  const [quickMessageText, setQuickMessageText] = useState('');
  
  // Employee modal state
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [modalFilterType, setModalFilterType] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const statsEtagRef = useRef('');
  const dashboardLoadInFlightRef = useRef(false);
  const dashboardLastKeyRef = useRef('');
  const calendarLoadInFlightRef = useRef(false);
  const calendarLastKeyRef = useRef('');
  const DASHBOARD_CACHE_KEY = 'hrms_dashboard_cache_v1';
  const CALENDAR_CACHE_KEY = 'hrms_dashboard_calendar_cache_v1';

  const getLocalDateYyyyMmDd = useCallback(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // SSE: refresh attendance counts only when backend says something changed (no polling loop).
  useEffect(() => {
    let es = null;
    let stopped = false;

    const open = async () => {
      try {
        // Resolve company same as other effects
        let company = currentCompany?.name || null;
        if (!company && typeof window !== 'undefined') {
          company =
            sessionStorage.getItem('selectedCompany') ||
            sessionStorage.getItem('adminSelectedCompany') ||
            (companyId ? sessionStorage.getItem(`company_${companyId}`) : null);
        }

        const base = (process.env.NEXT_PUBLIC_API_URL && String(process.env.NEXT_PUBLIC_API_URL).trim()) || '';
        if (!base) return; // no API configured

        const todayKey = getLocalDateYyyyMmDd();
        const isToday = !selectedDate || selectedDate === todayKey;
        if (!isToday) return;

        const url = `${base.replace(/\/+$/, '')}/events/attendance${company ? `?company=${encodeURIComponent(company)}` : ''}`;
        es = new EventSource(url);

        const revalidateStats = async () => {
          if (stopped) return;
          try {
            const p = new URLSearchParams();
            p.append('date', todayKey);
            if (company) p.append('company', company);
            if (companyId) p.append('companyId', companyId);
            if (selectedDepartment && selectedDepartment !== 'all') p.append('department', selectedDepartment);

            const res = await fetch(`/api/hrms-portal/attendance/stats?${p.toString()}`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
                ...(statsEtagRef.current ? { 'If-None-Match': statsEtagRef.current } : {}),
              },
            });
            const et = res.headers.get('etag');
            if (et) statsEtagRef.current = et;
            if (res.status === 304) return;
            if (!res.ok) return;
            const json = await res.json().catch(() => null);
            if (json?.success && json?.data) {
              setStats((prev) => ({
                ...(prev || {}),
                totalEmployees: json.data.totalEmployees || 0,
                activeEmployees: json.data.activeEmployees ?? json.data.totalEmployees ?? 0,
                presentToday: json.data.presentToday || 0,
                absentToday: json.data.absentToday || 0,
                onLeaveToday: json.data.onLeaveToday || 0,
                wfhToday: json.data.onWFHToday || 0,
                lateCheckIns: json.data.lateCheckIns || 0,
                leaveApprovals: json.data.leaveApprovals || 0,
                pendingLeaves: json.data.leaveApprovals || 0,
              }));
            }
          } catch {
            // ignore
          }
        };

        es.addEventListener('attendance', () => {
          // debounce bursts
          setTimeout(revalidateStats, 250);
        });
      } catch {
        // ignore
      }
    };

    open();

    return () => {
      stopped = true;
      try {
        if (es) es.close();
      } catch {
        // ignore
      }
    };
  }, [companyId, currentCompany, selectedDepartment, selectedDate, getLocalDateYyyyMmDd]);

  useEffect(() => {
    // Fetch live data from API
    const loadData = async () => {
      try {
        // Resolve company consistently (prefer currentCompany, then sessionStorage fallbacks)
        let company = currentCompany?.name || null;
        if (!company && typeof window !== 'undefined') {
          company =
            sessionStorage.getItem('selectedCompany') ||
            sessionStorage.getItem('adminSelectedCompany') ||
            (companyId ? sessionStorage.getItem(`company_${companyId}`) : null);
        }

        // Prevent duplicate loads (Next dev strict-mode runs effects twice)
        const dashKey = JSON.stringify({
          companyId: companyId || null,
          company: company || null,
          department: selectedDepartment || 'all',
          date: selectedDate || null,
        });
        if (dashboardLoadInFlightRef.current) return;
        if (dashboardLastKeyRef.current === dashKey) return;
        dashboardLastKeyRef.current = dashKey;

        // Try to reuse cached data (helps when switching tabs away/back)
        if (typeof window !== 'undefined') {
          try {
            const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
            const cached = raw ? JSON.parse(raw) : null;
            const fresh = cached && cached.key === dashKey && Date.now() - (cached.ts || 0) < 5 * 60 * 1000;
            if (fresh && cached.data) {
              if (cached.data.dashboardData) setDashboardData(cached.data.dashboardData);
              if (cached.data.stats) setStats(cached.data.stats);
              if (cached.data.commandCenter) setCommandCenter(cached.data.commandCenter);
              setLoading(false);
              return;
            }
          } catch {
            // ignore cache parse issues
          }
        }

        dashboardLoadInFlightRef.current = true;
        setLoading(true);
        setError(null);

        // Snapshots for session cache (avoid relying on async React state)
        let statsSnapshot = null;
        let dashboardDataSnapshot = null;
        let commandCenterSnapshot = null;
        
        // Build query params
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        if (company) params.append('company', company);
        if (selectedDepartment && selectedDepartment !== 'all') params.append('department', selectedDepartment);
        if (selectedDate) params.append('date', selectedDate);
        const queryString = params.toString();

        // Fetch attendance stats directly (same as Attendance Overview)
        const today = selectedDate || getLocalDateYyyyMmDd();
        const attendanceStatsParams = new URLSearchParams();
        attendanceStatsParams.append('date', today);
        if (company) attendanceStatsParams.append('company', company);
        if (companyId) attendanceStatsParams.append('companyId', companyId);
        
        if (selectedDepartment && selectedDepartment !== 'all') {
          attendanceStatsParams.append('department', selectedDepartment);
        }
        const statsRes = await fetch(`/api/hrms-portal/attendance/stats?${attendanceStatsParams.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...(statsEtagRef.current ? { 'If-None-Match': statsEtagRef.current } : {}),
          },
        });
        
        const resEtag = statsRes.headers.get('etag');
        if (resEtag) statsEtagRef.current = resEtag;

        // Process stats immediately to show dashboard faster (skip if unchanged)
        const statsData = statsRes.status === 304 ? null : (statsRes.ok ? await statsRes.json() : null);
        
        // Set initial stats from attendance stats endpoint
        if (statsData && statsData.success && statsData.data) {
          console.log('[Dashboard] Attendance stats response:', statsData.data);
          statsSnapshot = {
            totalEmployees: statsData.data.totalEmployees || 0,
            activeEmployees: statsData.data.activeEmployees ?? statsData.data.totalEmployees ?? 0,
            presentToday: statsData.data.presentToday || 0,
            absentToday: statsData.data.absentToday || 0,
            onLeaveToday: statsData.data.onLeaveToday || 0,
            wfhToday: statsData.data.onWFHToday || 0,
            lateCheckIns: statsData.data.lateCheckIns || 0,
            leaveApprovals: statsData.data.leaveApprovals || 0,
            todayAttendance: statsData.data.presentToday || 0, // For backward compatibility
            pendingLeaves: statsData.data.leaveApprovals || 0, // Map leaveApprovals to pendingLeaves
            upcomingBirthdays: 0, // Will be fetched separately if needed
          };
          setStats(statsSnapshot);
        } else if (statsRes.status !== 304) {
          console.warn('[Dashboard] Stats response missing success or data:', statsData);
          statsSnapshot = {
            totalEmployees: 0,
            activeEmployees: 0,
            presentToday: 0,
            absentToday: 0,
            onLeaveToday: 0,
            wfhToday: 0,
            lateCheckIns: 0,
            leaveApprovals: 0,
            todayAttendance: 0,
            pendingLeaves: 0,
            upcomingBirthdays: 0,
          };
          setStats(statsSnapshot);
        }
        
        // Fetch remaining dashboard data in parallel (non-critical)
        const [
          monthlyHeadcountsRes,
          recentActivitiesRes,
          upcomingEventsRes,
          upcomingLeavesFestivalsRes,
          complianceRemindersRes,
          checkInsRes,
        ] = await Promise.all([
          fetch(`/api/hrms/dashboard/monthly-headcounts${queryString ? `?${queryString}` : ''}`),
          fetch(`/api/hrms/dashboard/recent-activities${queryString ? `?${queryString}` : ''}`),
          fetch(`/api/hrms/dashboard/upcoming-events${queryString ? `?${queryString}` : ''}`),
          fetch(`/api/hrms/dashboard/upcoming-leaves-festivals${queryString ? `?${queryString}` : ''}`),
          fetch(`/api/hrms/dashboard/compliance-reminders${queryString ? `?${queryString}` : ''}`),
        ]);
        
        // Load check-ins separately after main data loads (non-blocking)
        const checkInsPromise = fetch(`/api/hrms/dashboard/checkins${queryString ? `?${queryString}` : ''}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);

        // Process responses (stats already processed above)
        const monthlyHeadcountsData = monthlyHeadcountsRes.ok ? await monthlyHeadcountsRes.json() : null;
        const recentActivitiesData = recentActivitiesRes.ok ? await recentActivitiesRes.json() : null;
        const upcomingEventsData = upcomingEventsRes.ok ? await upcomingEventsRes.json() : null;
        const upcomingLeavesFestivalsData = upcomingLeavesFestivalsRes.ok ? await upcomingLeavesFestivalsRes.json() : null;
        const complianceRemindersData = complianceRemindersRes.ok ? await complianceRemindersRes.json() : null;
        
        // Process check-ins separately (non-blocking)
        const checkInsData = await checkInsPromise;
        
        // Update stats with check-ins count if available
        // Only update if the value actually changed to prevent unnecessary re-renders
        if (checkInsData?.success && checkInsData?.data?.totalCheckedIn !== undefined) {
          setStats(prevStats => {
            // Only update if the value changed
            if (prevStats && prevStats.todayAttendance !== checkInsData.data.totalCheckedIn) {
              return {
                ...prevStats,
                todayAttendance: checkInsData.data.totalCheckedIn,
              };
            }
            return prevStats;
          });
        }

        // Set dashboard data (stats already set above)
        dashboardDataSnapshot = {
          stats: statsSnapshot || {
            totalEmployees: 0,
            activeEmployees: 0,
            presentToday: 0,
            absentToday: 0,
            onLeaveToday: 0,
            wfhToday: 0,
            lateCheckIns: 0,
            leaveApprovals: 0,
            todayAttendance: 0,
            pendingLeaves: 0,
            upcomingBirthdays: 0,
          },
          monthlyHeadcounts: monthlyHeadcountsData?.success && monthlyHeadcountsData?.data 
            ? monthlyHeadcountsData.data 
            : [],
          recentActivities: recentActivitiesData?.success && recentActivitiesData?.data 
            ? recentActivitiesData.data 
            : [],
          upcomingEvents: upcomingEventsData?.success && upcomingEventsData?.data 
            ? upcomingEventsData.data 
            : [],
          upcomingLeavesAndFestivals: upcomingLeavesFestivalsData?.success && upcomingLeavesFestivalsData?.data 
            ? upcomingLeavesFestivalsData.data 
            : [],
          // birthdayCalendar + workAnniversaryCalendar are loaded in a separate effect
          birthdayCalendar: [],
          workAnniversaryCalendar: [],
          complianceReminders: complianceRemindersData?.success && complianceRemindersData?.data 
            ? complianceRemindersData.data 
            : [],
        };
        setDashboardData(dashboardDataSnapshot);

        // Fetch command center aggregates (department distribution, trends, ratios)
        try {
          const ccParams = new URLSearchParams();
          if (companyId) ccParams.append('companyId', companyId);
          if (company) ccParams.append('company', company);
          if (selectedDepartment && selectedDepartment !== 'all') ccParams.append('department', selectedDepartment);
          if (selectedDate) ccParams.append('date', selectedDate);
          const ccRes = await fetch(`/api/hrms/dashboard/command-center${ccParams.toString() ? `?${ccParams.toString()}` : ''}`, {
            cache: 'no-store',
          });
          const ccJson = ccRes.ok ? await ccRes.json() : null;
          if (ccJson?.success) {
            commandCenterSnapshot = ccJson.data;
            setCommandCenter(ccJson.data);
          }
        } catch (e) {
          // Non-blocking
          console.warn('[Dashboard] command-center fetch failed:', e?.message || e);
        }

        // Save cache (for tab switching/back navigation)
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(
              DASHBOARD_CACHE_KEY,
              JSON.stringify({
                key: dashKey,
                ts: Date.now(),
                data: {
                  dashboardData: dashboardDataSnapshot,
                  stats: statsSnapshot,
                  commandCenter: commandCenterSnapshot,
                },
              })
            );
          } catch {
            // ignore quota issues
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
        // Fallback to minimal data
        setDashboardData({
          stats: { totalEmployees: 0, activeEmployees: 0, presentToday: 0, absentToday: 0, onLeaveToday: 0, wfhToday: 0, lateCheckIns: 0, leaveApprovals: 0, todayAttendance: 0, pendingLeaves: 0, upcomingBirthdays: 0 },
          monthlyHeadcounts: [],
          recentActivities: [],
          upcomingEvents: [],
          upcomingLeavesAndFestivals: [],
          birthdayCalendar: [],
          workAnniversaryCalendar: [],
          complianceReminders: [],
        });
        setStats({ totalEmployees: 0, activeEmployees: 0, presentToday: 0, absentToday: 0, onLeaveToday: 0, wfhToday: 0, lateCheckIns: 0, leaveApprovals: 0, todayAttendance: 0, pendingLeaves: 0, upcomingBirthdays: 0 });
      } finally {
        dashboardLoadInFlightRef.current = false;
        setLoading(false);
      }
    };
    
    // Initial load
    loadData();
  }, [companyId, currentCompany, selectedDepartment, selectedDate]);

  // Calendar data (birthdays + work anniversaries): fetch only when calendar month or filters change.
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        // Resolve company consistently (prefer currentCompany, then sessionStorage fallbacks)
        let company = currentCompany?.name || null;
        if (!company && typeof window !== 'undefined') {
          company =
            sessionStorage.getItem('selectedCompany') ||
            sessionStorage.getItem('adminSelectedCompany') ||
            (companyId ? sessionStorage.getItem(`company_${companyId}`) : null);
        }

        const calKey = JSON.stringify({
          companyId: companyId || null,
          company: company || null,
          department: selectedDepartment || 'all',
          cal: selectedCalendarMonth ? selectedCalendarMonth.toISOString().slice(0, 7) : null,
        });
        if (calendarLoadInFlightRef.current) return;
        if (calendarLastKeyRef.current === calKey) return;
        calendarLastKeyRef.current = calKey;

        // Try cache for calendar (tab switch/back)
        if (typeof window !== 'undefined') {
          try {
            const raw = sessionStorage.getItem(CALENDAR_CACHE_KEY);
            const cached = raw ? JSON.parse(raw) : null;
            const fresh = cached && cached.key === calKey && Date.now() - (cached.ts || 0) < 30 * 60 * 1000;
            if (fresh && cached.data) {
              setDashboardData((prev) => ({
                ...(prev || {}),
                birthdayCalendar: cached.data.birthdayCalendar || [],
                workAnniversaryCalendar: cached.data.workAnniversaryCalendar || [],
              }));
              return;
            }
          } catch {
            // ignore
          }
        }

        calendarLoadInFlightRef.current = true;

        const cal = selectedCalendarMonth || new Date();
        const calAnchor = `${cal.getFullYear()}-${String(cal.getMonth() + 1).padStart(2, '0')}-01`;
        const calendarParams = new URLSearchParams();
        if (companyId) calendarParams.append('companyId', companyId);
        if (company) calendarParams.append('company', company);
        if (selectedDepartment && selectedDepartment !== 'all') calendarParams.append('department', selectedDepartment);
        calendarParams.append('date', calAnchor);
        const calendarQueryString = calendarParams.toString();

        const [birthdaysRes, anniversariesRes] = await Promise.all([
          fetch(`/api/hrms/dashboard/birthdays${calendarQueryString ? `?${calendarQueryString}` : ''}`),
          fetch(`/api/hrms/dashboard/work-anniversaries${calendarQueryString ? `?${calendarQueryString}` : ''}`),
        ]);

        const birthdaysData = birthdaysRes.ok ? await birthdaysRes.json() : null;
        const workAnniversariesData = anniversariesRes.ok ? await anniversariesRes.json() : null;

        const birthdayCalendar = birthdaysData?.success && birthdaysData?.data ? birthdaysData.data : [];
        const workAnniversaryCalendar =
          workAnniversariesData?.success && workAnniversariesData?.data ? workAnniversariesData.data : [];

        setDashboardData((prev) => ({
          ...(prev || {}),
          birthdayCalendar,
          workAnniversaryCalendar,
        }));

        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(
              CALENDAR_CACHE_KEY,
              JSON.stringify({
                key: calKey,
                ts: Date.now(),
                data: { birthdayCalendar, workAnniversaryCalendar },
              })
            );
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.warn('[Dashboard] calendar fetch failed:', e?.message || e);
      } finally {
        calendarLoadInFlightRef.current = false;
      }
    };

    loadCalendar();
  }, [companyId, currentCompany, selectedDepartment, selectedCalendarMonth]);

  // Fetch employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const company = currentCompany?.name || companyId;
        
        const params = new URLSearchParams();
        if (company) {
          params.append('company', company);
        }
        // Keep modal roster aligned with global filters
        if (selectedDepartment && selectedDepartment !== 'all') {
          params.append('department', selectedDepartment);
        }
        // Only active employees should be considered in dashboard drilldowns
        params.append('status', 'active');

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        if (company) {
          headers['x-company'] = company;
        }

        const res = await fetch(`/api/hrms-portal/employees?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setEmployees(json.data.employees || []);
          }
        }
      } catch (err) {
        console.error('Fetch employees error:', err);
      }
    };

    fetchEmployees();
  }, [companyId, currentCompany, selectedDepartment]);

  // Fetch attendance data for employee modal
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        // Get company name from multiple sources
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
        
        const effectiveDate = selectedDate || getLocalDateYyyyMmDd();
        const timestamp = Date.now();
        
        const params = new URLSearchParams();
        params.append('date', effectiveDate);
        params.append('_t', timestamp.toString());
        if (company) {
          params.append('company', company);
        }
        if (selectedDepartment && selectedDepartment !== 'all') {
          params.append('department', selectedDepartment);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        };
        if (company) {
          headers['x-company'] = company;
        }

        const attendanceRes = await fetch(`/api/hrms-portal/attendance?${params.toString()}`, { 
          headers,
          cache: 'no-store',
        });

        if (attendanceRes.ok) {
          const attendanceJson = await attendanceRes.json();
          if (attendanceJson.success) {
            const records = attendanceJson.data.records || [];
            setAttendance(records);
          }
        }
      } catch (err) {
        console.error('Fetch attendance error:', err);
      }
    };

    fetchAttendance();
  }, [companyId, currentCompany, selectedDate, selectedDepartment]);

  // Filter employees by status
  const getFilteredEmployees = (filterType) => {
    const effectiveDate = selectedDate || getLocalDateYyyyMmDd();

    const empKey = (v) => (v == null ? '' : String(v).trim());
    const employeeKeys = (emp) => {
      const keys = new Set();
      const add = (v) => {
        const k = empKey(v);
        if (k) keys.add(k);
      };
      add(emp?.emp_code);
      add(emp?.empCode);
      add(emp?.biometricId);
      add(emp?.employeeCode);
      add(emp?.employeeId);
      add(emp?.id);
      add(emp?._id);
      if (emp?.email && String(emp.email).includes('@')) add(String(emp.email).split('@')[0]);
      return keys;
    };
    const primaryEmployeeKey = (emp) => {
      const keys = employeeKeys(emp);
      return keys.values().next().value || '';
    };
    
    switch (filterType) {
      case 'present':
        const presentRecords = attendance.filter(a => {
          const matchesStatus = a.status === 'present';
          const matchesDate = a.date === effectiveDate;
          return matchesStatus && matchesDate;
        });
        return presentRecords.map(a => ({
          employeeCode: a.biometricId,
          employeeName: a.employeeName,
          department: a.department || 'General',
          status: 'present',
          checkIn: a.timeIn || '--',
          checkOut: a.timeOut || '--',
          isLate: a.isLate || false
        }));
      
      case 'absent':
        // Get all employees and find those not present on selected date
        const presentIds = new Set(
          attendance
            .filter(a => a.status === 'present' && a.date === effectiveDate)
            .map(a => empKey(a.biometricId))
        );
        const onLeaveIds = new Set(
          attendance
            .filter(a => a.status === 'on-leave' && a.date === effectiveDate)
            .map(a => empKey(a.biometricId))
        );
        const wfhIds = new Set(
          attendance
            .filter(a => (a.status === 'wfh' || a.status === 'work-from-home') && a.date === effectiveDate)
            .map(a => empKey(a.biometricId))
        );
        
        return employees
          .filter(emp => {
            const keys = employeeKeys(emp);
            if (keys.size === 0) return false;
            for (const k of keys) {
              if (presentIds.has(k) || onLeaveIds.has(k) || wfhIds.has(k)) return false;
            }
            return true;
          })
          .map(emp => ({
            employeeCode: primaryEmployeeKey(emp),
            employeeName: emp.name || emp.employeeName,
            department: emp.department || 'General',
            status: 'absent',
            checkIn: '--',
            checkOut: '--',
            isLate: false
          }));
      
      case 'wfh':
        return attendance
          .filter(a => (a.status === 'wfh' || a.status === 'work-from-home') && a.date === effectiveDate)
          .map(a => ({
            employeeCode: a.biometricId,
            employeeName: a.employeeName,
            department: a.department || 'General',
            status: 'wfh',
            checkIn: a.timeIn || '--',
            checkOut: a.timeOut || '--',
            isLate: a.isLate || false
          }));
      
      default:
        return [];
    }
  };

  // Handle card click to show employee modal
  const handleCardClick = useCallback((filterType, title) => {
    setModalFilterType(filterType);
    setModalTitle(title);
    setShowEmployeeModal(true);
  }, []);

  // Get status badge styling
  const getStatusBadge = (status, isLate) => {
    if (isLate) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'on-leave':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'wfh':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Export to Excel
  const handleExportToExcel = useCallback(() => {
    try {
      const filteredData = getFilteredEmployees(modalFilterType);
      
      if (filteredData.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Prepare data for Excel
      const excelData = filteredData.map((emp, index) => ({
        'S.No': index + 1,
        'Employee Code': emp.employeeCode || '--',
        'Employee Name': emp.employeeName || '--',
        'Department': emp.department || '--',
        'Check-in': emp.checkIn || '--',
        'Check-out': emp.checkOut || '--',
        'Status': emp.isLate ? 'Late' : (emp.status === 'present' ? 'Present' : emp.status === 'absent' ? 'Absent' : emp.status === 'on-leave' ? 'On Leave' : emp.status === 'wfh' ? 'WFH' : emp.status || '--')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      // Generate filename with current date
      const today = getLocalDateYyyyMmDd();
      const filename = `${modalTitle}_${today}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to Excel');
    }
  }, [modalFilterType, modalTitle, toast, getLocalDateYyyyMmDd]);

  // Process birthdays and anniversaries for calendar
  // IMPORTANT: This hook must be called before any conditional returns
  const getEventsByDate = useMemo(() => {
    const eventsMap = {};

    const parseToLocalYmd = (value) => {
      if (!value) return null;
      // Handle "YYYY-MM-DD" (avoid UTC shifting)
      if (typeof value === 'string') {
        const m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (m) {
          const y = Number(m[1]);
          const mo = Number(m[2]);
          const d = Number(m[3]);
          if (Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d)) {
            return { y, m: mo, d };
          }
        }
      }
      const dt = new Date(value);
      if (Number.isNaN(dt.getTime())) return null;
      return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
    };

    const viewedYear = (selectedCalendarMonth || new Date()).getFullYear();

    const toViewedYearKey = (month, day) => {
      if (!month || !day) return null;
      let m = Number(month);
      let d = Number(day);
      if (!Number.isFinite(m) || !Number.isFinite(d)) return null;
      // Handle Feb 29 in non-leap years (show on Feb 28)
      if (m === 2 && d === 29) {
        const isLeap = new Date(viewedYear, 1, 29).getMonth() === 1;
        if (!isLeap) d = 28;
      }
      return `${viewedYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };
    
    // Process birthdays
    if (dashboardData?.birthdayCalendar && dashboardData.birthdayCalendar.length > 0) {
      dashboardData.birthdayCalendar.forEach((item) => {
        if (item.date || item.birthday) {
          const dateStr = item.date || item.birthday;
          const ymd = parseToLocalYmd(dateStr);
          const dateKey = ymd ? toViewedYearKey(ymd.m, ymd.d) : null;
          if (!dateKey) return;
          
          if (!eventsMap[dateKey]) {
            eventsMap[dateKey] = { birthdays: [], anniversaries: [] };
          }
          eventsMap[dateKey].birthdays.push(item);
        }
      });
    }
    
    // Process work anniversaries
    if (dashboardData?.workAnniversaryCalendar && dashboardData.workAnniversaryCalendar.length > 0) {
      dashboardData.workAnniversaryCalendar.forEach((item) => {
        if (item.date || item.anniversaryDate || item.joinDate) {
          const dateStr = item.date || item.anniversaryDate || item.joinDate;
          const ymd = parseToLocalYmd(dateStr);
          const dateKey = ymd ? toViewedYearKey(ymd.m, ymd.d) : null;
          if (!dateKey) return;
          
          if (!eventsMap[dateKey]) {
            eventsMap[dateKey] = { birthdays: [], anniversaries: [] };
          }
          eventsMap[dateKey].anniversaries.push(item);
        }
      });
    }
    
    return eventsMap;
  }, [dashboardData?.birthdayCalendar, dashboardData?.workAnniversaryCalendar, selectedCalendarMonth]);

  // Get dates with events for calendar marking
  const datesWithEvents = useMemo(() => {
    if (!getEventsByDate || Object.keys(getEventsByDate).length === 0) {
      return [];
    }
    return Object.keys(getEventsByDate).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
  }, [getEventsByDate]);

  // Get events for selected month
  const getEventsForMonth = useMemo(() => {
    if (!getEventsByDate || Object.keys(getEventsByDate).length === 0) {
      return [];
    }
    const month = selectedCalendarMonth.getMonth();
    const year = selectedCalendarMonth.getFullYear();
    const allEvents = [];
    
    Object.keys(getEventsByDate).forEach(dateStr => {
      const [eventYear, eventMonth, eventDay] = dateStr.split('-').map(Number);
      if (eventMonth - 1 === month && eventYear === year) {
        const events = getEventsByDate[dateStr];
        events.birthdays.forEach(birthday => {
          allEvents.push({
            ...birthday,
            type: 'birthday',
            date: new Date(year, month, eventDay)
          });
        });
        events.anniversaries.forEach(anniversary => {
          allEvents.push({
            ...anniversary,
            type: 'anniversary',
            date: new Date(year, month, eventDay)
          });
        });
      }
    });
    
    return allEvents.sort((a, b) => a.date.getDate() - b.date.getDate());
  }, [getEventsByDate, selectedCalendarMonth]);

  // Memoize KPI Cards data to prevent unnecessary re-renders
  // Only re-compute when stats actually change
  // IMPORTANT: This hook must be called before any conditional returns
  const kpiCards = useMemo(() => {
    // Provide default values if stats is not available yet
    const currentStats = stats || {
      totalEmployees: 0,
      activeEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      onLeaveToday: 0,
      wfhToday: 0,
      lateCheckIns: 0,
      leaveApprovals: 0,
      todayAttendance: 0,
      pendingLeaves: 0,
      upcomingBirthdays: 0,
    };
    
    return [
    {
      title: 'Total Employees',
      // Show ACTIVE employees only (per requirement), keep label unchanged.
      value: currentStats.activeEmployees,
      icon: Users,
      clickable: true,
      onClick: () => router.push(`/hrms/${companyId}/employees`),
    },
    {
      title: 'Present',
      value: currentStats.presentToday || currentStats.todayAttendance || 0,
      icon: CheckCircle,
      clickable: true,
      filterType: 'present',
      onClick: () => handleCardClick('present', 'Present Employees'),
    },
    {
      title: 'Absent',
      value: currentStats.absentToday || 0,
      icon: XCircle,
      clickable: true,
      filterType: 'absent',
      onClick: () => handleCardClick('absent', 'Absent Employees'),
    },
    {
      title: 'WFH',
      value: currentStats.wfhToday || 0,
      icon: Home,
      clickable: true,
      filterType: 'wfh',
      onClick: () => handleCardClick('wfh', 'WFH Employees'),
    },
    ];
  }, [stats, companyId, router, handleCardClick]);

  const departmentOptions = useMemo(() => {
    const fromCc = commandCenter?.departmentDistribution?.map((d) => d.department) || [];
    const unique = Array.from(new Set(fromCc)).filter(Boolean).sort((a, b) => a.localeCompare(b));
    return unique;
  }, [commandCenter?.departmentDistribution]);

  const departmentDonutData = useMemo(() => {
    const dist = commandCenter?.departmentDistribution || [];
    return dist.map((d) => ({
      name: d.department,
      value: d.count,
      percentage: d.percentage,
    }));
  }, [commandCenter?.departmentDistribution]);

  const attendanceTrendData = useMemo(() => {
    return (commandCenter?.attendanceTrends || []).map((p) => ({
      date: p.date,
      Present: p.present,
      Absent: p.absent,
      WFH: p.wfh,
      'On Leave': p.onLeave,
    }));
  }, [commandCenter?.attendanceTrends]);

  const statusRatiosData = useMemo(() => {
    return (commandCenter?.statusRatiosByDepartment || []).map((d) => ({
      department: d.department,
      'On-site': d.onSite,
      WFH: d.wfh,
      'On Leave': d.onLeave,
      Absent: d.absent,
      total: d.total,
    }));
  }, [commandCenter?.statusRatiosByDepartment]);

  const donutColors = ['#4f46e5', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedCalendarDateKey) return null;
    return getEventsByDate?.[selectedCalendarDateKey] || null;
  }, [getEventsByDate, selectedCalendarDateKey]);

  const dateToKey = useCallback((date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);

  const monthLabel = useMemo(() => {
    const d = selectedCalendarMonth || new Date();
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [selectedCalendarMonth]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setSelectedCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedCalendarDateKey(dateToKey(now));
  }, [dateToKey]);

  const goPrevMonth = useCallback(() => {
    setSelectedCalendarMonth((prev) => {
      const d = prev ? new Date(prev) : new Date();
      return new Date(d.getFullYear(), d.getMonth() - 1, 1);
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setSelectedCalendarMonth((prev) => {
      const d = prev ? new Date(prev) : new Date();
      return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    });
  }, []);

  const calendarWeeks = useMemo(() => {
    const monthDate = selectedCalendarMonth || new Date();
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Start from Sunday of the week containing the 1st
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    // End on Saturday of the week containing the last day
    const end = new Date(lastOfMonth);
    end.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [selectedCalendarMonth]);

  const dayEventPills = useCallback(
    (date) => {
      const key = dateToKey(date);
      const events = key ? getEventsByDate?.[key] : null;
      const birthdays = events?.birthdays || [];
      const anniversaries = events?.anniversaries || [];

      const items = [
        ...birthdays.map((b) => ({ type: 'birthday', item: b })),
        ...anniversaries.map((a) => ({ type: 'anniversary', item: a })),
      ];

      const maxVisible = 3;
      const visible = items.slice(0, maxVisible);
      const hiddenCount = Math.max(0, items.length - visible.length);

      const pill = (type, item, idx) => {
        const isBirthday = type === 'birthday';
        const bg = isBirthday ? 'bg-pink-100' : 'bg-blue-100';
        const text = isBirthday ? 'text-pink-800' : 'text-blue-800';
        const border = isBirthday ? 'border-pink-200' : 'border-blue-200';
        const label = isBirthday ? 'Birthday' : 'Anniversary';
        const name = item?.name || item?.employeeName || item?.fullName || '';

        return (
          <div
            key={`${type}-${idx}`}
            className={`w-full px-2 py-1 rounded-md border ${bg} ${border} ${text} text-[11px] leading-tight truncate`}
            title={`${label}${name ? `: ${name}` : ''}`}
          >
            <span className="font-semibold">{label}</span>
            {name ? <span className="font-medium">{` • ${name}`}</span> : null}
          </div>
        );
      };

      return (
        <div className="mt-1 space-y-1">
          {visible.map((v, idx) => pill(v.type, v.item, idx))}
          {hiddenCount > 0 ? (
            <div className="text-[11px] text-slate-500 px-2 select-none">+{hiddenCount}</div>
          ) : null}
        </div>
      );
    },
    [dateToKey, getEventsByDate]
  );

  const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const getRelativeTime = (value) => {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Error loading dashboard</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="p-6">No data available</div>;
  }

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

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Command Center view for workforce operations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-4 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              aria-label="Date filter"
            />
          </div>
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              aria-label="Department filter"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Cards - Using memoized components for optimal re-rendering */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={`${kpi.title}-${kpi.value}`}
              className={`group relative overflow-hidden rounded-xl border border-white/30 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(2,6,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-25px_rgba(2,6,23,0.45)] ${
                kpi.clickable ? 'cursor-pointer' : ''
              }`}
              onClick={kpi.clickable && kpi.onClick ? kpi.onClick : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white/50 to-slate-50/60" />
              <div className="relative z-10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white/70 backdrop-blur flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide truncate">
                        {kpi.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">
                        {kpi.value}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    {kpi.active !== undefined && kpi.inactive !== undefined ? (
                      <div className="text-xs text-slate-600">
                        <div className="font-semibold text-slate-900">Active {kpi.active}</div>
                        <div className="text-slate-500">Inactive {kpi.inactive}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">Today</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - 9 cols */}
        <div className="lg:col-span-9 space-y-6">
          {/* Department Distribution + Attendance Trend */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <Card className="border-2 p-6 xl:col-span-5 rounded-xl">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Department Distribution
                  </h2>
                  <p className="text-xs text-slate-600">Headcount share across departments</p>
                </div>
              </div>
              {departmentDonutData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentDonutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={2}
                      >
                        {departmentDonutData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={donutColors[idx % donutColors.length]} />
                        ))}
                      </Pie>
                      <ReTooltip
                        formatter={(value, name, props) => {
                          const pct = props?.payload?.percentage;
                          return [`${value} (${pct ?? 0}%)`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">No department data yet</p>
                  <p className="text-xs text-slate-500 mt-1">Add departments to employee profiles to populate this chart.</p>
                </div>
              )}
            </Card>

            <Card className="border-2 p-6 xl:col-span-7 rounded-xl">
              <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Attendance Trend (7 days)
              </h2>
              <p className="text-xs text-slate-600 mb-4">Present vs WFH vs Leave vs Absent</p>
              {attendanceTrendData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={attendanceTrendData}
                      barCategoryGap={18}
                      barGap={4}
                      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    >
                      {/* Y grid only: faint dashed lines */}
                      <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={formatAttendanceTrendTick}
                        axisLine={{ stroke: '#E2E8F0' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ReTooltip content={<AttendanceTrendTooltip />} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingBottom: 8 }}
                      />
                      {/* Palette + stacking order: Absent acts as neutral background */}
                      <Bar dataKey="Absent" stackId="a" fill="#E5E7EB" />
                      <Bar dataKey="On Leave" stackId="a" fill="#FBBF24" />
                      <Bar dataKey="WFH" stackId="a" fill="#6366F1" />
                      <Bar dataKey="Present" stackId="a" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">No trend data yet</p>
                  <p className="text-xs text-slate-500 mt-1">Attendance points will appear as check-ins and requests are recorded.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Departmental Headcount Heatmap (horizontal bar) */}
          {/* Birthday Calendar & Work Anniversary */}
          <Card className="border-2 p-6 bg-gradient-to-br from-white to-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Birthday Calendar & Work Anniversary</h2>
                <p className="text-xs text-slate-600">View birthdays and work anniversaries on the calendar</p>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm w-full">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={goToToday}
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Today
                    </Button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={goPrevMonth}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={goNextMonth}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                        aria-label="Next month"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                    <div className="text-base font-semibold text-slate-900 ml-2">{monthLabel}</div>
                  </div>
                </div>

                <div className="grid grid-cols-7 border border-slate-200 rounded-xl overflow-hidden">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                    <div
                      key={d}
                      className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold px-3 py-2"
                    >
                      {d}
                    </div>
                  ))}

                  {calendarWeeks.flat().map((date, idx) => {
                    const isOutside = date.getMonth() !== (selectedCalendarMonth || new Date()).getMonth();
                    const key = dateToKey(date);
                    const isSelected = key && selectedCalendarDateKey === key;
                    const isToday = (() => {
                      const now = new Date();
                      return now.toDateString() === date.toDateString();
                    })();

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedCalendarDateKey(key)}
                        className={`min-h-[110px] text-left align-top px-2 py-2 border-b border-r border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                          isOutside ? 'bg-white text-slate-400' : 'bg-white text-slate-900'
                        } ${isSelected ? 'ring-2 ring-indigo-300 relative z-10' : ''}`}
                        style={{
                          borderRightWidth: (idx + 1) % 7 === 0 ? 0 : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`text-xs font-semibold ${
                              isToday ? 'text-indigo-700' : isOutside ? 'text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {date.getDate()}
                          </div>
                        </div>
                        {dayEventPills(date)}
                      </button>
                    );
                  })}
                </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-500 to-pink-400 shadow-sm"></div>
                  <span className="text-xs font-medium text-pink-700">Birthday</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 shadow-sm"></div>
                  <span className="text-xs font-medium text-blue-700">Work Anniversary</span>
                </div>
              </div>
              </div>
            </div>

            {/* Event list moved to compact side detail card above */}
          </Card>

          {/* People Pulse */}
          <Card className="border-2 p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 mb-1">People Pulse</h2>
                <p className="text-xs text-slate-600">Live activity feed</p>
              </div>
            </div>
            {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                {dashboardData.recentActivities.slice(0, 10).map((activity) => {
                  const desc = String(activity.description || '');
                  const nameGuess = desc.split("'s")[0] || desc.split(' joined')[0] || 'Employee';
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {getInitials(nameGuess)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-900">
                            <span className="font-semibold">{nameGuess}</span>{' '}
                            <span className="text-slate-700">{desc.replace(nameGuess, '').trim() || desc}</span>
                          </p>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{getRelativeTime(activity.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                            {activity.type}
                          </span>
                          <span className="text-xs text-slate-500">{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">No recent activity</p>
                <p className="text-xs text-slate-500 mt-1">Check-ins, new hires, and leave actions will appear here.</p>
              </div>
            )}
          </Card>

          {/* Today's Check-Ins removed as requested */}
        </div>

        {/* Right Column - Action Sidebar (sticky) */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6 h-fit">
          {/* Upcoming Leaves & Festivals */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Upcoming Leaves & Festivals</h2>
            <p className="text-xs text-slate-600 mb-4">Upcoming events and holidays</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {dashboardData.upcomingLeavesAndFestivals && dashboardData.upcomingLeavesAndFestivals.length > 0 ? (
                dashboardData.upcomingLeavesAndFestivals.slice(0, 8).map((item) => (
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
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming leaves or festivals</p>
              )}
            </div>
          </Card>

          {/* Talent Pipeline & Events */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Talent Pipeline & Events</h2>
            <p className="text-xs text-slate-600 mb-4">Next 5 interviews, trainings or workshops</p>
            <div className="space-y-3">
              {dashboardData.upcomingEvents && dashboardData.upcomingEvents.length > 0 ? (
                dashboardData.upcomingEvents.slice(0, 5).map((event) => (
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
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </Card>

          {/* Compliance & Reminders */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Compliance & Reminders</h2>
            <p className="text-xs text-slate-600 mb-4">Track critical HR obligations</p>
            <div className="space-y-3">
              {dashboardData.complianceReminders && dashboardData.complianceReminders.length > 0 ? (
                dashboardData.complianceReminders.map((reminder) => {
                  const borderColor = reminder.color === 'red' ? 'border-red-200 bg-red-50/70' 
                    : reminder.color === 'amber' ? 'border-amber-200 bg-amber-50/70' 
                    : 'border-blue-200 bg-blue-50/70';
                  
                  return (
                    <div key={reminder.id} className={`p-3 rounded-xl border-2 ${borderColor} hover:shadow-md transition-all duration-200`}>
                      <p className="text-sm font-medium mb-1">{reminder.title}</p>
                      <p className="text-xs text-slate-600">Due in {reminder.daysRemaining} day{reminder.daysRemaining !== 1 ? 's' : ''}</p>
                      {reminder.daysRemaining != null && reminder.daysRemaining <= 3 && (
                        <div className="mt-2">
                          <Button
                            onClick={() => router.push(`/hrms/${companyId}/payroll`)}
                            className="bg-red-600 text-white hover:bg-red-700 w-full"
                          >
                            Start Task
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="p-3 rounded-xl border-2 border-red-200 bg-red-50/70 hover:shadow-md transition-all duration-200">
                    <p className="text-sm font-medium mb-1">Tax Filing Due</p>
                    <p className="text-xs text-slate-600">Due in 5 days</p>
                  </div>
                  <div className="p-3 rounded-xl border-2 border-amber-200 bg-amber-50/70 hover:shadow-md transition-all duration-200">
                    <p className="text-sm font-medium mb-1">Payroll Processing</p>
                    <p className="text-xs text-slate-600">Due in 3 days</p>
                    <div className="mt-2">
                      <Button
                        onClick={() => router.push(`/hrms/${companyId}/payroll`)}
                        className="bg-red-600 text-white hover:bg-red-700 w-full"
                      >
                        Start Task
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border-2 border-blue-200 bg-blue-50/70 hover:shadow-md transition-all duration-200">
                    <p className="text-sm font-medium mb-1">Quarterly Review</p>
                    <p className="text-xs text-slate-600">Due in 10 days</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="group relative">
          <button
            type="button"
            className="w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center"
            aria-label="Quick actions"
          >
            <Plus className="w-6 h-6" />
          </button>
          <div className="absolute bottom-16 right-0 w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
            <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl p-2">
              <button
                type="button"
                onClick={() => router.push(`/hrms/${companyId}/employees`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-left"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-900">Add Employee</span>
              </button>
              <button
                type="button"
                onClick={() => router.push(`/hrms/${companyId}/payroll`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-left"
              >
                <Coins className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-900">Run Payroll</span>
              </button>
              <button
                type="button"
                onClick={() => router.push(`/hrms/${companyId}/reports`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-left"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-900">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Event Modal */}
      <Modal
        isOpen={showCalendarEventModal}
        onClose={() => setShowCalendarEventModal(false)}
        title="Event details"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              onClick={() => setShowCalendarEventModal(false)}
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              icon={<X className="w-4 h-4" />}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                toast.success('Quick message queued (demo)');
                setQuickMessageText('');
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              icon={<Send className="w-4 h-4" />}
            >
              Quick Message
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            {selectedCalendarDateKey ? `Date: ${selectedCalendarDateKey}` : null}
          </div>
          <div className="space-y-3">
            {eventsForSelectedDate?.birthdays?.length ? (
              <div className="rounded-xl border border-pink-200 bg-pink-50 p-3">
                <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                  <Cake className="w-4 h-4 text-pink-600" />
                  Birthdays
                </div>
                <div className="space-y-2">
                  {eventsForSelectedDate.birthdays.map((b, idx) => (
                    <div key={`b-${idx}`} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{b.name}</div>
                        <div className="text-xs text-slate-600">{b.department}</div>
                      </div>
                      <MessageSquare className="w-4 h-4 text-pink-600" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {eventsForSelectedDate?.anniversaries?.length ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Work anniversaries
                </div>
                <div className="space-y-2">
                  {eventsForSelectedDate.anniversaries.map((a, idx) => (
                    <div key={`a-${idx}`} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{a.name}</div>
                        <div className="text-xs text-slate-600">{a.department}</div>
                      </div>
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={quickMessageText}
              onChange={(e) => setQuickMessageText(e.target.value)}
              placeholder="Write a quick wish or note..."
              rows={4}
            />
          </div>
        </div>
      </Modal>

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

      {/* Employee List Modal */}
      <Modal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        title={modalTitle}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-600">
              Showing {getFilteredEmployees(modalFilterType).length} employee(s)
            </div>
            <Button
              onClick={handleExportToExcel}
              className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              icon={<Download className="w-4 h-4" />}
            >
              Export to Excel
            </Button>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <Table
              columns={[
                {
                  key: 'employeeCode',
                  title: 'Employee Code',
                  render: (value) => <span className="font-mono text-sm font-medium text-slate-900">{value}</span>
                },
                {
                  key: 'employeeName',
                  title: 'Employee Name',
                  render: (value, row) => (
                    <div>
                      <div className="font-medium text-slate-900">{value}</div>
                      <div className="text-xs text-slate-600">{row.department}</div>
                    </div>
                  )
                },
                {
                  key: 'department',
                  title: 'Department',
                  render: (value) => <span className="text-slate-700">{value}</span>
                },
                {
                  key: 'checkIn',
                  title: 'Check-in',
                  render: (value) => <span className="text-slate-700">{value}</span>
                },
                {
                  key: 'checkOut',
                  title: 'Check-out',
                  render: (value) => <span className="text-slate-700">{value}</span>
                },
                {
                  key: 'status',
                  title: 'Status',
                  render: (value, row) => {
                    const displayStatus = row.isLate ? 'Late' : (value === 'present' ? 'Present' : value === 'absent' ? 'Absent' : value === 'on-leave' ? 'On Leave' : value === 'wfh' ? 'WFH' : value);
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(value, row.isLate)}`}>
                        {displayStatus}
                      </span>
                    );
                  }
                }
              ]}
              data={getFilteredEmployees(modalFilterType)}
              emptyMessage="No employees found"
            />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setShowEmployeeModal(false)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
