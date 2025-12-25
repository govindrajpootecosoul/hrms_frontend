'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Home,
  Clock,
  CheckCircle,
  Search,
  Edit,
  Trash2,
  Plus,
  Upload,
  Download,
  ArrowUpDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

// Mock data - Expanded dataset
const generateAttendanceData = () => {
  const employees = [
    { code: 'EMP001', name: 'John Doe', dept: 'Engineering' },
    { code: 'EMP002', name: 'Jane Smith', dept: 'Sales' },
    { code: 'EMP003', name: 'Mike Johnson', dept: 'Finance' },
    { code: 'EMP004', name: 'Sarah Williams', dept: 'Marketing' },
    { code: 'EMP005', name: 'David Brown', dept: 'Engineering' },
    { code: 'EMP006', name: 'Emily Davis', dept: 'HR' },
    { code: 'EMP007', name: 'Robert Wilson', dept: 'Sales' },
    { code: 'EMP008', name: 'Lisa Anderson', dept: 'Finance' },
    { code: 'EMP009', name: 'Alex Kumar', dept: 'Engineering' },
    { code: 'EMP010', name: 'Priya Sharma', dept: 'Marketing' },
    { code: 'EMP011', name: 'Rajesh Patel', dept: 'Engineering' },
    { code: 'EMP012', name: 'Sneha Reddy', dept: 'Sales' },
    { code: 'EMP013', name: 'Vikram Singh', dept: 'Finance' },
    { code: 'EMP014', name: 'Anita Desai', dept: 'Marketing' },
    { code: 'EMP015', name: 'Rahul Mehta', dept: 'Engineering' },
    { code: 'EMP016', name: 'Kavita Nair', dept: 'HR' },
    { code: 'EMP017', name: 'Arjun Menon', dept: 'Sales' },
    { code: 'EMP018', name: 'Divya Iyer', dept: 'Finance' },
    { code: 'EMP019', name: 'Nikhil Agarwal', dept: 'Engineering' },
    { code: 'EMP020', name: 'Meera Joshi', dept: 'Marketing' },
  ];

  const statuses = ['Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Late', 'Absent', 'On Leave', 'WFH'];
  const checkInTimes = ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:30'];
  const checkOutTimes = ['18:00', '18:05', '18:10', '18:15', '18:20', '18:30', '18:45'];
  
  const data: any[] = [];
  let id = 1;
  
  // Generate data for the last 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    employees.forEach((emp) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      let checkIn = null;
      let checkOut = null;
      let totalHours = 0;
      
      if (status === 'Present' || status === 'Late') {
        checkIn = checkInTimes[Math.floor(Math.random() * checkInTimes.length)];
        checkOut = checkOutTimes[Math.floor(Math.random() * checkOutTimes.length)];
        const [inHour, inMin] = checkIn.split(':').map(Number);
        const [outHour, outMin] = checkOut.split(':').map(Number);
        const inMinutes = inHour * 60 + inMin;
        const outMinutes = outHour * 60 + outMin;
        totalHours = Math.round(((outMinutes - inMinutes) / 60) * 100) / 100;
      }
      
      data.push({
        id: String(id++),
        employeeCode: emp.code,
        employeeName: emp.name,
        department: emp.dept,
        date: dateStr,
        checkIn,
        checkOut,
        totalHours,
        status,
      });
    });
  }
  
  return data;
};

const mockAttendanceData = generateAttendanceData();

const monthlyPresenceData = [
  { month: 'Jan', present: 85, absent: 8, leave: 5, wfh: 12 },
  { month: 'Feb', present: 88, absent: 5, leave: 4, wfh: 10 },
  { month: 'Mar', present: 90, absent: 3, leave: 6, wfh: 8 },
  { month: 'Apr', present: 87, absent: 6, leave: 5, wfh: 9 },
  { month: 'May', present: 89, absent: 4, leave: 4, wfh: 10 },
  { month: 'Jun', present: 91, absent: 2, leave: 5, wfh: 9 },
];

const teamAttendanceData = [
  { department: 'Engineering', present: 45, absent: 3, leave: 2, wfh: 5 },
  { department: 'Sales', present: 28, absent: 2, leave: 1, wfh: 3 },
  { department: 'Finance', present: 18, absent: 1, leave: 1, wfh: 2 },
  { department: 'Marketing', present: 15, absent: 1, leave: 0, wfh: 2 },
  { department: 'HR', present: 12, absent: 0, leave: 1, wfh: 1 },
];

