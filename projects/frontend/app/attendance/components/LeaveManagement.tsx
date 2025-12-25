'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  ArrowUpDown,
  Settings,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, differenceInDays, parseISO } from 'date-fns';

// Mock leave data - Expanded dataset
const generateLeaveRequests = () => {
  const employees = [
    { name: 'John Doe', code: 'EMP001' },
    { name: 'Jane Smith', code: 'EMP002' },
    { name: 'Mike Johnson', code: 'EMP003' },
    { name: 'Sarah Williams', code: 'EMP004' },
    { name: 'David Brown', code: 'EMP005' },
    { name: 'Emily Davis', code: 'EMP006' },
    { name: 'Robert Wilson', code: 'EMP007' },
    { name: 'Lisa Anderson', code: 'EMP008' },
    { name: 'Alex Kumar', code: 'EMP009' },
    { name: 'Priya Sharma', code: 'EMP010' },
    { name: 'Rajesh Patel', code: 'EMP011' },
    { name: 'Sneha Reddy', code: 'EMP012' },
    { name: 'Vikram Singh', code: 'EMP013' },
    { name: 'Anita Desai', code: 'EMP014' },
    { name: 'Rahul Mehta', code: 'EMP015' },
    { name: 'Kavita Nair', code: 'EMP016' },
    { name: 'Arjun Menon', code: 'EMP017' },
    { name: 'Divya Iyer', code: 'EMP018' },
    { name: 'Nikhil Agarwal', code: 'EMP019' },
    { name: 'Meera Joshi', code: 'EMP020' },
  ];

  const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home', 'Compensatory Off', 'LOP'];
  const statuses = ['Pending', 'Approved', 'Rejected'];
  const reasons = [
    'Personal work',
    'Fever and cold',
    'Family vacation',
    'Home maintenance',
    'Medical appointment',
    'Recovery from surgery',
    'Family emergency',
    'Wedding',
    'Personal health checkup',
    'Child care',
    'Home renovation',
    'Religious festival',
    'Mental health day',
    'Dental appointment',
    'Moving to new house',
  ];

  const data: any[] = [];
  let id = 1;

  employees.forEach((emp, empIndex) => {
    // Each employee has 2-4 leave requests
    const numRequests = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numRequests; i++) {
      const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      
      // Generate dates in the past 60 days and future 30 days
      const daysAgo = Math.floor(Math.random() * 90) - 30;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + daysAgo);
      const duration = Math.floor(Math.random() * 5) + 1;
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + duration - 1);
      
      const appliedDate = new Date(fromDate);
      appliedDate.setDate(appliedDate.getDate() - Math.floor(Math.random() * 7) - 1);
      
      let approvedBy = null;
      let approvedDate = null;
      let comments = null;
      
      if (status !== 'Pending') {
        approvedBy = ['HR Manager', 'Team Lead', 'Department Head'][Math.floor(Math.random() * 3)];
        approvedDate = new Date(appliedDate);
        approvedDate.setDate(approvedDate.getDate() + Math.floor(Math.random() * 3) + 1);
        comments = status === 'Approved' 
          ? ['Approved', 'Get well soon!', 'Enjoy your vacation!', 'Approved for WFH'][Math.floor(Math.random() * 4)]
          : ['Please use appropriate leave type', 'Not enough leave balance', 'Business critical period'][Math.floor(Math.random() * 3)];
      }
      
      data.push({
        id: String(id++),
        employeeName: emp.name,
        employeeCode: emp.code,
        leaveType,
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
        duration,
        reason,
        contactDuringLeave: `+91 9876543${String(empIndex).padStart(3, '0')}`,
        status,
        appliedDate: appliedDate.toISOString().split('T')[0],
        approvedBy,
        approvedDate: approvedDate ? approvedDate.toISOString().split('T')[0] : null,
        comments,
      });
    }
  });

  return data.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
};

const mockLeaveRequests = generateLeaveRequests();

