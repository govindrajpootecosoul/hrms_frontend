'use client';

import { useState, useMemo } from 'react';
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
import { Users, UserCheck, UserX, CalendarDays, Home, Clock3, CheckCircle2, Edit, Trash2, Plus, Search } from 'lucide-react';
import { mockEmployees } from '@/lib/utils/hrmsMockData';

const AttendanceOverviewPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('daily');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate mock data for last 7 days
  const generateMockAttendance = () => {
    const mockData = [];
    const today = new Date();
    const employees = [
      { biometricId: 'EMP001', employeeName: 'John Doe', department: 'Engineering' },
      { biometricId: 'EMP002', employeeName: 'Jane Smith', department: 'Sales' },
      { biometricId: 'EMP003', employeeName: 'Mike Johnson', department: 'Finance' },
      { biometricId: 'EMP004', employeeName: 'Sarah Williams', department: 'Marketing' },
      { biometricId: 'EMP005', employeeName: 'David Brown', department: 'Sales' },
      { biometricId: 'EMP006', employeeName: 'Emily Davis', department: 'Engineering' },
      { biometricId: 'EMP007', employeeName: 'Robert Wilson', department: 'Sales' },
      { biometricId: 'EMP008', employeeName: 'Lisa Anderson', department: 'Marketing' },
      { biometricId: 'EMP009', employeeName: 'Alex Kumar', department: 'Engineering' },
      { biometricId: 'EMP010', employeeName: 'Priya Sharma', department: 'Sales' },
      { biometricId: 'EMP011', employeeName: 'Rajesh Patel', department: 'Finance' },
      { biometricId: 'EMP012', employeeName: 'Sneha Reddy', department: 'Sales' },
      { biometricId: 'EMP013', employeeName: 'Vikram Singh', department: 'Engineering' },
      { biometricId: 'EMP014', employeeName: 'Anita Desai', department: 'Marketing' },
      { biometricId: 'EMP015', employeeName: 'Rahul Mehta', department: 'Sales' },
      { biometricId: 'EMP016', employeeName: 'Arjun Menon', department: 'Sales' },
      { biometricId: 'EMP017', employeeName: 'Kavita Nair', department: 'Finance' },
      { biometricId: 'EMP018', employeeName: 'Nikhil Agarwal', department: 'Engineering' },
      { biometricId: 'EMP019', employeeName: 'Suresh Kumar', department: 'Sales' },
      { biometricId: 'EMP020', employeeName: 'Meera Joshi', department: 'Marketing' }
    ];
    
    // Generate data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      employees.forEach((emp, empIndex) => {
        let status = 'present';
        let timeIn = '09:00';
        let timeOut = '18:00';
        let isLate = false;
        
        // Create varied attendance patterns
        if (i === 0) {
          // Today
          if (empIndex === 0) { status = 'present'; timeIn = '09:05'; timeOut = '18:30'; }
          else if (empIndex === 1) { status = 'present'; timeIn = '09:00'; timeOut = '18:05'; isLate = true; }
          else if (empIndex === 2) { status = 'on-leave'; timeIn = null; timeOut = null; }
          else if (empIndex === 4) { status = 'present'; timeIn = '09:20'; timeOut = '18:45'; }
          else if (empIndex === 6) { status = 'present'; timeIn = '09:25'; timeOut = '18:20'; }
          else if (empIndex === 7) { status = 'present'; timeIn = '09:15'; timeOut = '18:30'; }
          else if (empIndex === 11) { status = 'present'; timeIn = '09:25'; timeOut = '18:20'; }
          else if (empIndex === 15) { status = 'present'; timeIn = '09:15'; timeOut = '18:30'; }
          else { status = 'present'; }
        } else {
          // Past days - create varied patterns
          const dayPattern = i % 4;
          if (dayPattern === 0) {
            if (empIndex % 3 === 0) status = 'present';
            else if (empIndex % 3 === 1) status = 'wfh';
            else status = 'present';
          } else if (dayPattern === 1) {
            if (empIndex % 4 === 0) status = 'on-leave';
            else status = 'present';
          } else if (dayPattern === 2) {
            if (empIndex % 5 === 0) status = 'absent';
            else status = 'present';
          } else {
            status = 'present';
          }
        }
        
        if (status === 'on-leave' || status === 'absent') {
          timeIn = null;
          timeOut = null;
        } else if (status === 'wfh') {
          timeIn = '09:30';
          timeOut = '18:30';
        }
        
        mockData.push({
          id: `${emp.biometricId}-${dateStr}`,
          date: dateStr,
          biometricId: emp.biometricId,
          employeeName: emp.employeeName,
          department: emp.department,
          status: status,
          timeIn: timeIn,
          timeOut: timeOut,
          isLate: isLate
        });
      });
    }
    
    return mockData;
  };
  
  const [attendance, setAttendance] = useState(generateMockAttendance());

  const handleUploadAttendance = () => {
    setShowUploadForm(true);
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

  // Calculate statistics from attendance data
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(record => record.date === today);
    
    const uniqueEmployees = new Set(attendance.map(record => record.biometricId));
    const totalEmployees = uniqueEmployees.size;
    
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const absentToday = todayRecords.filter(r => r.status === 'absent').length;
    const onLeaveToday = todayRecords.filter(r => r.status === 'on-leave').length;
    const onWFHToday = todayRecords.filter(r => r.status === 'wfh' || r.status === 'work-from-home').length;
    
    const lateCheckIns = todayRecords.filter(r => {
      if (!r.timeIn || r.status !== 'present') return false;
      const [hours, minutes] = r.timeIn.split(':').map(Number);
      return hours > 9 || (hours === 9 && minutes > 0);
    }).length;
    
    const leaveApprovals = 12;
    
    return {
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      onWFHToday,
      lateCheckIns,
      leaveApprovals
    };
  }, [attendance]);

  // Calculate attendance distribution for chart
  const attendanceDistribution = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(record => record.date === today);
    
    const uniqueEmployees = new Set(attendance.map(record => record.biometricId));
    const totalEmployees = uniqueEmployees.size || 1;
    
    const presentCount = todayRecords.filter(r => r.status === 'present').length;
    const absentCount = todayRecords.filter(r => r.status === 'absent').length;
    const onLeaveCount = todayRecords.filter(r => r.status === 'on-leave').length;
    const wfhCount = todayRecords.filter(r => r.status === 'wfh' || r.status === 'work-from-home').length;
    
    const presentPercent = Math.round((presentCount / totalEmployees) * 100);
    const absentPercent = Math.round((absentCount / totalEmployees) * 100);
    const onLeavePercent = Math.round((onLeaveCount / totalEmployees) * 100);
    const wfhPercent = Math.round((wfhCount / totalEmployees) * 100);
    
    return {
      data: [presentPercent, absentPercent, onLeavePercent, wfhPercent],
      categories: ['Present', 'Absent', 'On Leave', 'WFH'],
      colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']
    };
  }, [attendance]);

  // Generate last 7 days trends data
  const last7DaysTrends = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
    };

    const employeeMap = new Map();
    attendance.forEach(record => {
      if (!employeeMap.has(record.biometricId)) {
        const employee = mockEmployees.find(emp => emp.biometricId === record.biometricId);
        employeeMap.set(record.biometricId, {
          biometricId: record.biometricId,
          name: record.employeeName,
          department: record.department || employee?.department || 'General'
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
    const today = new Date().toISOString().split('T')[0];
    const salesTeam = attendance.filter(record => 
      record.date === today && 
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
    const today = new Date().toISOString().split('T')[0];
    let filtered = attendance.filter(record => {
      if (filterPeriod === 'daily') {
        return record.date === today;
      }
      return true;
    });

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(record => record.department === filterDepartment);
    }

    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.biometricId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [attendance, filterPeriod, filterDepartment, searchQuery]);

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
            { title: 'Total Employees', value: stats.totalEmployees, icon: Users, gradient: 'from-blue-600 via-indigo-600 to-blue-700' },
            { title: 'Present Today', value: stats.presentToday, icon: UserCheck, gradient: 'from-green-600 via-emerald-600 to-green-700' },
            { title: 'Absent Today', value: stats.absentToday, icon: UserX, gradient: 'from-red-600 via-rose-600 to-red-700' },
            { title: 'On Leave', value: stats.onLeaveToday, icon: CalendarDays, gradient: 'from-purple-600 via-violet-600 to-purple-700' },
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-r ${kpi.gradient} rounded-xl p-5 text-white shadow-lg`}
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
            { title: 'On WFH', value: stats.onWFHToday, icon: Home, gradient: 'from-pink-600 via-rose-600 to-pink-700' },
            { title: 'Late Check-ins', value: stats.lateCheckIns, icon: Clock3, gradient: 'from-orange-600 via-amber-600 to-orange-700' },
            { title: 'Leave Approvals', value: stats.leaveApprovals, icon: CheckCircle2, gradient: 'from-emerald-600 via-teal-600 to-emerald-700' },
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-r ${kpi.gradient} rounded-xl p-5 text-white shadow-lg`}
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
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily (Default)</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="office">Office</option>
              <option value="remote">Remote</option>
            </select>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowUploadForm(true)}
            >
              Mark Attendance
            </Button>
            <Button
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              onClick={handleUploadAttendance}
            >
              Import from Biometric
            </Button>
            <div className="flex-1 min-w-[200px]">
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
          </div>
        </div>

        {/* Table */}
        <Table
          columns={attendanceLogColumns}
          data={filteredAttendance.slice(0, 10)}
          emptyMessage="No attendance records found"
        />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <span>Showing 1 to {Math.min(10, filteredAttendance.length)} of {filteredAttendance.length} records</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              disabled={true}
            >
              Previous
            </Button>
            <Button
              size="sm"
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              disabled={filteredAttendance.length <= 10}
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
    </div>
  );
};

export default AttendanceOverviewPage;
