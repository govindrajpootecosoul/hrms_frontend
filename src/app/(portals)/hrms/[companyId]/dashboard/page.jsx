'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Clock, Calendar, Cake, Plus, BarChart3, FileText, Sparkles, CheckCircle, XCircle, Home, UserCheck, UserX, CalendarDays, Download } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LineChart from '@/components/charts/LineChart';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Table from '@/components/common/Table';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import * as XLSX from 'xlsx';

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
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Employee modal state
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [modalFilterType, setModalFilterType] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    // Fetch live data from API
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get company from sessionStorage or params
        const company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
        
        // Build query params
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        if (company) params.append('company', company);
        const queryString = params.toString();

        // Fetch attendance stats directly (same as Attendance Overview)
        // Add cache-busting timestamp to ensure fresh data
        const today = new Date().toISOString().split('T')[0];
        const timestamp = Date.now();
        const attendanceStatsParams = new URLSearchParams();
        attendanceStatsParams.append('date', today);
        attendanceStatsParams.append('_t', timestamp.toString()); // Cache-busting
        if (company) attendanceStatsParams.append('company', company);
        if (companyId) attendanceStatsParams.append('companyId', companyId);
        
        const statsRes = await fetch(`/api/hrms-portal/attendance/stats?${attendanceStatsParams.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        
        // Process stats immediately to show dashboard faster
        const statsData = statsRes.ok ? await statsRes.json() : null;
        
        // Set initial stats from attendance stats endpoint
        if (statsData && statsData.success && statsData.data) {
          console.log('[Dashboard] Attendance stats response:', statsData.data);
          setStats({
            totalEmployees: statsData.data.totalEmployees || 0,
            activeEmployees: statsData.data.totalEmployees || 0, // Use totalEmployees as active for now
            presentToday: statsData.data.presentToday || 0,
            absentToday: statsData.data.absentToday || 0,
            onLeaveToday: statsData.data.onLeaveToday || 0,
            wfhToday: statsData.data.onWFHToday || 0,
            lateCheckIns: statsData.data.lateCheckIns || 0,
            leaveApprovals: statsData.data.leaveApprovals || 0,
            todayAttendance: statsData.data.presentToday || 0, // For backward compatibility
            pendingLeaves: statsData.data.leaveApprovals || 0, // Map leaveApprovals to pendingLeaves
            upcomingBirthdays: 0, // Will be fetched separately if needed
          });
        } else {
          console.warn('[Dashboard] Stats response missing success or data:', statsData);
          setStats({
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
        }
        
        // Fetch remaining dashboard data in parallel (non-critical)
        const [
          monthlyHeadcountsRes,
          birthdaysRes,
          workAnniversariesRes,
          recentActivitiesRes,
          upcomingEventsRes,
          upcomingLeavesFestivalsRes,
          complianceRemindersRes,
          checkInsRes,
        ] = await Promise.all([
          fetch(`/api/hrms/dashboard/monthly-headcounts${queryString ? `?${queryString}` : ''}`),
          fetch(`/api/hrms/dashboard/birthdays${queryString ? `?${queryString}` : ''}`),
          fetch(`/api/hrms/dashboard/work-anniversaries${queryString ? `?${queryString}` : ''}`),
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
        const birthdaysData = birthdaysRes.ok ? await birthdaysRes.json() : null;
        const workAnniversariesData = workAnniversariesRes.ok ? await workAnniversariesRes.json() : null;
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
        setDashboardData({
          stats: stats || {
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
          birthdayCalendar: birthdaysData?.success && birthdaysData?.data 
            ? birthdaysData.data 
            : [],
          workAnniversaryCalendar: workAnniversariesData?.success && workAnniversariesData?.data 
            ? workAnniversariesData.data 
            : [],
          complianceReminders: complianceRemindersData?.success && complianceRemindersData?.data 
            ? complianceRemindersData.data 
            : [],
        });

        // Set recent check-ins
        if (checkInsData?.success && checkInsData?.data?.checkIns) {
          setRecentCheckIns(checkInsData.data.checkIns.slice(0, 10));
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
        setLoading(false);
      }
    };
    
    // Initial load
    loadData();
    
    // Set up auto-refresh for attendance stats (Present, Absent, WFH)
    const refreshAttendanceOnly = async () => {
      try {
        const company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        if (company) params.append('company', company);
        const queryString = params.toString();
        
        // Fetch attendance stats to get updated Present, Absent, WFH, etc.
        // Add cache-busting timestamp to ensure fresh data
        const today = new Date().toISOString().split('T')[0];
        const timestamp = Date.now();
        const attendanceStatsParams = new URLSearchParams();
        attendanceStatsParams.append('date', today);
        attendanceStatsParams.append('_t', timestamp.toString()); // Cache-busting
        if (company) attendanceStatsParams.append('company', company);
        if (companyId) attendanceStatsParams.append('companyId', companyId);
        
        const statsRes = await fetch(`/api/hrms-portal/attendance/stats?${attendanceStatsParams.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData?.success && statsData?.data) {
            // Update attendance stats (Present, Absent, WFH, etc.)
            setStats(prevStats => {
              const newStats = statsData.data;
              if (prevStats && (
                prevStats.presentToday !== newStats.presentToday ||
                prevStats.absentToday !== newStats.absentToday ||
                prevStats.wfhToday !== newStats.onWFHToday ||
                prevStats.onLeaveToday !== newStats.onLeaveToday ||
                prevStats.lateCheckIns !== newStats.lateCheckIns ||
                prevStats.leaveApprovals !== newStats.leaveApprovals
              )) {
                return {
                  ...prevStats,
                  totalEmployees: newStats.totalEmployees || prevStats.totalEmployees || 0,
                  activeEmployees: newStats.totalEmployees || prevStats.activeEmployees || 0,
                  presentToday: newStats.presentToday || 0,
                  absentToday: newStats.absentToday || 0,
                  onLeaveToday: newStats.onLeaveToday || 0,
                  wfhToday: newStats.onWFHToday || 0,
                  lateCheckIns: newStats.lateCheckIns || 0,
                  leaveApprovals: newStats.leaveApprovals || 0,
                  todayAttendance: newStats.presentToday || 0,
                  pendingLeaves: newStats.leaveApprovals || 0,
                };
              }
              return prevStats;
            });
          }
        }
        
        // Also fetch check-ins for recent check-ins list
        const checkInsRes = await fetch(`/api/hrms/dashboard/checkins${queryString ? `?${queryString}` : ''}`);
        if (checkInsRes.ok) {
          const checkInsData = await checkInsRes.json();
          if (checkInsData?.success && checkInsData?.data?.checkIns) {
            setRecentCheckIns(checkInsData.data.checkIns.slice(0, 10));
          }
        }
      } catch (err) {
        console.error('Error refreshing attendance:', err);
        // Silently fail - don't disrupt the UI
      }
    };
    
    // Refresh attendance every 30 seconds (lightweight update)
    const refreshInterval = setInterval(refreshAttendanceOnly, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [companyId]);

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
  }, [companyId, currentCompany]);

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
        
        const today = new Date().toISOString().split('T')[0];
        const timestamp = Date.now();
        
        const params = new URLSearchParams();
        params.append('date', today);
        params.append('_t', timestamp.toString());
        if (company) {
          params.append('company', company);
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
  }, [companyId, currentCompany]);

  // Filter employees by status
  const getFilteredEmployees = (filterType) => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filterType) {
      case 'present':
        const presentRecords = attendance.filter(a => {
          const matchesStatus = a.status === 'present';
          const matchesDate = a.date === today;
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
        // Get all employees and find those not present today
        const presentIds = new Set(
          attendance
            .filter(a => a.status === 'present' && a.date === today)
            .map(a => a.biometricId)
        );
        const onLeaveIds = new Set(
          attendance
            .filter(a => a.status === 'on-leave' && a.date === today)
            .map(a => a.biometricId)
        );
        const wfhIds = new Set(
          attendance
            .filter(a => (a.status === 'wfh' || a.status === 'work-from-home') && a.date === today)
            .map(a => a.biometricId)
        );
        
        return employees
          .filter(emp => {
            const empId = emp.biometricId || emp.employeeCode || emp.id;
            return !presentIds.has(empId) && !onLeaveIds.has(empId) && !wfhIds.has(empId);
          })
          .map(emp => ({
            employeeCode: emp.biometricId || emp.employeeCode || emp.id,
            employeeName: emp.name || emp.employeeName,
            department: emp.department || 'General',
            status: 'absent',
            checkIn: '--',
            checkOut: '--',
            isLate: false
          }));
      
      case 'wfh':
        return attendance
          .filter(a => (a.status === 'wfh' || a.status === 'work-from-home') && a.date === today)
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
      const today = new Date().toISOString().split('T')[0];
      const filename = `${modalTitle}_${today}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to Excel');
    }
  }, [modalFilterType, modalTitle, toast]);

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
      value: currentStats.totalEmployees,
      active: currentStats.activeEmployees,
      inactive: currentStats.totalEmployees - currentStats.activeEmployees,
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
      shadow: 'shadow-blue-500/30',
      icon: Users,
      clickable: true,
      onClick: () => router.push(`/hrms/${companyId}/employees`),
    },
    {
      title: 'Present',
      value: currentStats.presentToday || currentStats.todayAttendance || 0,
      gradient: 'from-green-600 via-emerald-600 to-green-700',
      shadow: 'shadow-green-500/30',
      icon: CheckCircle,
      clickable: true,
      filterType: 'present',
      onClick: () => handleCardClick('present', 'Present Employees'),
    },
    {
      title: 'Absent',
      value: currentStats.absentToday || 0,
      gradient: 'from-red-600 via-rose-600 to-red-700',
      shadow: 'shadow-red-500/30',
      icon: XCircle,
      clickable: true,
      filterType: 'absent',
      onClick: () => handleCardClick('absent', 'Absent Employees'),
    },
    {
      title: 'WFH',
      value: currentStats.wfhToday || 0,
      gradient: 'from-purple-600 via-violet-600 to-purple-700',
      shadow: 'shadow-purple-500/30',
      icon: Home,
      clickable: true,
      filterType: 'wfh',
      onClick: () => handleCardClick('wfh', 'WFH Employees'),
    },
    ];
  }, [stats, companyId, router, handleCardClick]);

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
  const monthlyHeadcountsData = dashboardData.monthlyHeadcounts && dashboardData.monthlyHeadcounts.length > 0
    ? dashboardData.monthlyHeadcounts.map(item => item.headcount)
    : [];
  const monthlyHeadcountsCategories = dashboardData.monthlyHeadcounts && dashboardData.monthlyHeadcounts.length > 0
    ? dashboardData.monthlyHeadcounts.map(item => item.month)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to HRMS Portal</p>
      </div>

      {/* KPI Cards - Using memoized components for optimal re-rendering */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <KPICard key={`${kpi.title}-${kpi.value}`} kpi={kpi} index={index} />
        ))}
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
              {dashboardData.birthdayCalendar && dashboardData.birthdayCalendar.length > 0 ? (
                dashboardData.birthdayCalendar.slice(0, 5).map((item) => (
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
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No birthdays this month</p>
              )}
              {dashboardData.workAnniversaryCalendar && dashboardData.workAnniversaryCalendar.length > 0 ? (
                dashboardData.workAnniversaryCalendar.slice(0, 5).map((item) => (
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
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No work anniversaries this month</p>
              )}
            </div>
          </Card>

          {/* People Pulse */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">People Pulse</h2>
            <p className="text-xs text-slate-600 mb-4">Latest movements across the organization</p>
            <div className="space-y-3">
              {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.slice(0, 6).map((activity) => (
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
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </Card>

          {/* Today's Check-Ins */}
          <Card className="border-2 p-6">
            <h2 className="text-base font-semibold mb-1">Today's Check-Ins</h2>
            <p className="text-xs text-slate-600 mb-4">Employees checked in today</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentCheckIns && recentCheckIns.length > 0 ? (
                recentCheckIns.map((checkIn) => (
                  <div key={`${checkIn.employeeId}-${checkIn.checkInTime}`} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${checkIn.status === 'checked-in' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium">{checkIn.employeeName}</p>
                        <p className="text-xs text-slate-600">{checkIn.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {checkIn.checkInTime && (
                        <p className="text-xs text-slate-600">
                          Check-in: {new Date(checkIn.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {checkIn.checkOutTime && (
                        <p className="text-xs text-slate-600">
                          Check-out: {new Date(checkIn.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {checkIn.totalMinutes > 0 && (
                        <p className="text-xs text-slate-500">
                          {(checkIn.totalMinutes / 60).toFixed(1)}h
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No check-ins recorded today</p>
              )}
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
                    <div key={reminder.id} className={`p-3 rounded-lg border-2 ${borderColor} hover:shadow-md transition-all duration-200`}>
                      <p className="text-sm font-medium mb-1">{reminder.title}</p>
                      <p className="text-xs text-slate-600">Due in {reminder.daysRemaining} day{reminder.daysRemaining !== 1 ? 's' : ''}</p>
                    </div>
                  );
                })
              ) : (
                <>
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
                </>
              )}
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