const generateLeaveBalanceData = () => {
  const employees = [
    { code: 'EMP001', name: 'John Doe' },
    { code: 'EMP002', name: 'Jane Smith' },
    { code: 'EMP003', name: 'Mike Johnson' },
    { code: 'EMP004', name: 'Sarah Williams' },
    { code: 'EMP005', name: 'David Brown' },
    { code: 'EMP006', name: 'Emily Davis' },
    { code: 'EMP007', name: 'Robert Wilson' },
    { code: 'EMP008', name: 'Lisa Anderson' },
    { code: 'EMP009', name: 'Alex Kumar' },
    { code: 'EMP010', name: 'Priya Sharma' },
    { code: 'EMP011', name: 'Rajesh Patel' },
    { code: 'EMP012', name: 'Sneha Reddy' },
    { code: 'EMP013', name: 'Vikram Singh' },
    { code: 'EMP014', name: 'Anita Desai' },
    { code: 'EMP015', name: 'Rahul Mehta' },
    { code: 'EMP016', name: 'Kavita Nair' },
    { code: 'EMP017', name: 'Arjun Menon' },
    { code: 'EMP018', name: 'Divya Iyer' },
    { code: 'EMP019', name: 'Nikhil Agarwal' },
    { code: 'EMP020', name: 'Meera Joshi' },
  ];

  return employees.map(emp => ({
    employeeCode: emp.code,
    employeeName: emp.name,
    casualLeave: Math.floor(Math.random() * 5) + 7, // 7-12
    sickLeave: Math.floor(Math.random() * 3) + 3, // 3-6
    earnedLeave: Math.floor(Math.random() * 6) + 5, // 5-11
    compOff: Math.floor(Math.random() * 3), // 0-2
    lop: Math.floor(Math.random() * 2), // 0-1
  }));
};

const leaveBalanceData = generateLeaveBalanceData();



