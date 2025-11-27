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
import StatisticsCards from '@/components/hrms/StatisticsCards';
import { Users, UserCheck, UserX, CalendarDays, Home, Clock3, CheckCircle2 } from 'lucide-react';
import { mockEmployees } from '@/lib/utils/hrmsMockData';

const AttendancePage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Generate mock data for last 7 days
  const generateMockAttendance = () => {
    const mockData = [];
    const today = new Date();
    const employees = [
      { biometricId: 'EMP001', employeeName: 'John Doe' },
      { biometricId: 'EMP002', employeeName: 'Jane Smith' },
      { biometricId: 'EMP003', employeeName: 'Mike Johnson' },
      { biometricId: 'EMP004', employeeName: 'Sarah Williams' }
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
        
        // Create varied attendance patterns
        if (i === 0) {
          // Today
          if (empIndex === 0) status = 'present';
          else if (empIndex === 1) status = 'present';
          else if (empIndex === 2) status = 'on-leave';
          else status = 'wfh';
        } else if (i === 1) {
          // Yesterday
          if (empIndex === 0) status = 'on-leave';
          else if (empIndex === 1) status = 'present';
          else if (empIndex === 2) status = 'present';
          else status = 'wfh';
        } else if (i === 2) {
          // 2 days ago
          if (empIndex === 0) status = 'present';
          else if (empIndex === 1) status = 'wfh';
          else if (empIndex === 2) status = 'wfh';
          else status = 'present';
        } else if (i === 3) {
          // 3 days ago
          if (empIndex === 0) status = 'wfh';
          else if (empIndex === 1) status = 'present';
          else if (empIndex === 2) status = 'on-leave';
          else status = 'on-leave';
        } else if (i === 4) {
          // 4 days ago
          if (empIndex === 0) status = 'absent';
          else if (empIndex === 1) status = 'present';
          else if (empIndex === 2) status = 'present';
          else status = 'absent';
        } else if (i === 5) {
          // 5 days ago
          if (empIndex === 0) status = 'present';
          else if (empIndex === 1) status = 'present';
          else if (empIndex === 2) status = 'absent';
          else status = 'on-leave';
        } else {
          // 6 days ago
          if (empIndex === 0) status = 'present';
          else if (empIndex === 1) status = 'on-leave';
          else if (empIndex === 2) status = 'present';
          else status = 'wfh';
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
          status: status,
          timeIn: timeIn,
          timeOut: timeOut
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
      // Add manual attendance record
      const newRecord = {
        id: Date.now().toString(),
        ...data.data,
        employeeName: 'Manual Entry' // In real app, fetch employee name by biometric ID
      };
      setAttendance(prev => [...prev, newRecord]);
      toast.success('Attendance record added successfully');
    } else {
      // Handle CSV upload
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
    
    // Get unique employees
    const uniqueEmployees = new Set(attendance.map(record => record.biometricId));
    const totalEmployees = uniqueEmployees.size;
    
    // Today's stats
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const absentToday = todayRecords.filter(r => r.status === 'absent').length;
    const onLeaveToday = todayRecords.filter(r => r.status === 'on-leave').length;
    const onWFHToday = todayRecords.filter(r => r.status === 'wfh' || r.status === 'work-from-home').length;
    
    // Late check-ins (assuming timeIn after 9:00 is late)
    const lateCheckIns = todayRecords.filter(r => {
      if (!r.timeIn || r.status !== 'present') return false;
      const [hours] = r.timeIn.split(':').map(Number);
      return hours >= 9 && hours > 9;
    }).length;
    
    // Leave approvals (mock data - in real app, fetch from leave requests)
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
    
    // Get unique employees count
    const uniqueEmployees = new Set(attendance.map(record => record.biometricId));
    const totalEmployees = uniqueEmployees.size || 1; // Avoid division by zero
    
    // Count by status - combine on-leave with absent
    const presentCount = todayRecords.filter(r => r.status === 'present').length;
    const absentCount = todayRecords.filter(r => r.status === 'absent' || r.status === 'on-leave').length;
    const wfhCount = todayRecords.filter(r => r.status === 'wfh' || r.status === 'work-from-home').length;
    
    // Calculate percentages
    const presentPercent = Math.round((presentCount / totalEmployees) * 100);
    const absentPercent = Math.round((absentCount / totalEmployees) * 100);
    const wfhPercent = Math.round((wfhCount / totalEmployees) * 100);
    
    return {
      data: [presentPercent, absentPercent, wfhPercent],
      categories: ['Present', 'Absent', 'WFH'],
      colors: ['#10b981', '#ef4444', '#3b82f6'] // green, red, blue
    };
  }, [attendance]);

  // Generate last 7 days trends data
  const last7DaysTrends = useMemo(() => {
    // Get last 7 days dates
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Format dates for display
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
    };

    // Get unique employees with their departments
    const employeeMap = new Map();
    attendance.forEach(record => {
      if (!employeeMap.has(record.biometricId)) {
        const employee = mockEmployees.find(emp => emp.biometricId === record.biometricId);
        employeeMap.set(record.biometricId, {
          biometricId: record.biometricId,
          name: record.employeeName,
          department: employee?.department || 'General'
        });
      }
    });

    // Create trends data for each employee
    const trendsData = Array.from(employeeMap.values()).map(emp => {
      const row = {
        id: emp.biometricId,
        employee: emp.name,
        department: emp.department
      };
      
      // Add date columns
      dates.forEach(date => {
        const record = attendance.find(r => 
          r.biometricId === emp.biometricId && r.date === date
        );
        
        // Map status to badge letter and color
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
              badge = { letter: 'W', color: 'warning' };
              break;
            case 'half-day':
              badge = { letter: 'H', color: 'warning' };
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

  return (
    <div className="min-h-screen space-y-8">
      {/* Top metric cards */}
      <StatisticsCards
        cards={[
          {
            key: 'total-employees',
            title: 'Total Employees',
            value: stats.totalEmployees,
            icon: <Users className="w-6 h-6" />,
            color: 'primary'
          },
          {
            key: 'present-today',
            title: 'Present Today',
            value: stats.presentToday,
            icon: <UserCheck className="w-6 h-6" />,
            color: 'success'
          },
          {
            key: 'absent-today',
            title: 'Absent Today',
            value: stats.absentToday,
            icon: <UserX className="w-6 h-6" />,
            color: 'danger'
          },
          {
            key: 'on-leave',
            title: 'On Leave',
            value: stats.onLeaveToday,
            icon: <CalendarDays className="w-6 h-6" />,
            color: 'primary'
          },
          {
            key: 'on-wfh',
            title: 'On WFH',
            value: stats.onWFHToday,
            icon: <Home className="w-6 h-6" />,
            color: 'secondary'
          },
          {
            key: 'late-checkins',
            title: 'Late Check-ins',
            value: stats.lateCheckIns,
            icon: <Clock3 className="w-6 h-6" />,
            color: 'accent'
          },
          {
            key: 'leave-approvals',
            title: 'Leave Approvals',
            value: stats.leaveApprovals,
            icon: <CheckCircle2 className="w-6 h-6" />,
            color: 'success'
          }
        ]}
        compact
      />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Attendance Overview
        </h1>
        <p className="text-lg text-neutral-600">
          Track and manage employee attendance
        </p>
      </div>

      {/* Attendance Distribution Chart and Trends Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <BarGraph
          title="Attendance Distribution"
          subtitle="Click on a bar to filter trends below"
          data={attendanceDistribution.data}
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
            // Handle bar click - can be used to filter trends
            console.log('Bar clicked:', dataPoint);
          }}
        />

        {/* Trends Table */}
        <Card
          title="Last 7 Days Trends"
          subtitle="Employee attendance trends for last 7 days"
        >
          <Table
              columns={[
                {
                  key: 'employee',
                  title: 'Employee',
                  render: (value, row) => (
                    <div>
                      <div className="font-semibold text-neutral-900">{value}</div>
                      <div className="text-xs text-neutral-600 mt-0.5">{row.department}</div>
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
                      secondary: 'bg-purple-100 text-purple-700 border-purple-200',
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

      {/* Attendance Table */}
      <AttendanceTable
        attendance={attendance}
        onStatusUpdate={handleStatusUpdate}
        onExport={handleExportAttendance}
        onUpload={handleUploadAttendance}
      />

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

export default AttendancePage;
