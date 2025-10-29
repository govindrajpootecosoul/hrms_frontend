'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Download, Calendar, Clock } from 'lucide-react';
import { ATTENDANCE_STATUS } from '@/lib/utils/constants';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';
import Silk from '@/components/common/SilkBackground';

const AttendanceTable = ({
  attendance = [],
  loading = false,
  onExport,
  onStatusUpdate,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const pageSize = 15;

  // Filter attendance based on search and filters
  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = !searchTerm || 
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.biometricId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || record.status === statusFilter;
    
    const matchesDateRange = (!dateRange.start || record.date >= dateRange.start) &&
                           (!dateRange.end || record.date <= dateRange.end);
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  useEffect(() => {
    setCurrentTablePage(1);
  }, [searchTerm, statusFilter, dateRange.start, dateRange.end, attendance]);

  const totalPagesCalc = Math.max(1, Math.ceil(filteredAttendance.length / pageSize));
  const startIdx = (currentTablePage - 1) * pageSize;
  const paginatedAttendance = filteredAttendance.slice(startIdx, startIdx + pageSize);

  const statusOptions = [
    { value: '', label: 'All Status' },
    ...ATTENDANCE_STATUS.map(status => ({ value: status.value, label: status.label }))
  ];

  const handleStatusChange = (record, newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(record.id, newStatus);
    }
  };

  const columns = [
    {
      key: 'date',
      title: 'Date',
      render: (value) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-white/60 mr-2" />
          <span className="text-sm font-medium text-white">
            {new Date(value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      )
    },
    {
      key: 'biometricId',
      title: 'Biometric ID',
      render: (value) => (
        <span className="font-mono text-sm font-medium text-primary-600">
          {value}
        </span>
      )
    },
    {
      key: 'employeeName',
      title: 'Employee Name',
      render: (value) => (
        <div className="font-medium text-white">{value}</div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, record) => (
        <Select
          options={ATTENDANCE_STATUS.map(status => ({ 
            value: status.value, 
            label: status.label 
          }))}
          value={value}
          onChange={(newStatus) => handleStatusChange(record, newStatus)}
          className="min-w-[120px]"
        />
      )
    },
    {
      key: 'timeIn',
      title: 'Time In',
      render: (value) => (
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-white/60 mr-2" />
          <span className="text-sm text-white/80">
            {value || '--:--'}
          </span>
        </div>
      )
    },
    {
      key: 'timeOut',
      title: 'Time Out',
      render: (value) => (
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-white/60 mr-2" />
          <span className="text-sm text-white/80">
            {value || '--:--'}
          </span>
        </div>
      )
    },
    {
      key: 'totalHours',
      title: 'Total Hours',
      render: (value, record) => {
        if (!record.timeIn || !record.timeOut) return '--';
        
        const timeIn = new Date(`2000-01-01 ${record.timeIn}`);
        const timeOut = new Date(`2000-01-01 ${record.timeOut}`);
        const diffMs = timeOut - timeIn;
        const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
        
        return (
          <span className="text-sm font-medium text-white">
            {diffHours}h
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onExport} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
        
        <div className="text-sm text-white/80">
          {filteredAttendance.length} of {attendance.length} records
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Search"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        
        <Input
          label="Start Date"
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
        />
        
        <Input
          label="End Date"
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
        />
        
        <Select
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          icon={<Filter className="w-4 h-4" />}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ATTENDANCE_STATUS.map(status => {
          const count = filteredAttendance.filter(record => record.status === status.value).length;
          return (
            <div key={status.value} className="relative overflow-hidden bg-white/5 p-4 rounded-lg border border-white/20 text-white">
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <Silk speed={3} scale={1} color="#7B7481" noiseIntensity={1.2} rotation={0.2} />
              </div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">{status.label}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
                <Badge variant={status.color === 'green' ? 'success' : status.color === 'red' ? 'danger' : status.color === 'orange' ? 'warning' : 'info'}>
                  {status.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedAttendance}
        loading={loading}
        pagination={true}
        currentPage={currentTablePage}
        totalPages={totalPagesCalc}
        onPageChange={setCurrentTablePage}
        emptyMessage="No attendance records found. Upload attendance data to get started."
      />
    </div>
  );
};

export default AttendanceTable;
