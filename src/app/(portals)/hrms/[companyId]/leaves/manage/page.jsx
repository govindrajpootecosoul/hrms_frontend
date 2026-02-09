'use client';

import { useState } from 'react';
import { Users, AlertCircle, CheckCircle2, XCircle, Calendar, Settings, Users as UsersIcon, FileText, Plus, Search, Check, X, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';

const LeavesManagePage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const leaveStats = {
    totalOnLeave: 0,
    leaveForApproval: 18,
    approvedThisMonth: 4,
    rejectedThisMonth: 3
  };

  // Mock leave requests data
  const leaveRequests = [
    {
      id: 1,
      employeeName: 'John Doe',
      leaveType: 'Sick Leave',
      from: '2026-04-04',
      to: '2026-04-08',
      duration: 5,
      reason: 'Recovery from surgery',
      status: 'Pending'
    },
    {
      id: 2,
      employeeName: 'Kavita Nair',
      leaveType: 'LOP',
      from: '2026-04-03',
      to: '2026-04-07',
      duration: 5,
      reason: 'Family emergency',
      status: 'Approved'
    },
    {
      id: 3,
      employeeName: 'Priya Sharma',
      leaveType: 'Earned Leave',
      from: '2026-04-02',
      to: '2026-04-02',
      duration: 1,
      reason: 'Wedding',
      status: 'Rejected'
    },
    {
      id: 4,
      employeeName: 'Nikhil Agarwal',
      leaveType: 'Sick Leave',
      from: '2026-04-01',
      to: '2026-04-04',
      duration: 4,
      reason: 'Mental health day',
      status: 'Pending'
    },
    {
      id: 5,
      employeeName: 'Rajesh Patel',
      leaveType: 'Casual Leave',
      from: '2026-04-01',
      to: '2026-04-04',
      duration: 4,
      reason: 'Moving to new house',
      status: 'Approved'
    },
    {
      id: 6,
      employeeName: 'Sneha Reddy',
      leaveType: 'Earned Leave',
      from: '2026-03-31',
      to: '2026-04-04',
      duration: 5,
      reason: 'Dental appointment',
      status: 'Rejected'
    },
    {
      id: 7,
      employeeName: 'Robert Wilson',
      leaveType: 'Earned Leave',
      from: '2026-03-31',
      to: '2026-04-04',
      duration: 5,
      reason: 'Home renovation',
      status: 'Pending'
    },
    {
      id: 8,
      employeeName: 'Arjun Menon',
      leaveType: 'Compensatory Off',
      from: '2026-03-31',
      to: '2026-04-04',
      duration: 5,
      reason: 'Recovery from surgery',
      status: 'Rejected'
    },
    {
      id: 9,
      employeeName: 'Arjun Menon',
      leaveType: 'Sick Leave',
      from: '2026-03-29',
      to: '2026-03-30',
      duration: 2,
      reason: 'Home renovation',
      status: 'Approved'
    },
    {
      id: 10,
      employeeName: 'Jane Smith',
      leaveType: 'Earned Leave',
      from: '2026-03-28',
      to: '2026-04-01',
      duration: 5,
      reason: 'Home renovation',
      status: 'Approved'
    }
  ];

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || request.leaveType.toLowerCase() === typeFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const tableColumns = [
    {
      key: 'employeeName',
      title: 'Employee Name',
      render: (value) => <div className="font-medium text-slate-900">{value}</div>
    },
    {
      key: 'leaveType',
      title: 'Leave Type',
      render: (value) => <div className="text-slate-700">{value}</div>
    },
    {
      key: 'from',
      title: 'From',
      render: (value) => <div className="text-slate-700">{formatDate(value)}</div>
    },
    {
      key: 'to',
      title: 'To',
      render: (value) => <div className="text-slate-700">{formatDate(value)}</div>
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (value) => <div className="text-slate-700">{value} {value === 1 ? 'day' : 'days'}</div>
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (value) => <div className="text-slate-700">{value}</div>
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        const actions = getRowActions(row);
        return (
          <div className="flex items-center justify-end space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                }}
                className={`text-slate-600 hover:text-slate-900 transition-colors ${
                  action.variant === 'danger' ? 'hover:text-red-600' : ''
                }`}
                title={action.title}
              >
                {action.icon}
              </button>
            ))}
          </div>
        );
      }
    }
  ];

  // Generate actions for each row
  const getRowActions = (row) => {
    const actions = [];
    if (row.status === 'Pending') {
      actions.push(
        {
          icon: <Check className="w-4 h-4" />,
          onClick: () => alert(`Approve leave for ${row.employeeName}`),
          title: 'Approve'
        },
        {
          icon: <X className="w-4 h-4" />,
          onClick: () => alert(`Reject leave for ${row.employeeName}`),
          title: 'Reject',
          variant: 'danger'
        }
      );
    }
    actions.push(
      {
        icon: <Edit className="w-4 h-4" />,
        onClick: () => alert(`Edit leave for ${row.employeeName}`),
        title: 'Edit'
      },
      {
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => alert(`Delete leave for ${row.employeeName}`),
        title: 'Delete',
        variant: 'danger'
      }
    );
    return actions;
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total On Leave',
            value: leaveStats.totalOnLeave,
            icon: Users,
            gradient: 'from-blue-600 via-indigo-600 to-blue-700',
          },
          {
            title: 'Leave For Approval',
            value: leaveStats.leaveForApproval,
            icon: AlertCircle,
            gradient: 'from-orange-600 via-amber-600 to-orange-700',
          },
          {
            title: 'Approved This Month',
            value: leaveStats.approvedThisMonth,
            icon: CheckCircle2,
            gradient: 'from-green-600 via-emerald-600 to-green-700',
          },
          {
            title: 'Rejected This Month',
            value: leaveStats.rejectedThisMonth,
            icon: XCircle,
            gradient: 'from-red-600 via-rose-600 to-red-700',
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${kpi.gradient} shadow-lg`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 text-white">{kpi.value}</div>
                <div className="text-xs text-white/90 uppercase tracking-wide">{kpi.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenure-based Leave Policy Section */}
      <Card className="border-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tenure-based Leave Policy</h2>
            <p className="text-sm text-slate-600 mt-1">Configure leave entitlements based on employee tenure</p>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            icon={<Settings className="w-4 h-4" />}
          >
            Configure Leave Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              tenure: '0-6 Months',
              borderColor: 'border-blue-200',
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600',
              policies: [
                { type: 'Casual Leave', days: 0 },
                { type: 'Sick Leave', days: 3 },
                { type: 'Earned Leave', days: 0 },
                { type: 'Compensatory Off', days: 0 }
              ]
            },
            {
              tenure: '6-12 Months',
              borderColor: 'border-green-200',
              bgColor: 'bg-green-50',
              iconColor: 'text-green-600',
              policies: [
                { type: 'Casual Leave', days: 6 },
                { type: 'Sick Leave', days: 6 },
                { type: 'Earned Leave', days: 0 },
                { type: 'Compensatory Off', days: 0 }
              ]
            },
            {
              tenure: '1 Year+',
              borderColor: 'border-purple-200',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600',
              policies: [
                { type: 'Casual Leave', days: 12 },
                { type: 'Sick Leave', days: 6 },
                { type: 'Earned Leave', days: 10 },
                { type: 'Compensatory Off', days: 0 }
              ]
            }
          ].map((tenure, index) => (
            <div
              key={index}
              className={`rounded-xl border-2 ${tenure.borderColor} ${tenure.bgColor} p-5`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-white ${tenure.iconColor}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{tenure.tenure}</h3>
              </div>
              <div className="space-y-2">
                {tenure.policies.map((policy, pIndex) => (
                  <div key={pIndex} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{policy.type}:</span>
                    <span className="font-semibold text-slate-900">{policy.days} days</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Employee Leave Requests Section */}
      <Card className="border-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Employee Leave Requests</h2>
            <p className="text-sm text-slate-600 mt-1">Manage and approve leave requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              icon={<UsersIcon className="w-4 h-4" />}
            >
              Balance
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<FileText className="w-4 h-4" />}
            >
              Requests
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Leave Request
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="all">All Types</option>
            <option value="casual leave">Casual Leave</option>
            <option value="sick leave">Sick Leave</option>
            <option value="earned leave">Earned Leave</option>
            <option value="lop">LOP</option>
            <option value="compensatory off">Compensatory Off</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Table */}
        <Table
          columns={tableColumns}
          data={filteredRequests}
          pagination={true}
          currentPage={1}
          totalPages={Math.ceil(filteredRequests.length / 10)}
          emptyMessage="No leave requests found"
        />

        {/* Pagination Info */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <span>Showing latest {Math.min(10, filteredRequests.length)} of {filteredRequests.length} records</span>
          <Button
            size="sm"
            className="bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            View All
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LeavesManagePage;
