'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { API_BASE_URL } from '@/lib/utils/constants';
import { getCompanyFromEmail } from '@/lib/config/database.config';
import {
  Bell,
  Clock,
  CreditCard,
  Headset,
  Megaphone,
  Plane,
  Play,
  Square,
  Sparkles,
  Users,
} from 'lucide-react';
// Removed mock data - using live data from backend

const WORKDAY_TARGET_MINUTES = 8 * 60;

const getTodayKey = () => new Date().toISOString().split('T')[0];

// Load initial state - always start fresh, data comes from backend
const loadInitialState = (employeeId = null) => {
  // Don't use localStorage - always fetch from backend per employeeId
  return { 
    date: getTodayKey(), 
    status: 'checked-out', 
    checkInTime: null,
    earliestPunchInTime: null,
    totalMinutes: 0, 
    history: [],
    employeeId: employeeId, // Track which employee this state belongs to
    source: 'manual', // manual | machine
  };
};

const formatDuration = (minutes) => {
  const totalSeconds = Math.floor(minutes * 60);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
};

const formatHmsTimer = (minutes) => {
  const totalSeconds = Math.floor(Math.max(0, minutes) * 60);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatTime = (iso) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-slate-900 transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}

function CircularProgress({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="#7C3AED"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 22 22)"
      />
    </svg>
  );
}

function BentoCard({ className = '', children }) {
  return (
    <Card
      className={[
        'rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-md shadow-xl shadow-slate-100/50 transition',
        'hover:-translate-y-1 hover:shadow-md',
        className,
      ].join(' ')}
    >
      {children}
    </Card>
  );
}

function QuickAction({ icon: Icon, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'group relative z-10 flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-left backdrop-blur-md',
        'transition hover:bg-slate-50 hover:border-slate-300',
        disabled ? 'pointer-events-none opacity-50' : '',
      ].join(' ')}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-slate-900">{label}</span>
    </button>
  );
}

/** Backend totalMinutes includes the open session; strip it so workedMinutes can add live elapsed from checkInTime. */
function baseMinutesFromCheckinStatus({ status, checkInTime, totalMinutes }) {
  let baseMinutes = totalMinutes || 0;
  if (status === 'checked-in' && checkInTime) {
    try {
      const checkInTimeDate = new Date(checkInTime);
      const nowDate = new Date();
      const currentSessionMinutes = Math.max(0, (nowDate.getTime() - checkInTimeDate.getTime()) / 60000);
      baseMinutes = Math.max(0, (totalMinutes || 0) - currentSessionMinutes);
    } catch (e) {
      console.error('Error calculating base minutes:', e);
      baseMinutes = totalMinutes || 0;
    }
  }
  return baseMinutes;
}

