'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { HRMS_DEPARTMENTS } from '@/lib/utils/constants';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';

const EmployeeTable = ({
  employees = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onExport,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const pageSize = 15;

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.biometricId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Reset pagination when filters/search change
  useEffect(() => {
    setCurrentTablePage(1);
  }, [searchTerm, departmentFilter, statusFilter, employees]);

  const totalPagesCalc = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const startIdx = (currentTablePage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIdx, startIdx + pageSize);

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...HRMS_DEPARTMENTS.map(dept => ({ value: dept, label: dept }))
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' }
  ];

  const columns = [
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
      key: 'name',
      title: 'Name',
      render: (value, employee) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mr-3">
            <span className="text-xs font-medium text-white/80">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-white">{value}</div>
            <div className="text-sm text-white/60">{employee.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      title: 'Department',
      render: (value) => (
        <Badge variant="info" size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => (
        <span className="text-sm text-white/80">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          active: { variant: 'success', label: 'Active' },
          inactive: { variant: 'danger', label: 'Inactive' },
          'on-leave': { variant: 'warning', label: 'On Leave' }
        };
        const config = statusConfig[value] || { variant: 'info', label: value };
        return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
      }
    }
  ];

  const actions = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: 'View Employee',
      onClick: (employee) => onView?.(employee)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button onClick={onAdd} icon={<Plus className="w-4 h-4" />}>
            Add Employee
          </Button>
          <Button variant="ghost" onClick={onExport} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
        
        <div className="text-sm text-neutral-600">
          {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        
        <Select
          options={departmentOptions}
          value={departmentFilter}
          onChange={setDepartmentFilter}
          icon={<Filter className="w-4 h-4" />}
        />
        
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedEmployees}
        loading={loading}
        actions={actions}
        pagination={true}
        currentPage={currentTablePage}
        totalPages={totalPagesCalc}
        onPageChange={setCurrentTablePage}
        emptyMessage="No employees found. Add your first employee to get started."
      />
    </div>
  );
};

export default EmployeeTable;