const attendancePercentageData = [
  { status: 'Present', count: 85, percentage: 85 },
  { status: 'Absent', count: 8, percentage: 8 },
  { status: 'On Leave', count: 5, percentage: 5 },
  { status: 'WFH', count: 12, percentage: 12 },
];

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function AttendanceOverview() {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeName: '',
    department: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'Present',
  });
  const [attendanceData, setAttendanceData] = useState(mockAttendanceData);
  const itemsPerPage = 10;

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = attendanceData.filter(a => a.date === today);
    
    // Get unique employees count
    const uniqueEmployees = new Set(attendanceData.map(a => a.employeeCode)).size;
    
    return {
      totalEmployees: uniqueEmployees || 142,
      presentToday: todayData.filter(a => a.status === 'Present').length,
      absentToday: todayData.filter(a => a.status === 'Absent').length,
      onLeave: todayData.filter(a => a.status === 'On Leave').length,
      onWFH: todayData.filter(a => a.status === 'WFH').length,
      lateCheckins: todayData.filter(a => a.status === 'Late').length,
      leaveApprovals: 12,
    };
  }, [attendanceData]);

  // Generate last 7 days employee trends data
  const last7DaysTrends = useMemo(() => {
    const today = new Date();
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    // Get unique employees
    const uniqueEmployees = Array.from(new Set(attendanceData.map(a => a.employeeCode)));
    
    return uniqueEmployees.map(empCode => {
      const emp = attendanceData.find(a => a.employeeCode === empCode);
      if (!emp) return null;
      
      const trends = last7Days.map(date => {
        const dayData = attendanceData.find(
          a => a.employeeCode === empCode && a.date === date
        );
        return dayData?.status || 'Absent';
      });

      // Filter by selected status if any
      if (selectedStatusFilter) {
        const hasSelectedStatus = trends.some(t => t === selectedStatusFilter);
        if (!hasSelectedStatus) return null;
      }

      return {
        employeeCode: empCode,
        employeeName: emp.employeeName,
        department: emp.department,
        trends,
        dates: last7Days,
      };
    }).filter(Boolean);
  }, [attendanceData, selectedStatusFilter]);

  // Sales person attendance data
  const salesPersonAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const salesEmployees = attendanceData.filter(
      a => a.department === 'Sales' && a.date === today
    );
    return salesEmployees;
  }, [attendanceData]);

  // Filter and sort attendance data - default to daily
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...attendanceData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(item => item.department === selectedDepartment);
    }

    // Apply date range filter based on view mode - DEFAULT TO DAILY
    const today = new Date();
    if (viewMode === 'daily' || viewMode === null) {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(item => item.date === todayStr);
    } else if (viewMode === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo && itemDate <= today;
      });
    } else if (viewMode === 'monthly') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo && itemDate <= today;
      });
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [attendanceData, searchTerm, selectedDepartment, viewMode, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
  };

  const handleAdd = () => {
    setFormData({
      employeeCode: '',
      employeeName: '',
      department: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'Present',
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (attendance: any) => {
    setSelectedAttendance(attendance);
    setFormData({
      employeeCode: attendance.employeeCode,
      employeeName: attendance.employeeName,
      department: attendance.department,
      date: attendance.date,
      checkIn: attendance.checkIn || '',
      checkOut: attendance.checkOut || '',
      status: attendance.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      setAttendanceData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSave = () => {
    if (isAddDialogOpen) {
      const newAttendance = {
        id: String(Date.now()),
        ...formData,
        totalHours: formData.checkIn && formData.checkOut
          ? calculateHours(formData.checkIn, formData.checkOut)
          : 0,
      };
      setAttendanceData(prev => [...prev, newAttendance]);
      setIsAddDialogOpen(false);
    } else if (isEditDialogOpen && selectedAttendance) {
      setAttendanceData(prev =>
        prev.map(item =>
          item.id === selectedAttendance.id
            ? {
                ...formData,
                id: selectedAttendance.id,
                totalHours: formData.checkIn && formData.checkOut
                  ? calculateHours(formData.checkIn, formData.checkOut)
                  : 0,
              }
            : item
        )
      );
      setIsEditDialogOpen(false);
      setSelectedAttendance(null);
    }
  };

  const calculateHours = (checkIn: string, checkOut: string) => {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    return Math.round(((outMinutes - inMinutes) / 60) * 100) / 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'On Leave':
        return 'bg-blue-100 text-blue-800';
      case 'WFH':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImportBiometric = () => {
    alert('Biometric data import simulated! This would connect to biometric device API in production.');
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Employees</p>
                <p className="text-3xl font-bold mt-2">{kpis.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Present Today</p>
                <p className="text-3xl font-bold mt-2">{kpis.presentToday}</p>
              </div>
              <UserCheck className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Absent Today</p>
                <p className="text-3xl font-bold mt-2">{kpis.absentToday}</p>
              </div>
              <UserX className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">On Leave</p>
                <p className="text-3xl font-bold mt-2">{kpis.onLeave}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">On WFH</p>
                <p className="text-3xl font-bold mt-2">{kpis.onWFH}</p>
              </div>
              <Home className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Late Check-ins</p>
                <p className="text-3xl font-bold mt-2">{kpis.lateCheckins}</p>
              </div>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Leave Approvals</p>
                <p className="text-3xl font-bold mt-2">{kpis.leaveApprovals}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Attendance Percentage Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Attendance Distribution</CardTitle>
                  <CardDescription>Click on a bar to filter trends below</CardDescription>
                </div>
                {selectedStatusFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStatusFilter(null)}
                    className="text-xs"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={attendancePercentageData} 
                  layout="vertical"
                  onClick={(data: any) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const status = data.activePayload[0].payload.status;
                      setSelectedStatusFilter(status);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                    {attendancePercentageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{ cursor: 'pointer' }}
                        className={selectedStatusFilter === entry.status ? 'opacity-80' : ''}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Last 7 Days Trends Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last 7 Days Trends</CardTitle>
              <CardDescription>
                {selectedStatusFilter 
                  ? `Employees with ${selectedStatusFilter} status in last 7 days`
                  : 'Employee attendance trends for last 7 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[150px]">Employee</TableHead>
                      {(() => {
                        const today = new Date();
                        const days = [];
                        for (let i = 6; i >= 0; i--) {
                          const date = new Date(today);
                          date.setDate(today.getDate() - i);
                          days.push(date);
                        }
                        return days.map((date, idx) => (
                          <TableHead key={idx} className="text-center text-xs w-[80px]">
                            {format(date, 'EEE')}
                            <br />
                            <span className="text-[10px] text-muted-foreground">
                              {format(date, 'MMM dd')}
                            </span>
                          </TableHead>
                        ));
                      })()}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {last7DaysTrends.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      last7DaysTrends.slice(0, 10).map((emp: any) => (
                        <TableRow key={emp.employeeCode}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-sm">{emp.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{emp.department}</p>
                            </div>
                          </TableCell>
                          {emp.trends.map((status: string, idx: number) => (
                            <TableCell key={idx} className="text-center">
                              <Badge 
                                className={`text-[10px] px-1.5 py-0 ${
                                  status === 'Present' ? 'bg-green-100 text-green-800' :
                                  status === 'Absent' ? 'bg-red-100 text-red-800' :
                                  status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                  status === 'On Leave' ? 'bg-blue-100 text-blue-800' :
                                  status === 'WFH' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {status === 'Present' ? 'P' :
                                 status === 'Absent' ? 'A' :
                                 status === 'Late' ? 'L' :
                                 status === 'On Leave' ? 'L' :
                                 status === 'WFH' ? 'W' : '-'}
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Person Attendance - Below Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales Person Attendance</CardTitle>
            <CardDescription>Today's attendance for Sales team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesPersonAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No sales person attendance data for today
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesPersonAttendance.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.employeeName}</TableCell>
                        <TableCell>{item.checkIn || '-'}</TableCell>
                        <TableCell>{item.checkOut || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="View Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (Default)</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
              <Button variant="outline" onClick={handleImportBiometric}>
                <Upload className="mr-2 h-4 w-4" />
                Import from Biometric
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Log Table - Very Important - Daily Basis */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Attendance Log - Daily Basis</CardTitle>
              <CardDescription className="font-medium">View and manage employee attendance records for today</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('employeeCode')}>
                    <div className="flex items-center gap-2">
                      Employee Code
                      {sortConfig?.key === 'employeeCode' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('employeeName')}>
                    <div className="flex items-center gap-2">
                      Employee Name
                      {sortConfig?.key === 'employeeName' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('department')}>
                    <div className="flex items-center gap-2">
                      Department
                      {sortConfig?.key === 'department' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-2">
                      Date
                      {sortConfig?.key === 'date' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeCode}</TableCell>
                      <TableCell>{item.employeeName}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{item.checkIn || '-'}</TableCell>
                      <TableCell>{item.checkOut || '-'}</TableCell>
                      <TableCell>{item.totalHours > 0 ? `${item.totalHours} hrs` : '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
                {filteredAndSortedData.length} records
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Attendance Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        setIsEditDialogOpen(open);
        if (!open) {
          setSelectedAttendance(null);
          setFormData({
            employeeCode: '',
            employeeName: '',
            department: '',
            date: '',
            checkIn: '',
            checkOut: '',
            status: 'Present',
          });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAddDialogOpen ? 'Mark Attendance' : 'Edit Attendance'}</DialogTitle>
            <DialogDescription>
              {isAddDialogOpen
                ? 'Add a new attendance record manually'
                : 'Update attendance record details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Employee Code</label>
                <Input
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Employee Name</label>
                <Input
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Department</label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Check-in Time</label>
                <Input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Check-out Time</label>
                <Input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="WFH">WFH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isAddDialogOpen ? 'Add' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