const EmployeePortalHome = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [timeState, setTimeState] = useState(() => loadInitialState());
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [departmentTeam, setDepartmentTeam] = useState(null);
  const [loadingDepartmentTeam, setLoadingDepartmentTeam] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [now, setNow] = useState(new Date());
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('activities'); // activities | feeds | profile
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Available'); // Available | In a Meeting | OOO
  const [mood, setMood] = useState(null); // 1-5
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState(null); // { type: 'success'|'error', text: string }
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    from: getTodayKey(),
    to: getTodayKey(),
    reason: '',
  });

  // Company for API calls: profile first (any tenant), then email domain (legacy)
  useEffect(() => {
    if (!user) return;
    const fromProfile = user.company && String(user.company).trim();
    if (fromProfile) {
      setSelectedCompany(fromProfile);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedCompany', fromProfile);
      }
      return;
    }
    if (user.email) {
      const company = getCompanyFromEmail(user.email);
      if (company) {
        setSelectedCompany(company);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('selectedCompany', company);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date(Date.now() + serverOffsetMs)), 1000);
    return () => clearInterval(interval);
  }, [serverOffsetMs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('employee-time-state', JSON.stringify(timeState));
    }
  }, [timeState]);

  // Sync client clock against server time (anti-tamper)
  useEffect(() => {
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
      } catch (e) {
        // best-effort; fallback to local time
      }
    };

    sync();
    const interval = setInterval(sync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const workedMinutes = useMemo(() => {
    // Only calculate if this state belongs to the current user
    if (!timeState || timeState.employeeId !== user?.employeeId) {
      return 0;
    }
    
    let minutes = timeState.totalMinutes || 0;
    
    // Check if checked in and has valid check-in time
    if (timeState.status === 'checked-in' && timeState.checkInTime) {
      try {
        const checkInDate = new Date(timeState.checkInTime);
        const nowDate = new Date(now);
        
        if (!isNaN(checkInDate.getTime()) && !isNaN(nowDate.getTime())) {
          const elapsedMs = nowDate.getTime() - checkInDate.getTime();
          const elapsedMinutes = elapsedMs / 60000;
          
          // Calculate total: base minutes (accumulated from previous sessions) + current session elapsed time
          // timeState.totalMinutes contains base minutes (without current session) - extracted from backend responses
          if (elapsedMinutes > 0) {
            const baseMinutes = timeState.totalMinutes || 0;
            minutes = baseMinutes + elapsedMinutes;
          }
        } else {
          console.warn('Invalid date in timer calculation', {
            checkInTime: timeState.checkInTime,
            checkInValid: !isNaN(checkInDate.getTime()),
            nowValid: !isNaN(nowDate.getTime())
          });
        }
      } catch (e) {
        console.error('Error calculating worked minutes:', e, {
          checkInTime: timeState.checkInTime,
          now: now.toISOString(),
          status: timeState.status
        });
      }
    }
    
    return Math.max(0, minutes);
  }, [timeState, now, user?.employeeId]);

  const employeeProfile = useMemo(() => {
    if (!user) return null;
    return {
      designation: user.department || 'Team Member',
      department: user.department || '',
      name: user.name || '',
      email: user.email || '',
      employeeId: user.employeeId || '',
    };
  }, [user]);

  // Weekly attendance strip (7 days, includes Weekend)
  useEffect(() => {
    const fetchWeekly = async () => {
      if (!user?.employeeId) return;
      try {
        setLoadingWeekly(true);
        const token = localStorage.getItem('auth_token');
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

        const params = new URLSearchParams();
        params.append('employeeId', user.employeeId);
        if (user.empCode) params.append('empCode', user.empCode);
        if (company) params.append('company', company);
        params.append('timeframe', '7d');

        const res = await fetch(`/api/portals/employee-portal/attendance?${params.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        const last7 = json?.data?.attendanceLast7Days || [];
        const ordered = [...last7].sort((a, b) => (a.date > b.date ? 1 : -1));
        setWeeklyAttendance(ordered.slice(-7));
      } catch (e) {
        // ignore
      } finally {
        setLoadingWeekly(false);
      }
    };
    fetchWeekly();
  }, [user?.employeeId, user?.empCode, selectedCompany]);

  // Fetch check-in status from backend - runs on mount and when employeeId changes
  useEffect(() => {
    const fetchCheckInStatus = async () => {
      if (!user?.employeeId) return;
      try {
        const token = localStorage.getItem('auth_token');
        // Get company from state or sessionStorage
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        
        // Build API URL - use Next.js API route as proxy
        let apiUrl = `/api/portals/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
        if (company) {
          apiUrl += `&company=${encodeURIComponent(company)}`;
        }
        
        const res = await fetch(apiUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            const { status, checkInTime, totalMinutes, earliestPunchInTime } = json.data;
            const source = json.data?.source || 'manual';
            const baseMinutes = baseMinutesFromCheckinStatus({
              status,
              checkInTime,
              totalMinutes,
            });
            
            setTimeState((prev) => ({
              ...prev,
              status: status || 'checked-out',
              checkInTime: checkInTime || null,
              earliestPunchInTime: earliestPunchInTime || null,
              totalMinutes: baseMinutes, // Base minutes for checked-in, full totalMinutes for checked-out
              date: getTodayKey(),
              employeeId: user.employeeId, // Ensure employeeId is set
              source,
            }));
          }
        }
      } catch (err) {
        console.error('Check-in status fetch failed', err);
      }
    };
    
    fetchCheckInStatus();
    
    // Refresh check-in status every 30 seconds to keep it in sync
    const interval = setInterval(fetchCheckInStatus, 30000);
    return () => clearInterval(interval);
  }, [user?.employeeId, selectedCompany]); // Re-run when employeeId or company changes

  // Fetch dashboard data from backend (fallback to static if unavailable)
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        setLoadingData(true);
        const token = localStorage.getItem('auth_token');
        // Get company from state or sessionStorage
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        
        // Build API URL with company parameter
        let apiUrl = `${API_BASE_URL}/employee-portal/dashboard?employeeId=${encodeURIComponent(user.employeeId || 'default')}`;
        if (company) {
          apiUrl += `&company=${encodeURIComponent(company)}`;
        }
        
        const res = await fetch(apiUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setDashboardData(json.data);
          }
        } else {
          console.warn('Dashboard API returned non-200', res.status);
        }
      } catch (err) {
        console.error('Dashboard fetch failed', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchDashboard();
  }, [user, selectedCompany]);

  // Same-department team list (P/A; managers also see check-in time)
  useEffect(() => {
    const fetchDepartmentTeam = async () => {
      if (!user?.employeeId) return;
      try {
        setLoadingDepartmentTeam(true);
        const token = localStorage.getItem('auth_token');
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        const params = new URLSearchParams();
        params.append('employeeId', user.employeeId);
        if (user?.id) params.append('userId', user.id);
        if (company) params.append('company', company);

        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
        if (company) headers['x-company'] = company;

        const res = await fetch(`/api/portals/employee-portal/department-team?${params.toString()}`, { headers });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success && json?.data) {
          setDepartmentTeam(json.data);
        } else {
          setDepartmentTeam(null);
        }
      } catch (err) {
        console.error('Department team fetch failed', err);
        setDepartmentTeam(null);
      } finally {
        setLoadingDepartmentTeam(false);
      }
    };

    fetchDepartmentTeam();
    const interval = setInterval(fetchDepartmentTeam, 60000);
    return () => clearInterval(interval);
  }, [user?.employeeId, user?.id, selectedCompany]);

  // Fetch check-in history from backend
  useEffect(() => {
    const fetchCheckInHistory = async () => {
      if (!user?.employeeId) return;
      try {
        setLoadingHistory(true);
        const token = localStorage.getItem('auth_token');
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        
        let apiUrl = `/api/portals/employee-portal/checkin/history?employeeId=${encodeURIComponent(user.employeeId)}&limit=10`;
        if (company) {
          apiUrl += `&company=${encodeURIComponent(company)}`;
        }
        
        const res = await fetch(apiUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data?.history) {
            setCheckInHistory(json.data.history);
          }
        }
      } catch (err) {
        console.error('Check-in history fetch failed', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchCheckInHistory();
  }, [user?.employeeId, selectedCompany]);

  // Fetch pending leave requests count
  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      if (!user?.employeeId) return;
      try {
        const token = localStorage.getItem('auth_token');
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        
        const params = new URLSearchParams();
        params.append('employeeId', user.employeeId);
        if (company) {
          params.append('company', company);
        }

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        if (company) {
          headers['x-company'] = company;
        }

        // Use Next.js API proxy route
        const res = await fetch(
          `/api/portals/employee-portal/attendance-requests?${params.toString()}`,
          { headers }
        );
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            // Count pending time-off requests
            const pendingCount = (json.data.requests || [])
              .filter(req => req.type === 'time-off' && req.status?.toLowerCase() === 'pending')
              .length;
            setPendingRequestsCount(pendingCount);
            console.log('[Employee Portal Dashboard] Pending requests count:', pendingCount);
          }
        }
      } catch (err) {
        console.error('[Employee Portal Dashboard] Failed to fetch pending requests count', err);
      }
    };
    
    fetchPendingRequestsCount();
    
    // Refresh every 30 seconds to get latest count
    const interval = setInterval(fetchPendingRequestsCount, 30000);
    return () => clearInterval(interval);
  }, [user?.employeeId, selectedCompany]);

  const greeting = useMemo(() => {
    const hours = now.getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!leaveOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [leaveOpen]);

  const handleToggleCheck = async () => {
    if (!user?.employeeId) {
      console.error('Employee ID not available');
      alert('Employee ID not found. Please log in again.');
      return;
    }

    // Ensure we're working with the correct employee's data
    if (timeState.employeeId !== user.employeeId) {
      console.warn('Employee ID mismatch, refreshing state...');
      // Trigger a refresh
      const fetchCheckInStatus = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          // Get company from state or sessionStorage
          const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
          
          // Build API URL with company parameter
        let apiUrl = `/api/portals/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
        if (company) {
          apiUrl += `&company=${encodeURIComponent(company)}`;
        }
        
        const res = await fetch(apiUrl, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json?.data) {
              const { status, checkInTime, totalMinutes, earliestPunchInTime } = json.data;
              const source = json.data?.source || 'manual';
              const baseMinutes = baseMinutesFromCheckinStatus({
                status,
                checkInTime,
                totalMinutes,
              });
              setTimeState({
                date: getTodayKey(),
                status: status || 'checked-out',
                checkInTime: checkInTime || null,
                earliestPunchInTime: earliestPunchInTime || null,
                totalMinutes: baseMinutes,
                history: [],
                employeeId: user.employeeId,
                source,
              });
            }
          }
        } catch (err) {
          console.error('Failed to refresh check-in status', err);
        }
      };
      await fetchCheckInStatus();
      return; // Wait for next click after refresh
    }

    const token = localStorage.getItem('auth_token');
    const isCheckingIn = timeState.status === 'checked-out';

    // Only allow manual checkout (biometric/machine sessions are not stored in portal checkins collection).
    if (!isCheckingIn && timeState.source !== 'manual') {
      alert('You are checked in via biometric. Manual check-out is not available.');
      return;
    }
    
    // Get company from state or sessionStorage
    const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

    try {
      const endpoint = isCheckingIn ? '/checkin' : '/checkout';
      
      // Build API URL - use Next.js API route as proxy
      let apiUrl = `/api/portals/employee-portal${endpoint}`;
      if (company) {
        apiUrl += `?company=${encodeURIComponent(company)}`;
      }
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ employeeId: user.employeeId }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.success) {
          const timestamp = new Date().toISOString();
          
          if (isCheckingIn) {
            // Immediately update state with check-in time to start the timer
            // Use the checkInTime from response if available, otherwise use current timestamp
            const checkInTimeFromResponse = json.data?.checkInTime || timestamp;
            
            // Ensure checkInTime is a valid ISO string
            let validCheckInTime = checkInTimeFromResponse;
            try {
              // Validate and normalize the date
              const checkInDate = new Date(checkInTimeFromResponse);
              if (isNaN(checkInDate.getTime())) {
                // If invalid, use current time
                validCheckInTime = new Date().toISOString();
              } else {
                validCheckInTime = checkInDate.toISOString();
              }
            } catch (e) {
              validCheckInTime = new Date().toISOString();
            }
            
            console.log('Setting check-in time:', validCheckInTime);
            
            // Get accumulated totalMinutes from response if available (for resuming after checkout)
            const accumulatedMinutes = json.data?.totalMinutes || 0;
            
            // Force immediate state update to start timer
            // Use functional update to ensure React detects the change
            const newState = {
              date: getTodayKey(),
              status: 'checked-in',
              checkInTime: validCheckInTime,
              earliestPunchInTime: null,
              totalMinutes: accumulatedMinutes, // Resume from accumulated time, not 0
              history: [{ action: 'Checked in', time: timestamp }],
              employeeId: user.employeeId,
              source: 'manual',
            };
            
            console.log('🔵 CHECKING IN - Setting state:', newState);
            
            // Use React.startTransition or flushSync to ensure immediate update
            // First update timeState
            setTimeState(newState);
            
            // Then immediately update now in next tick to force recalculation
            setTimeout(() => {
              const currentNow = new Date();
              console.log('🔵 CHECKING IN - Setting now:', currentNow.toISOString());
              setNow(currentNow);
            }, 0);
            
            // Also update now immediately
            setNow(new Date());
            
            // Then refresh from backend to ensure consistency after a short delay
            setTimeout(async () => {
              try {
                let statusUrl = `/api/portals/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
                if (company) {
                  statusUrl += `&company=${encodeURIComponent(company)}`;
                }
                
                const statusRes = await fetch(statusUrl, {
                  headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                });
                
                if (statusRes.ok) {
                  const statusJson = await statusRes.json();
                  if (statusJson?.success && statusJson?.data) {
                    const { status, checkInTime, totalMinutes, earliestPunchInTime } = statusJson.data;
                    const source = statusJson.data?.source || 'manual';
                    // Only update if we got a valid checkInTime from backend
                    if (checkInTime) {
                      const baseMinutes = baseMinutesFromCheckinStatus({
                        status,
                        checkInTime,
                        totalMinutes,
                      });
                      setTimeState(prev => ({
                        ...prev,
                        status: status || 'checked-in',
                        checkInTime: checkInTime,
                        earliestPunchInTime: earliestPunchInTime || null,
                        totalMinutes: baseMinutes, // Store base minutes (accumulated from previous sessions only)
                        employeeId: user.employeeId,
                        source,
                      }));
                    }
                  }
                }
              } catch (refreshErr) {
                console.error('Failed to refresh status after check-in:', refreshErr);
              }
            }, 1000);
          } else {
            // For check-out, refresh status from backend
            const refreshStatus = async () => {
              try {
                let statusUrl = `/api/portals/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
                if (company) {
                  statusUrl += `&company=${encodeURIComponent(company)}`;
                }
                
                const statusRes = await fetch(statusUrl, {
                  headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                });
                
                if (statusRes.ok) {
                  const statusJson = await statusRes.json();
                  if (statusJson?.success && statusJson?.data) {
                    const { status, checkInTime, totalMinutes } = statusJson.data;
                    const sessionHours = totalMinutes / 60;
                    setTimeState({
                      date: getTodayKey(),
                      status: 'checked-out',
                      checkInTime: null,
                      earliestPunchInTime: null,
                      totalMinutes: totalMinutes,
                      history: [
                        { action: 'Checked out', time: timestamp, meta: `${sessionHours.toFixed(1)} hrs logged` },
                      ],
                      employeeId: user.employeeId,
                      source: 'manual',
                    });
                  }
                }
              } catch (refreshErr) {
                console.error('Failed to refresh status after check-out:', refreshErr);
              }
            };
            
            await refreshStatus();
          }
          
          // Refresh check-in history after check-in/out (for both cases)
          const refreshHistory = async () => {
            try {
              const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
              let historyUrl = `/api/portals/employee-portal/checkin/history?employeeId=${encodeURIComponent(user.employeeId)}&limit=10`;
              if (company) {
                historyUrl += `&company=${encodeURIComponent(company)}`;
              }
              
              const historyRes = await fetch(historyUrl, {
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              });
              
              if (historyRes.ok) {
                const historyJson = await historyRes.json();
                if (historyJson?.success && historyJson?.data?.history) {
                  setCheckInHistory(historyJson.data.history);
                }
              }
            } catch (err) {
              console.error('Failed to refresh check-in history', err);
            }
          };
          
          await refreshHistory();
        } else {
          alert(json.error || `Failed to ${isCheckingIn ? 'check in' : 'check out'}`);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || `Failed to ${isCheckingIn ? 'check in' : 'check out'}`);
      }
    } catch (err) {
      console.error(`Check-${isCheckingIn ? 'in' : 'out'} error:`, err);
      alert(`Failed to ${isCheckingIn ? 'check in' : 'check out'}. Please try again.`);
    }
  };

  // Use live data from backend, show empty arrays if data not loaded yet
  const announcements = dashboardData?.announcements || [];
  const quickStats = {
    ...(dashboardData?.quickStats || {
      leaveBalance: 0,
      upcomingShift: 'Not scheduled',
      lastPayout: 'N/A',
    }),
    pendingRequests: pendingRequestsCount, // Use real-time pending requests count
  };

  const performance = dashboardData?.performanceSnapshot || null;
  const performancePct = Number(performance?.percent ?? performance?.progress ?? 0);
  const events = dashboardData?.upcomingEvents || dashboardData?.holidays || [];

  const timeLogPendingCount = Number(dashboardData?.timeLogPendingCount ?? dashboardData?.pendingTimeLogs ?? 0);
  const showTimeLogStrip = Number.isFinite(timeLogPendingCount) && timeLogPendingCount > 0;

  const departmentTeamMembers = Array.isArray(departmentTeam?.members) ? departmentTeam.members : [];
  const isDeptManager = Boolean(departmentTeam?.isManager);
  const deptPresentCount = departmentTeam?.presentCount ?? 0;
  const deptAbsentCount = departmentTeam?.absentCount ?? 0;

  const submitLeaveRequest = async () => {
    if (!user?.employeeId) return;
    if (!leaveForm.leaveType || !leaveForm.from || !leaveForm.to || !leaveForm.reason.trim()) {
      setLeaveMessage({ type: 'error', text: 'Please fill all fields.' });
      return;
    }

    try {
      setLeaveSubmitting(true);
      setLeaveMessage(null);
      const token = localStorage.getItem('auth_token');
      const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      if (company) headers['x-company'] = company;

      const res = await fetch('/api/portals/employee-portal/attendance-request', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          employeeId: user.employeeId,
          type: 'time-off',
          leaveType: leaveForm.leaveType,
          dateRange: `${leaveForm.from} to ${leaveForm.to}`,
          reason: leaveForm.reason.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        setLeaveMessage({ type: 'error', text: json?.error || 'Failed to submit leave request.' });
        return;
      }
      setLeaveMessage({ type: 'success', text: 'Leave request submitted.' });
      // Reset but keep dates convenient.
      setLeaveForm((prev) => ({ ...prev, reason: '' }));
      setTimeout(() => setLeaveOpen(false), 700);
    } catch (e) {
      setLeaveMessage({ type: 'error', text: 'Failed to submit leave request.' });
    } finally {
      setLeaveSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-6 backdrop-blur-md shadow-xl shadow-slate-100/50">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <span className="text-lg font-semibold">{String(employeeProfile?.name || 'U').slice(0, 1).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-600">{greeting},</p>
              <p className="truncate text-2xl font-semibold tracking-tight text-slate-900">{employeeProfile?.name || user?.name}</p>
              <p className="mt-1 text-sm text-slate-500">Here is your pulse check for today.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  ID: {employeeProfile?.employeeId || '—'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {employeeProfile?.designation || 'Team Member'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/60 p-1 backdrop-blur-md">
              {['Available', 'In a Meeting', 'OOO'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCurrentStatus(s)}
                  className={[
                    'rounded-xl px-3 py-2 text-xs font-semibold transition',
                    currentStatus === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <Sparkles className="h-4 w-4" />
              <span>{currentStatus}</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={Plane} label="Apply Leave" onClick={() => setLeaveOpen(true)} />
          <QuickAction icon={Headset} label="Company policy" onClick={() => {}} />
          <QuickAction icon={CreditCard} label="Payslip" onClick={() => router.push('/employee-portal/payslip')} />
        </div>
      </div>

      {/* Bento */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Attendance (tall) */}
        <BentoCard className="relative overflow-hidden lg:col-span-4 lg:row-span-2">
          <div className="relative p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attendance</p>
                <p className="mt-2 font-mono text-4xl font-semibold tracking-tight text-slate-900">{formatHmsTimer(workedMinutes)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {timeState.status === 'checked-in' && timeState.checkInTime ? (
                    <>Checked in at {formatTime(timeState.checkInTime)}</>
                  ) : (
                    'Not checked in yet'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <CircularProgress value={Math.min(100, (workedMinutes / WORKDAY_TARGET_MINUTES) * 100)} />
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-500">Target</p>
                  <p className="text-sm font-semibold text-slate-900">8h</p>
                  <p className="text-[11px] text-slate-500">{Math.round((workedMinutes / WORKDAY_TARGET_MINUTES) * 100)}%</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {timeState.status === 'checked-in' && timeState.source !== 'manual' ? (
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  Checked in via biometric
                </div>
              ) : (
                <Button
                  onClick={handleToggleCheck}
                  className={[
                    'w-full rounded-2xl shadow-sm',
                    timeState.status === 'checked-in'
                      ? 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
                      : '',
                  ].join(' ')}
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
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-900">My team</p>
                  </div>
                  {departmentTeam?.department ? (
                    <p className="mt-0.5 truncate text-xs text-slate-500">{departmentTeam.department}</p>
                  ) : null}
                </div>
                <Badge className="shrink-0 bg-slate-50 text-slate-700">
                  {loadingDepartmentTeam
                    ? 'Loading…'
                    : departmentTeamMembers.length > 0
                      ? `${deptPresentCount} P · ${deptAbsentCount} A`
                      : '—'}
                </Badge>
              </div>

              <div className="mt-3 max-h-52 space-y-1.5 overflow-y-auto">
                {loadingDepartmentTeam ? (
                  <p className="text-xs text-slate-500">Loading team…</p>
                ) : departmentTeamMembers.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {departmentTeam?.summary || 'No colleagues in your department yet.'}
                  </p>
                ) : (
                  departmentTeamMembers.map((member) => {
                    const isPresent = member.attendanceStatus === 'present' || member.statusCode === 'P';
                    const statusCode = member.statusCode || (isPresent ? 'P' : 'A');
                    return (
                      <div
                        key={member.employeeId}
                        className={[
                          'flex items-center gap-2 rounded-xl border px-2.5 py-2',
                          member.isSelf ? 'border-purple-200 bg-purple-50/40' : 'border-slate-100 bg-slate-50/50',
                        ].join(' ')}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                          {String(member.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-900">
                            {member.name}
                            {member.isSelf ? (
                              <span className="ml-1 font-normal text-slate-500">(You)</span>
                            ) : null}
                          </p>
                        </div>
                        <span
                          className={[
                            'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800',
                          ].join(' ')}
                          title={isPresent ? 'Present' : 'Absent'}
                        >
                          {statusCode}
                        </span>
                        {isDeptManager ? (
                          <span className="w-16 shrink-0 text-right text-[11px] font-medium text-slate-600">
                            {member.checkInTime || '—'}
                          </span>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        </BentoCard>

        {/* Work schedule */}
        <BentoCard className="lg:col-span-8">
          <div className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Work schedule</p>
                <p className="text-sm text-slate-500">This week at a glance</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Bell className="h-4 w-4" />
                <span>{loadingData ? 'Syncing…' : 'Up to date'}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2">
              {loadingWeekly ? (
                <div className="col-span-7 text-sm text-slate-500">Loading week…</div>
              ) : (
                (weeklyAttendance.length ? weeklyAttendance : Array.from({ length: 7 }).map((_, idx) => ({ day: '', status: '—', date: `_${idx}` }))).map((d) => {
                  const status = String(d.status || '—');
                  const todayName = now.toLocaleDateString([], { weekday: 'short' });
                  const isToday = (d.day || '').toLowerCase() === todayName.toLowerCase();

                  const pill =
                    status === 'Present'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : status === 'Weekend'
                        ? 'bg-slate-50 text-slate-600 border-slate-200'
                        : status === 'Absent'
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-white text-slate-500 border-slate-200';

                  return (
                    <div
                      key={d.date}
                      className={[
                        'rounded-2xl border bg-white p-3 transition',
                        isToday ? 'border-purple-300 shadow-[0_0_0_3px_rgba(168,85,247,0.16)]' : 'border-slate-200',
                      ].join(' ')}
                    >
                      <p className="text-xs font-semibold text-slate-700">{d.day || '—'}</p>
                      <p className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${pill}`}>
                        {status}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </BentoCard>

        {/* Announcements (wide) */}
        <BentoCard className="lg:col-span-8">
          <div className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Company announcements</p>
                <p className="text-sm text-slate-500">What’s new today</p>
              </div>
              <Badge className="bg-purple-50 text-purple-700">New</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(announcements || []).slice(0, 4).map((a) => (
                <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Megaphone className="h-3.5 w-3.5" />
                    <span>{a.date}</span>
                    <span>•</span>
                    <span className="capitalize">{a.type}</span>
                    <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      New
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.audience}</p>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No announcements yet.
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Right column widgets */}
        <div className="grid gap-6 lg:col-span-4">
          <BentoCard>
            <div className="p-5">
              <p className="text-sm font-semibold text-slate-900">Task snapshot</p>
              <p className="text-sm text-slate-500">Pending items</p>
              <button
                type="button"
                onClick={() => router.push('/employee-portal/requests')}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
              >
                <p className="text-xs text-slate-500">Pending requests</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{quickStats.pendingRequests}</p>
                <p className="text-xs text-slate-500">Awaiting approvals</p>
              </button>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="p-5">
              <p className="text-sm font-semibold text-slate-900">Mood tracker</p>
              <p className="text-sm text-slate-500">How are you feeling today?</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[
                  { v: 1, label: '😞' },
                  { v: 2, label: '😐' },
                  { v: 3, label: '🙂' },
                  { v: 4, label: '😄' },
                  { v: 5, label: '🔥' },
                ].map((m) => (
                  <button
                    key={m.v}
                    type="button"
                    onClick={() => setMood(m.v)}
                    className={[
                      'flex h-12 items-center justify-center rounded-2xl border text-lg transition',
                      mood === m.v ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-white hover:bg-slate-50',
                    ].join(' ')}
                    aria-label={`Mood ${m.v}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {mood ? <p className="mt-3 text-xs text-slate-500">Saved for today.</p> : null}
            </div>
          </BentoCard>

          <BentoCard>
            <div className="p-5">
              <p className="text-sm font-semibold text-slate-900">Upcoming holidays & events</p>
              <p className="text-sm text-slate-500">Next up</p>
              <div className="mt-4 space-y-2">
                {(events || []).slice(0, 4).map((e, idx) => (
                  <div key={e.id || idx} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{e.title || e.name || 'Event'}</p>
                      <p className="text-xs text-slate-500">{e.date || e.when || '—'}</p>
                    </div>
                    <Badge className="bg-slate-50 text-slate-700">{e.type || 'Info'}</Badge>
                  </div>
                ))}
                {(!events || events.length === 0) && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No events configured yet.
                  </div>
                )}
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="p-5">
              <p className="text-sm font-semibold text-slate-900">Performance snapshot</p>
              <p className="text-sm text-slate-500">{performance?.label || 'Monthly goals'}</p>
              <div className="mt-4">
                <ProgressBar value={Number.isFinite(performancePct) ? performancePct : 0} />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{Number.isFinite(performancePct) ? `${Math.round(performancePct)}%` : '—'}</span>
                  <span>{performance?.meta || 'Keep going'}</span>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </section>

      {showTimeLogStrip ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Time Log reminder</p>
            <Badge className="bg-amber-50 text-amber-700">{timeLogPendingCount} pending</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">Please complete your time logs for today.</p>
        </div>
      ) : null}

      {leaveOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setLeaveOpen(false)}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-lg font-semibold text-slate-900">Leave request</p>
                <p className="text-sm text-slate-500">Submit time-off for approval.</p>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={() => setLeaveOpen(false)}>
                Close
              </Button>
            </div>

            <div className="px-6 py-6">
              {leaveMessage ? (
                <div
                  className={[
                    'mb-4 rounded-2xl border px-4 py-3 text-sm',
                    leaveMessage.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800',
                  ].join(' ')}
                >
                  {leaveMessage.text}
                </div>
              ) : null}

              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Leave type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, leaveType: e.target.value }))}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  >
                    {['Casual Leave', 'Sick Leave', 'Earned Leave', 'Compensatory Off', 'LOP', 'Time Off'].map((t) => (
                      <option key={t} value={t}>
                        {t === 'Time Off' ? 'Leave' : t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">From</label>
                    <input
                      type="date"
                      value={leaveForm.from}
                      onChange={(e) => setLeaveForm((p) => ({ ...p, from: e.target.value }))}
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">To</label>
                    <input
                      type="date"
                      value={leaveForm.to}
                      onChange={(e) => setLeaveForm((p) => ({ ...p, to: e.target.value }))}
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Reason</label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                    placeholder="Add a short note for your manager"
                  />
                </div>

                <Button
                  onClick={submitLeaveRequest}
                  className="h-11 w-full rounded-2xl"
                  disabled={leaveSubmitting}
                >
                  {leaveSubmitting ? 'Submitting…' : 'Submit for approval'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EmployeePortalHome;
