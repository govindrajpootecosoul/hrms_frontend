'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import BarGraph from '@/components/charts/BarGraph';
import Table from '@/components/common/Table';
import Card from '@/components/common/Card';
import AttendanceTable from '@/components/hrms/AttendanceTable';
import AttendanceUploadForm from '@/components/hrms/AttendanceUploadForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Users, UserCheck, UserX, CalendarDays, Home, Clock3, CheckCircle2, Edit, Trash2, Plus, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const AttendanceOverviewPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showBiometricExport, setShowBiometricExport] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('daily');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    onWFHToday: 0,
    lateCheckIns: 0,
    leaveApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [modalFilterType, setModalFilterType] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const getLocalDateYyyyMmDd = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [baseDate, setBaseDate] = useState(getLocalDateYyyyMmDd());
  const [bioStartDate, setBioStartDate] = useState(getLocalDateYyyyMmDd());
  const [bioEndDate, setBioEndDate] = useState(getLocalDateYyyyMmDd());
  const [bioEmployeeCode, setBioEmployeeCode] = useState('all');

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

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        // Get company name from multiple sources
        let company = currentCompany?.name;
        if (!company && typeof window !== 'undefined') {
          company = sessionStorage.getItem('selectedCompany') || 
                   sessionStorage.getItem('adminSelectedCompany');
        }
        // If still no company and companyId is a number, try to map it
        if (!company && companyId && companyId !== 'undefined') {
          // Try to get from sessionStorage with companyId key
          if (typeof window !== 'undefined') {
            company = sessionStorage.getItem(`company_${companyId}`);
          }
        }
        
        const timestamp = Date.now(); // Cache-busting timestamp

        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        };
        if (company) {
          headers['x-company'] = company;
        }
        
        const safeBase = baseDate || getLocalDateYyyyMmDd();

        const toYyyyMmDd = (d) => {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };

        const computeDates = () => {
          const end = new Date(`${safeBase}T00:00:00`);
          if (Number.isNaN(end.getTime())) return [getLocalDateYyyyMmDd()];

          if (filterPeriod === 'weekly') {
            const dates = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date(end);
              d.setDate(end.getDate() - i);
              dates.push(toYyyyMmDd(d));
            }
            return dates;
          }

          if (filterPeriod === 'monthly') {
            const y = end.getFullYear();
            const m = end.getMonth();
            const first = new Date(y, m, 1);
            const last = new Date(y, m + 1, 0);
            const dates = [];
            for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
              dates.push(toYyyyMmDd(d));
            }
            return dates;
          }

          // daily
          return [safeBase];
        };

        const datesToFetch = computeDates();

        const fetchForDate = async (dateStr) => {
          const params = new URLSearchParams();
          params.append('date', dateStr);
          params.append('_t', `${timestamp}`); // Cache-busting
          if (company) params.append('company', company);
          if (filterDepartment && filterDepartment !== 'all') params.append('department', filterDepartment);

          const attendanceRes = await fetch(`/api/hrms-portal/attendance?${params.toString()}`, {
            headers,
            cache: 'no-store',
          });
          if (!attendanceRes.ok) {
            throw new Error(`Attendance fetch failed for ${dateStr}: ${attendanceRes.status}`);
          }
          const attendanceJson = await attendanceRes.json();
          const records = attendanceJson?.success ? attendanceJson?.data?.records || [] : [];
          return records.map((r) => ({ ...r, date: r?.date || dateStr }));
        };

        console.log('[Attendance Overview] Fetching with company:', company, 'period:', filterPeriod, 'baseDate:', safeBase);

        const [recordsByDate, statsRes] = await Promise.all([
          Promise.all(datesToFetch.map(fetchForDate)),
          (() => {
            const params = new URLSearchParams();
            params.append('date', safeBase);
            params.append('_t', `${timestamp}`);
            if (company) params.append('company', company);
            if (filterDepartment && filterDepartment !== 'all') params.append('department', filterDepartment);
            return fetch(`/api/hrms-portal/attendance/stats?${params.toString()}`, {
              headers,
              cache: 'no-store',
            });
          })(),
        ]);

        const flattened = recordsByDate.flat();
        console.log(`[Attendance Overview] Setting ${flattened.length} attendance records across ${datesToFetch.length} day(s)`);
        setAttendance(flattened);

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          console.log('[Attendance Overview] Stats response:', statsJson);
          if (statsJson.success && statsJson.data) {
            console.log('[Attendance Overview] Setting stats:', statsJson.data);
            setStats({
              totalEmployees: statsJson.data.totalEmployees || 0,
              presentToday: statsJson.data.presentToday || 0,
              absentToday: statsJson.data.absentToday || 0,
              onLeaveToday: statsJson.data.onLeaveToday || 0,
              onWFHToday: statsJson.data.onWFHToday || 0,
              lateCheckIns: statsJson.data.lateCheckIns || 0,
              leaveApprovals: statsJson.data.leaveApprovals || 0
            });
          } else {
            console.warn('[Attendance Overview] Stats response missing success or data:', statsJson);
          }
        } else {
          console.error('[Attendance Overview] Stats response not OK:', statsRes.status, statsRes.statusText);
        }
      } catch (err) {
        console.error('Fetch attendance error:', err);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [companyId, currentCompany, toast, filterPeriod, baseDate, filterDepartment]);

  // Debug: Log stats changes
  useEffect(() => {
    console.log('[Attendance Overview] Stats updated:', stats);
  }, [stats]);

  const handleUploadAttendance = () => {
    setShowUploadForm(true);
  };

  const getEffectiveCompanyName = () => {
    let company = currentCompany?.name;
    if (!company && typeof window !== 'undefined') {
      company =
        sessionStorage.getItem('selectedCompany') || sessionStorage.getItem('adminSelectedCompany');
    }
    if (!company && companyId && companyId !== 'undefined') {
      if (typeof window !== 'undefined') {
        company = sessionStorage.getItem(`company_${companyId}`);
      }
    }
    return company || companyId;
  };

  const downloadBiometricCsv = async () => {
    try {
      const company = getEffectiveCompanyName();
      const params = new URLSearchParams();
      params.append('startDate', bioStartDate);
      params.append('endDate', bioEndDate);
      if (company) params.append('company', company);
      if (bioEmployeeCode && bioEmployeeCode !== 'all') params.append('employeeCode', bioEmployeeCode);

      const res = await fetch(`/api/hrms-portal/attendance/machine-reports/export?${params.toString()}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') || '';
      const m = cd.match(/filename="([^"]+)"/i);
      const filename = m?.[1] || `biometric_attendance_${bioStartDate}_to_${bioEndDate}.csv`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Biometric attendance downloaded');
      setShowBiometricExport(false);
    } catch (e) {
      console.error('[Biometric Export] error:', e);
      toast.error(e?.message || 'Failed to download biometric attendance');
    }
  };

  const handleSubmitAttendance = (data) => {
    if (data.method === 'manual') {
      const newRecord = {
        id: Date.now().toString(),
        ...data.data,
        employeeName: 'Manual Entry'
      };
      setAttendance(prev => [...prev, newRecord]);
      toast.success('Attendance record added successfully');
    } else {
      toast.success('CSV file uploaded successfully');
    }
    
    setShowUploadForm(false);
  };

  const handleStatusUpdate = (recordId, newStatus) => {
    setAttendance(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, status: newStatus }
        : record
    ));
    toast.success('Attendance status updated successfully');
  };

  const handleExportAttendance = () => {
    toast.success('Attendance data exported successfully');
  };

  const handleDownloadCurrentList = () => {
    try {
      const dataToExport = filteredAttendance;
      if (!dataToExport || dataToExport.length === 0) {
        toast.error('No data to export');
        return;
      }

      const excelData = dataToExport.map((row, index) => ({
        'S.No': index + 1,
        'Employee Code': row.biometricId || '--',
        'Employee Name': row.employeeName || '--',
        'Department': row.department || '--',
        'Date': row.date || '--',
        'Check-in': row.timeIn || '--:--',
        'Check-out': row.timeOut || '--:--',
        'Check-in Type': row.source ? String(row.source) : '--',
        'Total Hours': calculateHours(row.timeIn, row.timeOut),
        'Status': row.isLate ? 'Late' : (row.status === 'present' ? 'Present' : row.status === 'absent' ? 'Absent' : row.status === 'on-leave' ? 'On Leave' : row.status === 'wfh' ? 'WFH' : (row.status || '--')),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 8 },
        { wch: 16 },
        { wch: 24 },
        { wch: 22 },
        { wch: 14 },
        { wch: 10 },
        { wch: 10 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      const safePeriod = String(filterPeriod || 'daily');
      const safeDate = String(baseDate || getLocalDateYyyyMmDd());
      const filename = `attendance_log_${safePeriod}_${safeDate}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('List downloaded');
    } catch (e) {
      console.error('Download list error:', e);
      toast.error('Failed to download list');
    }
  };

  // Stats are now fetched from backend, no need to calculate

  // Calculate attendance distribution for chart
  const attendanceDistribution = useMemo(() => {
    const totalEmployees = stats.totalEmployees || 1;
    const presentCount = stats.presentToday;
    const absentCount = stats.absentToday;
    const onLeaveCount = stats.onLeaveToday;
    const wfhCount = stats.onWFHToday;
    
    const presentPercent = Math.round((presentCount / totalEmployees) * 100);
    const absentPercent = Math.round((absentCount / totalEmployees) * 100);
    const onLeavePercent = Math.round((onLeaveCount / totalEmployees) * 100);
    const wfhPercent = Math.round((wfhCount / totalEmployees) * 100);
    
    return {
      data: [presentPercent, absentPercent, onLeavePercent, wfhPercent],
      categories: ['Present', 'Absent', 'On Leave', 'WFH'],
      colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']
    };
  }, [stats]);

  // Generate last 7 days trends data (simplified - showing only today's data)
  const last7DaysTrends = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dates = [today];
    
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
    };

    const employeeMap = new Map();
    attendance.forEach(record => {
      if (!employeeMap.has(record.biometricId)) {
        employeeMap.set(record.biometricId, {
          biometricId: record.biometricId,
          name: record.employeeName,
          department: record.department || 'General'
        });
      }
    });

    const trendsData = Array.from(employeeMap.values()).slice(0, 10).map(emp => {
      const row = {
        id: emp.biometricId,
        employee: emp.name,
        department: emp.department
      };
      
      dates.forEach(date => {
        const record = attendance.find(r => 
          r.biometricId === emp.biometricId && r.date === date
        );
        
        let badge = { letter: '-', color: 'neutral' };
        if (record) {
          switch (record.status) {
            case 'present':
              badge = { letter: 'P', color: 'success' };
              break;
            case 'absent':
              badge = { letter: 'A', color: 'danger' };
              break;
            case 'on-leave':
              badge = { letter: 'L', color: 'warning' };
              break;
            case 'wfh':
            case 'work-from-home':
              badge = { letter: 'W', color: 'secondary' };
              break;
            default:
              badge = { letter: '-', color: 'neutral' };
          }
        }
        
        row[`date_${date}`] = badge;
      });
      
      return row;
    });

    return {
      data: trendsData,
      dates: dates,
      formattedDates: dates.map(formatDate)
    };
  }, [attendance]);

  // Sales Person Attendance data
  const salesPersonAttendance = useMemo(() => {
    const salesTeam = attendance.filter(record => 
      record.department === 'Sales' &&
      record.status === 'present'
    );
    
    return salesTeam.map(record => ({
      id: record.id,
      employeeName: record.employeeName,
      checkIn: record.timeIn || '-',
      checkOut: record.timeOut || '-',
      status: record.isLate ? 'Late' : 'Present'
    }));
  }, [attendance]);

  // Filtered attendance for main table
  const filteredAttendance = useMemo(() => {
    let filtered = [...attendance];

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(record => record.department === filterDepartment);
    }

    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.biometricId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by Employee Code (A→Z) for easier scanning.
    // For weekly/monthly this groups each employee together across days.
    if (filterPeriod === 'daily' || filterPeriod === 'weekly' || filterPeriod === 'monthly') {
      const collator = new Intl.Collator(undefined, {
        numeric: true, // so "55" sorts before "103"
        sensitivity: 'base',
      });

      const toDateKey = (v) => {
        if (!v) return '';
        const s = String(v);
        // Prefer YYYY-MM-DD prefix when available (works for ISO strings too).
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const toTimeKey = (hm) => {
        if (!hm) return '';
        const s = String(hm).trim();
        return /^\d{1,2}:\d{2}$/.test(s) ? s.padStart(5, '0') : s;
      };

      filtered.sort((a, b) => {
        const acRaw = String(a?.biometricId ?? '').trim();
        const bcRaw = String(b?.biometricId ?? '').trim();
        const acEmpty = acRaw === '';
        const bcEmpty = bcRaw === '';
        if (acEmpty !== bcEmpty) return acEmpty ? 1 : -1; // empty codes at bottom

        const ac = acRaw.toLowerCase();
        const bc = bcRaw.toLowerCase();
        if (ac !== bc) return collator.compare(ac, bc);

        const ad = toDateKey(a?.date);
        const bd = toDateKey(b?.date);
        if (ad !== bd) return collator.compare(ad, bd); // oldest → newest

        const at = toTimeKey(a?.timeIn);
        const bt = toTimeKey(b?.timeIn);
        if (at !== bt) return collator.compare(at, bt);

        const an = String(a?.employeeName || '').toLowerCase();
        const bn = String(b?.employeeName || '').toLowerCase();
        return collator.compare(an, bn);
      });
    }

    return filtered;
  }, [attendance, filterDepartment, searchQuery, filterPeriod]);

  useEffect(() => {
    setPage(0);
  }, [filterDepartment, filterLocation, searchQuery, attendance.length, pageSize]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filteredAttendance.length / pageSize));
  }, [filteredAttendance.length, pageSize]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(0, p), pageCount - 1));
  }, [pageCount]);

  const paginatedAttendance = useMemo(() => {
    const start = page * pageSize;
    return filteredAttendance.slice(start, start + pageSize);
  }, [filteredAttendance, page, pageSize]);

  const showingFrom = filteredAttendance.length === 0 ? 0 : (page * pageSize + 1);
  const showingTo = Math.min((page + 1) * pageSize, filteredAttendance.length);

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  };

  // Calculate total hours
  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '--';
    const [inHours, inMins] = timeIn.split(':').map(Number);
    const [outHours, outMins] = timeOut.split(':').map(Number);
    const totalMins = (outHours * 60 + outMins) - (inHours * 60 + inMins);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours}.${Math.round((mins / 60) * 100)}`;
  };

  // Get status badge color
  const getStatusBadge = (status, isLate) => {
    if (isLate) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'present') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'absent') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'on-leave') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (status === 'wfh') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get filtered employees based on card type
  const getFilteredEmployees = (filterType) => {
    const today = getLocalDateYyyyMmDd();

    const normalizeId = (v) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s ? s : null;
    };

    const isSameLocalDay = (dateValue, yyyyMmDd) => {
      if (!dateValue || !yyyyMmDd) return false;
      const s = String(dateValue);
      // Backend sometimes returns ISO strings like "2026-04-14T00:00:00.000Z"
      if (s === yyyyMmDd) return true;
      return s.startsWith(`${yyyyMmDd}T`) || s.startsWith(`${yyyyMmDd} `) || s.startsWith(yyyyMmDd);
    };

    const getEmployeeIdCandidates = (emp) => {
      const candidates = [
        emp?.biometricId,
        emp?.employeeId,
        emp?.employeeCode,
        emp?.id,
      ]
        .map(normalizeId)
        .filter(Boolean);
      return Array.from(new Set(candidates));
    };
    
    switch (filterType) {
      case 'total':
        return employees.map(emp => {
          const attendanceRecord = attendance.find(a => 
            a.biometricId === emp.biometricId || 
            a.employeeName === emp.name
          );
          return {
            ...emp,
            employeeCode: emp.biometricId || emp.employeeCode || emp.id,
            employeeName: emp.name || emp.employeeName,
            department: emp.department || 'General',
            status: attendanceRecord?.status || 'absent',
            checkIn: attendanceRecord?.timeIn || '--',
            checkOut: attendanceRecord?.timeOut || '--',
            isLate: attendanceRecord?.isLate || false
          };
        });
      
      case 'present':
        const presentRecords = attendance.filter(a => {
          const matchesStatus = a.status === 'present';
          const matchesDate = isSameLocalDay(a.date, today);
          return matchesStatus && matchesDate;
        });
        console.log(`[Attendance Overview] Filtering 'present': Found ${presentRecords.length} records out of ${attendance.length} total`);
        console.log('[Attendance Overview] Today:', today);
        console.log('[Attendance Overview] Sample attendance record:', attendance[0]);
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
            .filter(a => a.status === 'present' && isSameLocalDay(a.date, today))
            .map(a => normalizeId(a.biometricId))
            .filter(Boolean)
        );
        const onLeaveIds = new Set(
          attendance
            .filter(a => a.status === 'on-leave' && isSameLocalDay(a.date, today))
            .map(a => normalizeId(a.biometricId))
            .filter(Boolean)
        );
        const wfhIds = new Set(
          attendance
            .filter(a => (a.status === 'wfh' || a.status === 'work-from-home') && isSameLocalDay(a.date, today))
            .map(a => normalizeId(a.biometricId))
            .filter(Boolean)
        );
        
        return employees
          .filter(emp => {
            const candidates = getEmployeeIdCandidates(emp);
            // If any identifier matches a "present/leave/wfh" identifier, exclude from absent list.
            const isPresent = candidates.some((id) => presentIds.has(id));
            const isOnLeave = candidates.some((id) => onLeaveIds.has(id));
            const isWfh = candidates.some((id) => wfhIds.has(id));
            return !isPresent && !isOnLeave && !isWfh;
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
      
      case 'on-leave':
        return attendance
          .filter(a => a.status === 'on-leave' && isSameLocalDay(a.date, today))
          .map(a => ({
            employeeCode: a.biometricId,
            employeeName: a.employeeName,
            department: a.department || 'General',
            status: 'on-leave',
            checkIn: '--',
            checkOut: '--',
            isLate: false
          }));
      
      case 'wfh':
        return attendance
          .filter(a => (a.status === 'wfh' || a.status === 'work-from-home') && isSameLocalDay(a.date, today))
          .map(a => ({
            employeeCode: a.biometricId,
            employeeName: a.employeeName,
            department: a.department || 'General',
            status: 'wfh',
            checkIn: a.timeIn || '--',
            checkOut: a.timeOut || '--',
            isLate: a.isLate || false
          }));
      
      case 'late':
        return attendance
          // Late list should only include truly-late employees (not all present).
          .filter((a) => a.isLate && isSameLocalDay(a.date, today))
          .map(a => ({
            employeeCode: a.biometricId,
            employeeName: a.employeeName,
            department: a.department || 'General',
            status: 'present',
            checkIn: a.timeIn || '--',
            checkOut: a.timeOut || '--',
            isLate: true
          }));
      
      default:
        return [];
    }
  };

  // Handle card click
  const handleCardClick = (filterType, title) => {
    setModalFilterType(filterType);
    setModalTitle(title);
    setShowEmployeeModal(true);
  };

  // Export to Excel
  const handleExportToExcel = () => {
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

      // Set column widths
      const colWidths = [
        { wch: 8 },  // S.No
        { wch: 18 }, // Employee Code
        { wch: 25 }, // Employee Name
        { wch: 25 }, // Department
        { wch: 12 }, // Check-in
        { wch: 12 }, // Check-out
        { wch: 15 }  // Status
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${modalTitle.replace(/\s+/g, '_')}_${dateStr}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const attendanceLogColumns = [
    {
      key: 'biometricId',
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
      key: 'date',
      title: 'Date',
      render: (value) => <span className="text-slate-700">{formatDate(value)}</span>
    },
    {
      key: 'timeIn',
      title: 'Check-in',
      render: (value) => <span className="text-slate-700">{value || '--:--'}</span>
    },
    {
      key: 'timeOut',
      title: 'Check-out',
      render: (value) => <span className="text-slate-700">{value || '--:--'}</span>
    },
    {
      key: 'source',
      title: 'Check-in Type',
      render: (value) => {
        const v = String(value || '').toLowerCase();
        const label = v === 'machine' ? 'Machine' : v === 'manual' ? 'Manual' : (value || '--');
        const cls =
          v === 'machine'
            ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
            : v === 'manual'
              ? 'bg-slate-100 text-slate-800 border-slate-200'
              : 'bg-gray-100 text-gray-800 border-gray-200';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${cls}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'totalHours',
      title: 'Total Hours',
      render: (value, row) => {
        const hours = calculateHours(row.timeIn, row.timeOut);
        return <span className="text-slate-700">{hours === '--' ? '--' : `${hours} hrs`}</span>;
      }
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
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button className="text-slate-600 hover:text-blue-600 transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button className="text-slate-600 hover:text-red-600 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Attendance Overview
        </h1>
        <p className="text-lg text-slate-600">
          Track and manage employee attendance
        </p>
      </div>

      {/* KPI Cards - 2 rows */}
      <div className="space-y-4">
        {/* First row - 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Employees', value: stats.totalEmployees, icon: Users, gradient: 'from-blue-600 via-indigo-600 to-blue-700', filterType: 'total' },
            { title: 'Present Today', value: stats.presentToday, icon: UserCheck, gradient: 'from-green-600 via-emerald-600 to-green-700', filterType: 'present' },
            { title: 'Absent Today', value: stats.absentToday, icon: UserX, gradient: 'from-red-600 via-rose-600 to-red-700', filterType: 'absent' },
            { title: 'On Leave', value: stats.onLeaveToday, icon: CalendarDays, gradient: 'from-purple-600 via-violet-600 to-purple-700', filterType: 'on-leave' },
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                onClick={() => handleCardClick(kpi.filterType, kpi.title)}
                className={`bg-gradient-to-r ${kpi.gradient} rounded-xl p-5 text-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                <div className="text-xs text-white/90 uppercase tracking-wide">{kpi.title}</div>
              </div>
            );
          })}
        </div>

        {/* Second row - 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'On WFH', value: stats.onWFHToday, icon: Home, gradient: 'from-pink-600 via-rose-600 to-pink-700', filterType: 'wfh' },
            { title: 'Late Check-ins', value: stats.lateCheckIns, icon: Clock3, gradient: 'from-orange-600 via-amber-600 to-orange-700', filterType: 'late' },
            { title: 'Leave Approvals', value: stats.leaveApprovals, icon: CheckCircle2, gradient: 'from-emerald-600 via-teal-600 to-emerald-700', filterType: null },
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                onClick={() => kpi.filterType && handleCardClick(kpi.filterType, kpi.title)}
                className={`bg-gradient-to-r ${kpi.gradient} rounded-xl p-5 text-white shadow-lg ${kpi.filterType ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                <div className="text-xs text-white/90 uppercase tracking-wide">{kpi.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Distribution Chart and Trends Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="border-2 p-6">
          <BarGraph
            title="Attendance Distribution"
            subtitle="Click on a bar to filter trends below"
            data={[{ name: 'Percentage', data: attendanceDistribution.data }]}
            categories={attendanceDistribution.categories}
            seriesName="Percentage"
            height={280}
            colors={attendanceDistribution.colors}
            horizontal={true}
            showGrid={true}
            dataLabels={false}
            xAxisTitle="Percentage"
            yAxisTitle=""
            barWidth="40%"
            onDataPointClick={(dataPoint) => {
              console.log('Bar clicked:', dataPoint);
            }}
          />
        </Card>

        {/* Trends Table */}
        <Card
          title="Last 7 Days Trends"
          subtitle="Employee attendance trends for last 7 days"
          className="border-2"
        >
          <Table
            columns={[
              {
                key: 'employee',
                title: 'Employee',
                render: (value, row) => (
                  <div>
                    <div className="font-semibold text-slate-900">{value}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{row.department}</div>
                  </div>
                )
              },
              ...last7DaysTrends.dates.map((date, index) => ({
                key: `date_${date}`,
                title: last7DaysTrends.formattedDates[index],
                render: (value, row) => {
                  const badge = value || { letter: '-', color: 'neutral' };
                  const colorMap = {
                    success: 'bg-green-100 text-green-700 border-green-200',
                    danger: 'bg-red-100 text-red-700 border-red-200',
                    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    secondary: 'bg-blue-100 text-blue-700 border-blue-200',
                    neutral: 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  };
                  return (
                    <div className="flex justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${colorMap[badge.color] || colorMap.neutral}`}>
                        {badge.letter}
                      </div>
                    </div>
                  );
                }
              }))
            ]}
            data={last7DaysTrends.data}
            scrollable={true}
            maxHeight="400px"
            className="border-0 shadow-none"
          />
        </Card>
      </div>

      {/* Sales Person Attendance Table */}
      <Card
        title="Sales Person Attendance"
        subtitle="Today's attendance for Sales team"
        className="border-2"
      >
        <Table
          columns={[
            {
              key: 'employeeName',
              title: 'Employee Name',
              render: (value) => <div className="font-medium text-slate-900">{value}</div>
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
              render: (value) => {
                const colorMap = {
                  'Present': 'bg-green-100 text-green-800 border-green-200',
                  'Late': 'bg-yellow-100 text-yellow-800 border-yellow-200'
                };
                return (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorMap[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {value}
                  </span>
                );
              }
            }
          ]}
          data={salesPersonAttendance}
          emptyMessage="No sales person attendance data for today"
        />
      </Card>

      {/* Attendance Log - Daily Basis */}
      <Card
        title="Attendance Log - Daily Basis"
        subtitle="View and manage employee attendance records for today"
        className="border-2"
      >
        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3 flex-nowrap overflow-x-auto pb-2">
            <div className="flex-none w-[260px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, or department"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-none"
            >
              <option value="daily">Daily (Default)</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="flex items-center gap-2 flex-none">
              <span className="text-sm text-slate-600">Date</span>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-none"
            >
              <option value="all">All Departments</option>
              {Array.from(new Set(employees.map(emp => emp.department).filter(Boolean))).sort().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-none"
            >
              <option value="all">All Locations</option>
              <option value="office">Office</option>
              <option value="remote">Remote</option>
            </select>
            <div className="flex items-center gap-2 flex-none ml-auto">
              <Button
                className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50 p-2"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownloadCurrentList}
                aria-label="Download List"
                title="Download List"
              >
                <span className="sr-only">Download List</span>
              </Button>
              <Button
                className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                onClick={() => setShowBiometricExport(true)}
              >
                Import Biometric Attendance
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={attendanceLogColumns}
          data={paginatedAttendance}
          emptyMessage="No attendance records found"
        />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <span>
            Showing {showingFrom} to {showingTo} of {filteredAttendance.length} records
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Items per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) || 10)}
                className="px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600">Page</span>
              <select
                value={Math.min(page, pageCount - 1)}
                onChange={(e) => setPage(Math.min(pageCount - 1, Math.max(0, Number(e.target.value) || 0)))}
                className="px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={filteredAttendance.length === 0}
              >
                {Array.from({ length: pageCount }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1} / {pageCount}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              disabled={page >= pageCount - 1}
              onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        title="Upload Attendance"
        size="xl"
      >
        <AttendanceUploadForm
          onSubmit={handleSubmitAttendance}
          onCancel={() => setShowUploadForm(false)}
        />
      </Modal>

      {/* Biometric Export Modal */}
      <Modal
        isOpen={showBiometricExport}
        onClose={() => setShowBiometricExport(false)}
        title="Import Biometric Attendance"
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-1">Start date</div>
              <input
                type="date"
                value={bioStartDate}
                onChange={(e) => setBioStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700 mb-1">End date</div>
              <input
                type="date"
                value={bioEndDate}
                onChange={(e) => setBioEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 mb-1">Employee</div>
            <select
              value={bioEmployeeCode}
              onChange={(e) => setBioEmployeeCode(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All employees</option>
              {employees
                .map((emp) => {
                  const code =
                    emp?.biometricId ||
                    emp?.emp_code ||
                    emp?.employeeCode ||
                    emp?.employeeId ||
                    emp?.id;
                  const name = emp?.name || emp?.employeeName || code || 'Unknown';
                  const codeStr = code ? String(code) : null;
                  const nameStr = name ? String(name) : 'Unknown';
                  return {
                    code: codeStr,
                    name: nameStr,
                    label: `${nameStr}${codeStr ? ` (${codeStr})` : ''}`,
                    // Use a composite key to avoid duplicate <option> keys when emp codes repeat (e.g. ECOS0000).
                    key: codeStr ? `${codeStr}::${nameStr}` : null,
                  };
                })
                .filter((x) => x.code && x.key)
                // Deduplicate identical code+name pairs (still allows same code for different names).
                .filter(
                  (() => {
                    const seen = new Set();
                    return (x) => {
                      if (seen.has(x.key)) return false;
                      seen.add(x.key);
                      return true;
                    };
                  })()
                )
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((x) => (
                  <option key={x.key} value={x.code}>
                    {x.label}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              onClick={() => setShowBiometricExport(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={downloadBiometricCsv}>
              Download CSV
            </Button>
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
                  key: 'source',
                  title: 'Check-in Type',
                  render: (value) => {
                    const v = String(value || '').toLowerCase();
                    const label = v === 'machine' ? 'Machine' : v === 'manual' ? 'Manual' : (value || '--');
                    const cls =
                      v === 'machine'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : v === 'manual'
                          ? 'bg-slate-100 text-slate-800 border-slate-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200';
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${cls}`}>
                        {label}
                      </span>
                    );
                  }
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

export default AttendanceOverviewPage;