export default function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [pendingAction, setPendingAction] = useState<'Approved' | 'Rejected' | null>(null);
  const [isTenurePolicyDialogOpen, setIsTenurePolicyDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'balance' | 'requests'>('requests');
  const [tenurePolicy, setTenurePolicy] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tenureLeavePolicy');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      '0-6months': { casualLeave: 0, sickLeave: 3, earnedLeave: 0, compOff: 0 },
      '6-12months': { casualLeave: 6, sickLeave: 6, earnedLeave: 0, compOff: 0 },
      '1year+': { casualLeave: 12, sickLeave: 6, earnedLeave: 10, compOff: 0 },
    };
  });
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeCode: '',
    leaveType: 'Casual Leave',
    from: '',
    to: '',
    reason: '',
    contactDuringLeave: '',
  });
  const itemsPerPage = 10;

  // Calculate KPIs
  const kpis = useMemo(() => {
    return {
      totalOnLeave: leaveRequests.filter(l => l.status === 'Approved' && 
        new Date(l.from) <= new Date() && new Date(l.to) >= new Date()).length,
      leaveForApproval: leaveRequests.filter(l => l.status === 'Pending').length,
      approvedThisMonth: leaveRequests.filter(l => l.status === 'Approved' && 
        new Date(l.approvedDate || '').getMonth() === new Date().getMonth()).length,
      rejectedThisMonth: leaveRequests.filter(l => l.status === 'Rejected' && 
        new Date(l.approvedDate || '').getMonth() === new Date().getMonth()).length,
    };
  }, [leaveRequests]);

  // Filter and sort leave requests - sorted by date (latest first) for showing latest 10
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...leaveRequests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply leave type filter
    if (leaveTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.leaveType === leaveTypeFilter);
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        if (aValue === undefined || bValue === undefined) return 0;

        if (sortConfig.key === 'from' || sortConfig.key === 'to') {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          return sortConfig.direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0;
      });
    } else {
      // Default: Sort by 'from' date descending (latest first)
      filtered.sort((a, b) => {
        const aDate = new Date(a.from);
        const bDate = new Date(b.from);
        return bDate.getTime() - aDate.getTime();
      });
    }

    return filtered;
  }, [leaveRequests, searchTerm, statusFilter, leaveTypeFilter, sortConfig]);

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
      employeeName: '',
      employeeCode: '',
      leaveType: 'Casual Leave',
      from: '',
      to: '',
      reason: '',
      contactDuringLeave: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (leave: any) => {
    setSelectedLeave(leave);
    setFormData({
      employeeName: leave.employeeName,
      employeeCode: leave.employeeCode,
      leaveType: leave.leaveType,
      from: leave.from,
      to: leave.to,
      reason: leave.reason,
      contactDuringLeave: leave.contactDuringLeave,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      setLeaveRequests(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSave = () => {
    if (isAddDialogOpen) {
      const duration = differenceInDays(parseISO(formData.to), parseISO(formData.from)) + 1;
      const newLeave = {
        id: String(Date.now()),
        ...formData,
        duration,
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
        approvedBy: null,
        approvedDate: null,
        comments: null,
      };
      setLeaveRequests(prev => [...prev, newLeave]);
      setIsAddDialogOpen(false);
      alert('Leave request added successfully!');
    } else if (isEditDialogOpen && selectedLeave) {
      const duration = differenceInDays(parseISO(formData.to), parseISO(formData.from)) + 1;
      setLeaveRequests(prev =>
        prev.map(item =>
          item.id === selectedLeave.id
            ? { ...item, ...formData, duration }
            : item
        )
      );
      setIsEditDialogOpen(false);
      setSelectedLeave(null);
      alert('Leave request updated successfully!');
    }
  };

  const handleApprove = (leave: any, action: 'Approved' | 'Rejected') => {
    setSelectedLeave(leave);
    setApprovalComment('');
    setPendingAction(action);
    setIsApproveDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (!selectedLeave || !pendingAction) return;
    
    const action = pendingAction;
    const updatedLeave = {
      ...selectedLeave,
      status: action,
      approvedBy: 'HR Admin',
      approvedDate: new Date().toISOString().split('T')[0],
      comments: approvalComment,
    };

    setLeaveRequests(prev =>
      prev.map(item => (item.id === selectedLeave.id ? updatedLeave : item))
    );

    setIsApproveDialogOpen(false);
    setSelectedLeave(null);
    setApprovalComment('');
    setPendingAction(null);
    
    // Simulate email notification
    alert(`Leave request ${action.toLowerCase()}! Email notification sent to ${selectedLeave.employeeName}.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tenure-based Leave Policy Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Tenure-based Leave Policy</CardTitle>
              <CardDescription>Configure leave entitlements based on employee tenure</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsTenurePolicyDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure Leave Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">0-6 Months</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Casual Leave:</span>
                  <span className="font-medium">{tenurePolicy['0-6months'].casualLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sick Leave:</span>
                  <span className="font-medium">{tenurePolicy['0-6months'].sickLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Earned Leave:</span>
                  <span className="font-medium">{tenurePolicy['0-6months'].earnedLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compensatory Off:</span>
                  <span className="font-medium">{tenurePolicy['0-6months'].compOff} days</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">6-12 Months</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Casual Leave:</span>
                  <span className="font-medium">{tenurePolicy['6-12months'].casualLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sick Leave:</span>
                  <span className="font-medium">{tenurePolicy['6-12months'].sickLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Earned Leave:</span>
                  <span className="font-medium">{tenurePolicy['6-12months'].earnedLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compensatory Off:</span>
                  <span className="font-medium">{tenurePolicy['6-12months'].compOff} days</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">1 Year+</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Casual Leave:</span>
                  <span className="font-medium">{tenurePolicy['1year+'].casualLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sick Leave:</span>
                  <span className="font-medium">{tenurePolicy['1year+'].sickLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Earned Leave:</span>
                  <span className="font-medium">{tenurePolicy['1year+'].earnedLeave} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compensatory Off:</span>
                  <span className="font-medium">{tenurePolicy['1year+'].compOff} days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Table with Switch Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {viewMode === 'balance' ? 'Leave Balance Tracker' : 'Employee Leave Requests'}
              </CardTitle>
              <CardDescription>
                {viewMode === 'balance' 
                  ? 'Current leave balances for employees' 
                  : 'Manage and approve leave requests'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* Switch Bar */}
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button
                  variant={viewMode === 'balance' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('balance')}
                  className={viewMode === 'balance' ? 'bg-primary text-primary-foreground' : ''}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Balance
                </Button>
                <Button
                  variant={viewMode === 'requests' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('requests')}
                  className={viewMode === 'requests' ? 'bg-primary text-primary-foreground' : ''}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Requests
                </Button>
              </div>
              {viewMode === 'requests' && (
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Leave Request
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          {viewMode === 'requests' && (
            <div className="mb-4 flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                  <SelectItem value="Work From Home">Work From Home</SelectItem>
                  <SelectItem value="Compensatory Off">Compensatory Off</SelectItem>
                  <SelectItem value="LOP">Loss of Pay</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {viewMode === 'balance' ? (
                  <TableRow>
                    <TableHead>Employee Code</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Casual Leave</TableHead>
                    <TableHead>Sick Leave</TableHead>
                    <TableHead>Earned Leave</TableHead>
                    <TableHead>Comp Off</TableHead>
                    <TableHead>LOP</TableHead>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('employeeName')}>
                      <div className="flex items-center gap-2">
                        Employee Name
                        {sortConfig?.key === 'employeeName' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('leaveType')}>
                      <div className="flex items-center gap-2">
                        Leave Type
                        {sortConfig?.key === 'leaveType' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('from')}>
                      <div className="flex items-center gap-2">
                        From
                        {sortConfig?.key === 'from' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('to')}>
                      <div className="flex items-center gap-2">
                        To
                        {sortConfig?.key === 'to' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status
                        {sortConfig?.key === 'status' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {viewMode === 'balance' ? (
                  // Leave Balance Tracker rows
                  leaveBalanceData.slice(0, 10).map((employee) => (
                    <TableRow key={employee.employeeCode}>
                      <TableCell className="font-medium">{employee.employeeCode}</TableCell>
                      <TableCell>{employee.employeeName}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">{employee.casualLeave}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{employee.sickLeave}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-800">{employee.earnedLeave}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-cyan-100 text-cyan-800">{employee.compOff}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">{employee.lop}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Leave Requests rows - show only latest 10
                  filteredAndSortedData.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeName}</TableCell>
                      <TableCell>{item.leaveType}</TableCell>
                      <TableCell>{format(parseISO(item.from), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(parseISO(item.to), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{item.duration} day{item.duration !== 1 ? 's' : ''}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.reason}>
                        {item.reason}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.status === 'Pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(item, 'Approved')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(item, 'Rejected')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

          {/* Pagination - Only show if more than 10 entries */}
          {viewMode === 'requests' && filteredAndSortedData.length > 10 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing latest 10 of {filteredAndSortedData.length} records
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to full view or expand
                  alert('View all records feature - can be implemented to show full paginated table');
                }}
              >
                View All
              </Button>
            </div>
          )}
          {viewMode === 'balance' && leaveBalanceData.length > 10 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing latest 10 of {leaveBalanceData.length} employees
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  alert('View all employees feature - can be implemented to show full paginated table');
                }}
              >
                View All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Add/Edit Leave Request Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        setIsEditDialogOpen(open);
        if (!open) {
          setSelectedLeave(null);
          setFormData({
            employeeName: '',
            employeeCode: '',
            leaveType: 'Casual Leave',
            from: '',
            to: '',
            reason: '',
            contactDuringLeave: '',
          });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAddDialogOpen ? 'Add Leave Request' : 'Edit Leave Request'}</DialogTitle>
            <DialogDescription>
              {isAddDialogOpen
                ? 'Create a new leave request for an employee'
                : 'Update leave request details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee Code</Label>
                <Input
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  placeholder="EMP001"
                />
              </div>
              <div>
                <Label>Employee Name</Label>
                <Input
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <Label>Leave Type</Label>
              <Select value={formData.leaveType} onValueChange={(value) => setFormData({ ...formData, leaveType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                  <SelectItem value="Work From Home">Work From Home</SelectItem>
                  <SelectItem value="Compensatory Off">Compensatory Off</SelectItem>
                  <SelectItem value="LOP">Loss of Pay (LOP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Enter reason for leave..."
                rows={3}
              />
            </div>
            <div>
              <Label>Contact During Leave</Label>
              <Input
                value={formData.contactDuringLeave}
                onChange={(e) => setFormData({ ...formData, contactDuringLeave: e.target.value })}
                placeholder="+91 9876543210"
              />
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

      {/* Approve/Reject Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'Approved' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <>
                  Leave request for <strong>{selectedLeave.employeeName}</strong> ({selectedLeave.leaveType})
                  <br />
                  From {format(parseISO(selectedLeave.from), 'MMM dd, yyyy')} to {format(parseISO(selectedLeave.to), 'MMM dd, yyyy')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Comments (Optional)</Label>
            <Textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="Add comments for approval/rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsApproveDialogOpen(false);
              setSelectedLeave(null);
              setApprovalComment('');
              setPendingAction(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveConfirm}
              className={pendingAction === 'Approved' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'}
            >
              {pendingAction === 'Approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenure-based Leave Policy Configuration Dialog */}
      <Dialog open={isTenurePolicyDialogOpen} onOpenChange={setIsTenurePolicyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Tenure-based Leave Policy</DialogTitle>
            <DialogDescription>
              Set leave entitlements for employees based on their tenure in the organization
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 0-6 Months */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">0-6 Months Tenure</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Casual Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].casualLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        casualLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Sick Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].sickLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        sickLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Earned Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].earnedLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        earnedLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Compensatory Off (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['0-6months'].compOff}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '0-6months': {
                        ...tenurePolicy['0-6months'],
                        compOff: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
              </div>
            </div>

            {/* 6-12 Months */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">6-12 Months Tenure</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Casual Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].casualLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        casualLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Sick Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].sickLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        sickLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Earned Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].earnedLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        earnedLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Compensatory Off (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['6-12months'].compOff}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '6-12months': {
                        ...tenurePolicy['6-12months'],
                        compOff: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
              </div>
            </div>

            {/* 1 Year+ */}
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">1 Year+ Tenure</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Casual Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].casualLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        casualLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Sick Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].sickLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        sickLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Earned Leave (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].earnedLeave}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        earnedLeave: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label>Compensatory Off (days)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tenurePolicy['1year+'].compOff}
                    onChange={(e) => setTenurePolicy({
                      ...tenurePolicy,
                      '1year+': {
                        ...tenurePolicy['1year+'],
                        compOff: parseInt(e.target.value) || 0,
                      },
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTenurePolicyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('tenureLeavePolicy', JSON.stringify(tenurePolicy));
                setIsTenurePolicyDialogOpen(false);
                alert('Tenure-based leave policy updated successfully!');
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

