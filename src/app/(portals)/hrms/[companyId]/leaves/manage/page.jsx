'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import { Users, AlertCircle, CheckCircle2, XCircle, Calendar, Settings, Users as UsersIcon, FileText, Plus, Search, Check, X, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';

const LeavesManagePage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leavePolicy, setLeavePolicy] = useState({
    '0-6months': { casualLeave: 0, sickLeave: 3, earnedLeave: 0, compOff: 0 },
    '6-12months': { casualLeave: 6, sickLeave: 6, earnedLeave: 0, compOff: 0 },
    '1year+': { casualLeave: 12, sickLeave: 6, earnedLeave: 10, compOff: 0 }
  });
  const [leaveStats, setLeaveStats] = useState({
    totalOnLeave: 0,
    leaveForApproval: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(true);

  // Function to get company name
  const getCompanyName = () => {
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
    return company;
  };

  // Fetch employees list for employee names
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const company = getCompanyName();
        
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

  // Fetch leave policy
  useEffect(() => {
    const fetchLeavePolicy = async () => {
      try {
        setPolicyLoading(true);
        const token = localStorage.getItem('auth_token');
        const company = getCompanyName();
        
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

        const res = await fetch(`/api/hrms-portal/leave-policy?${params.toString()}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setLeavePolicy(json.data);
          }
        }
      } catch (err) {
        console.error('Fetch leave policy error:', err);
      } finally {
        setPolicyLoading(false);
      }
    };

    fetchLeavePolicy();
  }, [companyId, currentCompany]);

  // Function to fetch and process leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();
      
      const params = new URLSearchParams();
      params.append('type', 'time-off');
      params.append('status', statusFilter === 'all' ? 'all' : statusFilter);
      if (company) {
        params.append('company', company);
      }

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/attendance-requests?${params.toString()}`, {
        headers
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Transform attendance requests to leave requests format
          const originalRequests = json.data.requests || [];
          
          // Create employee map for name lookup
          const employeeMap = new Map();
          employees.forEach(emp => {
            const empId = emp.employeeId || emp.email?.split('@')[0] || '';
            if (empId) {
              employeeMap.set(empId, emp.name || 'Unknown');
            }
          });
          
          const requests = originalRequests.map(req => {
            // Parse date range (e.g., "22 Jan - 24 Jan" or "2026-01-22 - 2026-01-24")
            let from = '';
            let to = '';
            let duration = 0;
            
            if (req.dateRange) {
              const parts = req.dateRange.split(' - ');
              if (parts.length === 2) {
                from = parts[0].trim();
                to = parts[1].trim();
                // Try to parse dates and calculate duration
                try {
                  const fromDate = new Date(from);
                  const toDate = new Date(to);
                  if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
                    const diffTime = Math.abs(toDate - fromDate);
                    duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  }
                } catch (e) {
                  // If parsing fails, try to extract from string
                  duration = 1; // Default to 1 day
                }
              }
            }

            // Get employee name from map
            const employeeName = employeeMap.get(req.employeeId) || req.employeeId || 'Unknown';

            return {
              id: req.id,
              employeeName: employeeName,
              employeeId: req.employeeId,
              leaveType: 'Time Off', // All time-off requests
              from: from,
              to: to,
              duration: duration || 1,
              reason: req.reason || '',
              status: req.status === 'pending' ? 'Pending' : 
                      req.status === 'approved' ? 'Approved' : 
                      req.status === 'rejected' ? 'Rejected' : 'Pending',
              dateRange: req.dateRange,
              approvedAt: req.approvedAt,
              rejectedAt: req.rejectedAt
            };
          });
          
          setLeaveRequests(requests);

          // Calculate stats
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const totalOnLeave = requests.filter(r => 
            r.status === 'Approved' && 
            r.from && r.to &&
            new Date(r.from) <= now && new Date(r.to) >= now
          ).length;

          const leaveForApproval = requests.filter(r => r.status === 'Pending').length;
          
          const approvedThisMonth = requests.filter(r => {
            if (r.status !== 'Approved' || !r.approvedAt) return false;
            const approvedDate = new Date(r.approvedAt);
            return approvedDate.getMonth() === currentMonth && 
                   approvedDate.getFullYear() === currentYear;
          }).length;

          const rejectedThisMonth = requests.filter(r => {
            if (r.status !== 'Rejected' || !r.rejectedAt) return false;
            const rejectedDate = new Date(r.rejectedAt);
            return rejectedDate.getMonth() === currentMonth && 
                   rejectedDate.getFullYear() === currentYear;
          }).length;

          setLeaveStats({
            totalOnLeave,
            leaveForApproval,
            approvedThisMonth,
            rejectedThisMonth
          });
        }
      }
    } catch (err) {
      console.error('Fetch leave requests error:', err);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave requests (time-off requests from attendance requests)
  useEffect(() => {
    fetchLeaveRequests();
  }, [statusFilter, companyId, currentCompany, employees, toast]);

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || request.leaveType.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      request.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.leaveType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, try to parse as string format
        return dateStr;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
    } catch (e) {
      return dateStr; // Return as-is if parsing fails
    }
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

  // Handle approve/reject actions
  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/attendance-requests/${requestId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ approvedBy: 'Admin' })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Leave request approved successfully');
        // Refresh data by refetching
        await fetchLeaveRequests();
      } else {
        toast.error(json.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Approve request error:', err);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleReject = async (requestId) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    try {
      const token = localStorage.getItem('auth_token');
      const company = getCompanyName();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/attendance-requests/${requestId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          rejectedBy: 'Admin',
          rejectionReason 
        })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Leave request rejected');
        // Refresh data by refetching
        await fetchLeaveRequests();
      } else {
        toast.error(json.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject request error:', err);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Generate actions for each row
  const getRowActions = (row) => {
    const actions = [];
    if (row.status === 'Pending') {
      actions.push(
        {
          icon: <Check className="w-4 h-4" />,
          onClick: () => handleApprove(row.id),
          title: 'Approve'
        },
        {
          icon: <X className="w-4 h-4" />,
          onClick: () => handleReject(row.id),
          title: 'Reject',
          variant: 'danger'
        }
      );
    }
    actions.push(
      {
        icon: <Edit className="w-4 h-4" />,
        onClick: () => toast.info('Edit functionality coming soon'),
        title: 'Edit'
      },
      {
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => toast.info('Delete functionality coming soon'),
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
          {policyLoading ? (
            <div className="col-span-3 text-center py-8 text-slate-600">Loading leave policy...</div>
          ) : [
            {
              tenure: '0-6 Months',
              key: '0-6months',
              borderColor: 'border-blue-200',
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600',
              policies: [
                { type: 'Casual Leave', days: leavePolicy['0-6months']?.casualLeave || 0 },
                { type: 'Sick Leave', days: leavePolicy['0-6months']?.sickLeave || 3 },
                { type: 'Earned Leave', days: leavePolicy['0-6months']?.earnedLeave || 0 },
                { type: 'Compensatory Off', days: leavePolicy['0-6months']?.compOff || 0 }
              ]
            },
            {
              tenure: '6-12 Months',
              key: '6-12months',
              borderColor: 'border-green-200',
              bgColor: 'bg-green-50',
              iconColor: 'text-green-600',
              policies: [
                { type: 'Casual Leave', days: leavePolicy['6-12months']?.casualLeave || 6 },
                { type: 'Sick Leave', days: leavePolicy['6-12months']?.sickLeave || 6 },
                { type: 'Earned Leave', days: leavePolicy['6-12months']?.earnedLeave || 0 },
                { type: 'Compensatory Off', days: leavePolicy['6-12months']?.compOff || 0 }
              ]
            },
            {
              tenure: '1 Year+',
              key: '1year+',
              borderColor: 'border-purple-200',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600',
              policies: [
                { type: 'Casual Leave', days: leavePolicy['1year+']?.casualLeave || 12 },
                { type: 'Sick Leave', days: leavePolicy['1year+']?.sickLeave || 6 },
                { type: 'Earned Leave', days: leavePolicy['1year+']?.earnedLeave || 10 },
                { type: 'Compensatory Off', days: leavePolicy['1year+']?.compOff || 0 }
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
        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading leave requests...</div>
        ) : (
          <Table
            columns={tableColumns}
            data={filteredRequests}
            pagination={true}
            currentPage={1}
            totalPages={Math.ceil(filteredRequests.length / 10)}
            emptyMessage="No leave requests found"
          />
        )}

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
