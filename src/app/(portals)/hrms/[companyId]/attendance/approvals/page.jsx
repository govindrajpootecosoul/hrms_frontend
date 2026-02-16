'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Filter, Search, CheckCircle, XCircle } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const AttendanceApprovalsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    approvedToday: 0,
    rejectedToday: 0,
    total: 0
  });

  // Fetch attendance requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = currentCompany?.name || companyId;
      
      const params = new URLSearchParams();
      params.append('status', statusFilter);
      params.append('type', typeFilter);
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
          setRequests(json.data.requests || []);
        }
      }
    } catch (err) {
      console.error('Fetch attendance requests error:', err);
      toast.error('Failed to load attendance requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const company = currentCompany?.name || companyId;
      
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/attendance-requests/stats?${company ? `company=${company}` : ''}`, {
        headers
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [statusFilter, typeFilter, companyId, currentCompany]);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const company = currentCompany?.name || companyId;
      
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
        toast.success('Request approved successfully');
        fetchRequests();
        fetchStats();
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
      const company = currentCompany?.name || companyId;
      
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
        toast.success('Request rejected');
        fetchRequests();
        fetchStats();
      } else {
        toast.error(json.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject request error:', err);
      toast.error('An error occurred. Please try again.');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatRequestType = (type) => {
    const types = {
      'regularization': 'Attendance Regularization',
      'on-duty': 'On Duty Request',
      'time-off': 'Time Off Request'
    };
    return types[type] || type;
  };

  const statCards = [
    {
      key: 'pending-approvals',
      title: 'Pending Approvals',
      value: stats.pending,
      icon: <Clock className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // amber gradient
    },
    {
      key: 'approved-today',
      title: 'Approved Today',
      value: stats.approvedToday,
      icon: <CheckCircle className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
    },
    {
      key: 'rejected-today',
      title: 'Rejected Today',
      value: stats.rejectedToday,
      icon: <XCircle className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #b91c1c, #f97316)', // deep red to amber
    },
    {
      key: 'total-this-month',
      title: 'Total Requests',
      value: stats.total,
      icon: <Clock className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
    }
  ];

  const columns = [
    {
      key: 'employeeId',
      title: 'Employee ID',
      render: (value) => (
        <span className="font-medium text-neutral-900">{value || '-'}</span>
      )
    },
    {
      key: 'type',
      title: 'Request Type',
      render: (value) => (
        <span className="text-sm text-neutral-700">{formatRequestType(value)}</span>
      )
    },
    {
      key: 'details',
      title: 'Details',
      render: (value, row) => {
        if (row.type === 'regularization') {
          return (
            <div className="text-sm">
              <div><strong>Date:</strong> {row.date ? formatDate(row.date) : '-'}</div>
              <div><strong>Time:</strong> {row.timeWindow || '-'}</div>
              {row.notes && <div className="text-xs text-neutral-500 mt-1">{row.notes}</div>}
            </div>
          );
        } else if (row.type === 'on-duty') {
          return (
            <div className="text-sm">
              <div><strong>Date:</strong> {row.date ? formatDate(row.date) : '-'}</div>
              <div><strong>Location:</strong> {row.location || '-'}</div>
              {row.details && <div className="text-xs text-neutral-500 mt-1">{row.details}</div>}
            </div>
          );
        } else if (row.type === 'time-off') {
          return (
            <div className="text-sm">
              <div><strong>Date Range:</strong> {row.dateRange || '-'}</div>
              {row.reason && <div className="text-xs text-neutral-500 mt-1">{row.reason}</div>}
            </div>
          );
        }
        return '-';
      }
    },
    {
      key: 'submittedAt',
      title: 'Submitted Date',
      render: (value) => (
        <span className="text-sm text-neutral-700">{formatDate(value)}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          approved: { variant: 'success', label: 'Approved' },
          pending: { variant: 'warning', label: 'Pending' },
          rejected: { variant: 'danger', label: 'Rejected' }
        };
        const config = statusConfig[value] || { variant: 'info', label: value };
        return <Badge size="sm">{config.label}</Badge>;
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => (
        row.status === 'pending' ? (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => handleApprove(row.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
            <Button
              size="sm"
              onClick={() => handleReject(row.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">
            {row.status === 'approved' && row.approvedAt && `Approved on ${formatDate(row.approvedAt)}`}
            {row.status === 'rejected' && row.rejectedAt && `Rejected on ${formatDate(row.rejectedAt)}`}
          </span>
        )
      )
    }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'regularization', label: 'Attendance Regularization' },
    { value: 'on-duty', label: 'On Duty Request' },
    { value: 'time-off', label: 'Time Off Request' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Attendance Request Approvals
        </h1>
        <p className="text-lg text-neutral-600">
          Review and approve attendance regularization, on-duty, and time-off requests
        </p>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards cards={statCards} />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search by Employee ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          icon={<Filter className="w-4 h-4" />}
        />

        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          icon={<Filter className="w-4 h-4" />}
        />
      </div>

      {/* Requests Table */}
      <Table
        columns={columns}
        data={filteredRequests}
        loading={loading}
        pagination={true}
        emptyMessage="No attendance requests found."
      />
    </div>
  );
};

export default AttendanceApprovalsPage;

