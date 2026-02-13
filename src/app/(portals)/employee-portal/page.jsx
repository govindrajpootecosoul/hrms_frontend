'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { Progress } from '@/components/common/Skeleton';
import { API_BASE_URL } from '@/lib/utils/constants';
import { getCompanyFromEmail } from '@/lib/config/database.config';
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
    totalMinutes: 0, 
    history: [],
    employeeId: employeeId // Track which employee this state belongs to
  };
};

const formatDuration = (minutes) => {
  const totalSeconds = Math.floor(minutes * 60);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
};

const formatTime = (iso) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const EmployeePortalHome = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [timeState, setTimeState] = useState(() => loadInitialState());
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [now, setNow] = useState(new Date());
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Auto-detect company from user email
  useEffect(() => {
    if (user?.email) {
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
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('employee-time-state', JSON.stringify(timeState));
    }
  }, [timeState]);

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

  // Fetch check-in status from backend - runs on mount and when employeeId changes
  useEffect(() => {
    const fetchCheckInStatus = async () => {
      if (!user?.employeeId) return;
      try {
        const token = localStorage.getItem('auth_token');
        // Get company from state or sessionStorage
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        
        // Build API URL - use Next.js API route as proxy
        let apiUrl = `/api/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
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
            const { status, checkInTime, totalMinutes } = json.data;
            
            // Calculate base minutes (without current session elapsed time) for checked-in status
            // For checked-out status, use totalMinutes as-is (it's the final total)
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
            
            setTimeState((prev) => ({
              ...prev,
              status: status || 'checked-out',
              checkInTime: checkInTime || null,
              totalMinutes: baseMinutes, // Base minutes for checked-in, full totalMinutes for checked-out
              date: getTodayKey(),
              employeeId: user.employeeId, // Ensure employeeId is set
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

  // Fetch check-in history from backend
  useEffect(() => {
    const fetchCheckInHistory = async () => {
      if (!user?.employeeId) return;
      try {
        setLoadingHistory(true);
        const token = localStorage.getItem('auth_token');
        const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        
        let apiUrl = `/api/employee-portal/checkin/history?employeeId=${encodeURIComponent(user.employeeId)}&limit=10`;
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

  const greeting = useMemo(() => {
    const hours = now.getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  // Use live user data instead of mock data
  const employeeProfile = useMemo(() => {
    if (!user) return null;
    return {
      designation: user.department || 'Team Member',
      department: user.department || '',
      name: user.name || '',
      email: user.email || '',
    };
  }, [user]);

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
        let apiUrl = `/api/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
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
              const { status, checkInTime, totalMinutes } = json.data;
              setTimeState({
                date: getTodayKey(),
                status: status || 'checked-out',
                checkInTime: checkInTime || null,
                totalMinutes: totalMinutes || 0,
                history: [],
                employeeId: user.employeeId,
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
    
    // Get company from state or sessionStorage
    const company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);

    try {
      const endpoint = isCheckingIn ? '/checkin' : '/checkout';
      
      // Build API URL - use Next.js API route as proxy
      let apiUrl = `/api/employee-portal${endpoint}`;
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
              totalMinutes: accumulatedMinutes, // Resume from accumulated time, not 0
              history: [{ action: 'Checked in', time: timestamp }],
              employeeId: user.employeeId,
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
                let statusUrl = `/api/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
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
                    // Only update if we got a valid checkInTime from backend
                    if (checkInTime) {
                      // Extract base minutes (without current session elapsed time) so timer can calculate correctly
                      // Backend returns totalMinutes that includes current session time, but we need base for timer calculation
                      let baseMinutes = totalMinutes || 0;
                      try {
                        const checkInTimeDate = new Date(checkInTime);
                        const nowDate = new Date();
                        const currentSessionMinutes = Math.max(0, (nowDate.getTime() - checkInTimeDate.getTime()) / 60000);
                        baseMinutes = Math.max(0, (totalMinutes || 0) - currentSessionMinutes);
                      } catch (e) {
                        console.error('Error calculating base minutes in refresh:', e);
                      }
                      
                      setTimeState(prev => ({
                        ...prev,
                        status: status || 'checked-in',
                        checkInTime: checkInTime,
                        totalMinutes: baseMinutes, // Store base minutes (accumulated from previous sessions only)
                        employeeId: user.employeeId,
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
                let statusUrl = `/api/employee-portal/checkin/status?employeeId=${encodeURIComponent(user.employeeId)}`;
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
                      totalMinutes: totalMinutes,
                      history: [
                        { action: 'Checked out', time: timestamp, meta: `${sessionHours.toFixed(1)} hrs logged` },
                      ],
                      employeeId: user.employeeId,
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
              let historyUrl = `/api/employee-portal/checkin/history?employeeId=${encodeURIComponent(user.employeeId)}&limit=10`;
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
  const attendanceTrend = dashboardData?.attendanceTrend || [];
  const quickStats = dashboardData?.quickStats || {
    leaveBalance: 0,
    upcomingShift: 'Not scheduled',
    pendingRequests: 0,
    lastPayout: 'N/A',
  };
  const requestHistory = dashboardData?.requestHistory || [];
  const assets = dashboardData?.assets || [];
  const learningJourneys = dashboardData?.learningJourneys || [];
  const kudos = dashboardData?.kudos || [];
  const communityHighlights = dashboardData?.communityHighlights || [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-sky-500/20 via-indigo-500/20 to-purple-500/20 shadow-lg shadow-sky-900/10">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%)' }}
          />
          <div className="relative p-6 space-y-6">
            <div>
              <p className="text-sm text-slate-700">
                {greeting}, {user?.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <p className="text-xl font-semibold text-slate-900">
                  {employeeProfile?.designation || 'Team Member'}
                </p>
                {employeeProfile?.department && (
                  <Badge className="bg-white/80 text-slate-900">
                    {employeeProfile.department}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Keep your day in sync with self check-in
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex-1">
                <p className="text-sm text-slate-600">Today's logged hours</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-slate-900">
                    {formatDuration(workedMinutes)}
                  </span>
                  <span className="text-xs text-slate-600">Target 8h</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${Math.min(100, (workedMinutes / WORKDAY_TARGET_MINUTES) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {timeState.status === 'checked-in' && timeState.checkInTime
                    ? `Checked in at ${formatTime(timeState.checkInTime)}`
                    : 'Not checked in yet'}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleToggleCheck}
                  className={
                    timeState.status === 'checked-in'
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }
                >
                  {timeState.status === 'checked-in' ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Check out
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Check in
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
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
                    <div className="rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 p-2 text-primary-600">
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
          </div>
        </Card>

        <Card className="border-none bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-inner shadow-blue-200/60 p-6">
          <h2 className="text-slate-900 font-semibold">My Snapshot</h2>
          <p className="text-sm text-slate-600 mb-4">Items that need your attention</p>
          <div className="space-y-3">
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
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-none bg-gradient-to-br from-amber-50 to-orange-100/60 shadow-lg shadow-amber-100/70 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-amber-900 font-semibold">Learning lane</h3>
              <p className="text-xs text-amber-700/80">Grow along your curated tracks</p>
            </div>
            <BookOpen className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-3">
            {learningJourneys.map((journey) => (
              <div key={journey.id} className="rounded-lg bg-white/80 p-3 shadow-sm">
                <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
                  <span>{journey.title}</span>
                  <Badge>{journey.badge}</Badge>
                </div>
                <p className="text-xs text-amber-700/80">Due {journey.due}</p>
                <div className="mt-2 h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${journey.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-amber-700/80">{journey.progress}% complete</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Explore learning studio
            </Button>
          </div>
        </Card>

        <Card className="border-none bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 shadow-lg shadow-rose-100/70 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-rose-900 font-semibold">Wellbeing & focus</h3>
              <p className="text-xs text-rose-700/80">Micro habits to stay energised</p>
            </div>
            <HeartPulse className="h-5 w-5 text-rose-500" />
          </div>
          <div className="rounded-xl border bg-rose-50 p-3 text-sm text-rose-700 mb-3">
            <p className="text-xs uppercase tracking-wide text-rose-500">Mood log</p>
            <p className="text-lg font-semibold">Grounded & productive</p>
            <p className="text-xs text-rose-600/80">
              Last updated 9:10 AM • Remember to stretch every hour.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            {['Hydration break', '10-min walk', 'Breathwork session'].map((habit) => (
              <div key={habit} className="flex items-center justify-between rounded-lg border px-3 py-2 bg-white/80">
                <span>{habit}</span>
                <Badge>Scheduled</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-none bg-gradient-to-br from-indigo-50 to-blue-100/60 shadow-lg shadow-indigo-100/70 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-indigo-900 font-semibold">Kudos spotlight</h3>
              <p className="text-xs text-indigo-700/80">Cheers from your teammates</p>
            </div>
            <PartyPopper className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-3">
            {kudos.map((note) => (
              <div key={note.id} className="rounded-lg bg-white/80 p-3 shadow-sm">
                <p className="text-sm font-semibold">{note.from}</p>
                <p className="text-xs text-neutral-500">{note.date}</p>
                <p className="mt-2 text-sm">{note.message}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full">
            Send gratitude
          </Button>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-none bg-white shadow-lg shadow-slate-200/40 p-6">
          <h3 className="font-semibold">Attendance pulse</h3>
          <p className="text-sm text-neutral-500 mb-3">Last 7 days</p>
          <div className="space-y-2">
            {attendanceTrend.map((day) => (
              <div key={day.day} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <div className="flex items-center gap-3">
                  <Badge>{day.day}</Badge>
                  <span>{day.status}</span>
                </div>
                <span className="font-medium">
                  {day.hours ? `${day.hours} hrs` : '-'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold">Announcements</h3>
          <p className="text-sm text-neutral-500 mb-3">Company wide updates</p>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>{announcement.date}</span>
                  <span>•</span>
                  <span className="capitalize">{announcement.type}</span>
                </div>
                <p className="mt-1 font-semibold">{announcement.title}</p>
                <p className="text-xs text-neutral-500">{announcement.audience}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-none bg-gradient-to-br from-indigo-50 to-blue-100/60 shadow-inner shadow-blue-200/60 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">My requests</h3>
              <p className="text-sm text-neutral-500">Latest submissions</p>
            </div>
            <Button size="sm" variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              New request
            </Button>
          </div>
          <div className="space-y-3">
            {requestHistory.map((request) => (
              <div key={request.id} className="rounded-lg bg-white/85 p-3 text-sm shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{request.id}</span>
                  <Badge>{request.status}</Badge>
                </div>
                <p className="mt-1 text-slate-600">{request.details}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{request.type}</span>
                  <span>Submitted {request.submitted}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-none bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-inner shadow-emerald-100/60 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Assigned assets</h3>
              <p className="text-sm text-neutral-500">Physical & digital assets</p>
            </div>
            <Button size="sm" variant="ghost">
              <Laptop className="mr-2 h-4 w-4" />
              Report issue
            </Button>
          </div>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.tag} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white/80 p-3 text-sm">
                <div>
                  <p className="font-semibold">{asset.name}</p>
                  <p className="text-xs text-emerald-700/70">{asset.tag}</p>
                </div>
                <Badge>{asset.status}</Badge>
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-emerald-200 bg-white/75 p-3 text-sm text-emerald-700">
              Need something else? Raise a hardware or access request.
            </div>
          </div>
        </Card>
      </section>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Community highlights</h3>
            <p className="text-sm text-neutral-500">Internal events & micro-experiences</p>
          </div>
          <Button variant="outline" size="sm">
            RSVP
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {communityHighlights.map((highlight) => (
            <div key={highlight.id} className="rounded-lg border bg-white p-3">
              <p className="text-sm font-semibold">{highlight.title}</p>
              <p className="text-xs text-neutral-500">{highlight.time}</p>
              <p className="text-xs text-neutral-500">Location: {highlight.location}</p>
              <Button variant="ghost" size="sm" className="mt-2">
                View details
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-none bg-gradient-to-br from-slate-900/5 to-slate-900/0 p-6">
        <div className="mb-4">
          <h3 className="font-semibold">Check-in history</h3>
          <p className="text-sm text-neutral-500">Recent actions for today</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            {loadingHistory ? (
              <p className="text-sm text-neutral-500">Loading history...</p>
            ) : checkInHistory.length === 0 ? (
              <p className="text-sm text-neutral-500">No check-in history available.</p>
            ) : (
              checkInHistory
                .filter(record => record.date === getTodayKey())
                .map((record, index) => (
                  <div
                    key={`${record.date}-${index}`}
                    className="rounded-lg border border-slate-200/70 bg-white/90 p-3 text-sm shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary-600" />
                      <span className="font-semibold">
                        {record.checkInTime ? 'Checked in' : 'Checked out'}
                      </span>
                    </div>
                    {record.checkInTime && (
                      <p className="text-xs text-neutral-500">
                        Check-in: {formatTime(record.checkInTime)}
                      </p>
                    )}
                    {record.checkOutTime && (
                      <p className="text-xs text-neutral-500">
                        Check-out: {formatTime(record.checkOutTime)}
                      </p>
                    )}
                    {record.totalHours && parseFloat(record.totalHours) > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Total: {parseFloat(record.totalHours).toFixed(1)} hours
                      </p>
                    )}
                  </div>
                ))
            )}
            {checkInHistory.filter(record => record.date === getTodayKey()).length === 0 && !loadingHistory && (
              <p className="text-sm text-neutral-500">No actions captured today yet.</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-800">Work tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Remember to pause the timer for extended breaks.</li>
              <li>Use manual entry for offsite meetings or travel.</li>
              <li>Once you check out, hours automatically sync to HR.</li>
            </ul>
          </div>
      </div>
      </Card>
    </div>
  );
};

export default EmployeePortalHome;
