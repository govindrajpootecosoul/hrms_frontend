'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Filter, Search, CheckCircle, XCircle } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import RejectionReasonDialog from '@/components/hrms/RejectionReasonDialog';

const AttendanceApprovalsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();

  const resolveCompany = () => {
    // Prefer explicit company name from context, then sessionStorage, then normalize the route param.
    const fromContext = currentCompany?.name && String(currentCompany.name).trim();
    if (fromContext) return fromContext;

    if (typeof window !== 'undefined') {
      const fromSession =
        (sessionStorage.getItem('adminSelectedCompany') || sessionStorage.getItem('selectedCompany') || '').trim();
      if (fromSession) return fromSession;
    }
    const raw = companyId != null ? String(companyId).trim() : '';
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    const lc = raw.toLowerCase();
    if (lc === '1' || lc.includes('ecosoul')) return 'Ecosoul Home';
    if (lc === '2' || lc.includes('thrive')) return 'Thrive';
    return raw;
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // Fetch attendance requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = resolveCompany();
      
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
      const company = resolveCompany();
      
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
      const company = resolveCompany();
      
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

  const openRejectDialog = (requestId) => {
    setRejectingRequestId(requestId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (rejectionReason) => {
    const requestId = rejectingRequestId;
    if (!requestId) return;

    try {
      setRejectLoading(true);
      const token = localStorage.getItem('auth_token');
      const company = resolveCompany();
      
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
        setRejectDialogOpen(false);
        setRejectingRequestId(null);
        fetchRequests();
        fetchStats();
      } else {
        toast.error(json.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject request error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setRejectLoading(false);
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
      title: 'Pending approvals',
      value: stats.pending,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-700',
    },
    {
      key: 'approved-today',
      title: 'Approved today',
      value: stats.approvedToday,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
    },
    {
      key: 'rejected-today',
      title: 'Rejected today',
      value: stats.rejectedToday,
      icon: XCircle,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-700',
    },
    {
      key: 'total-this-month',
      title: 'Total requests',
      value: stats.total,
      icon: Clock,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-700',
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
              onClick={() => openRejectDialog(row.id)}
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
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-neutral-900">
          Attendance Request Approvals
        </h1>
        <p className="text-sm text-neutral-600">
          Review and approve attendance regularization, on-duty, and time-off requests
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className="group bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_12px_rgba(0,0,0,0.03)] px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${c.iconBg} rounded-xl border border-slate-200/60 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${c.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase truncate">{c.title}</div>
                  <div className="text-xl font-semibold tracking-tight text-slate-900">{c.value}</div>
                </div>
                <div className="text-xs text-slate-500">Today</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
      </div>

      {/* Requests Table */}
      <Table
        columns={columns}
        data={filteredRequests}
        loading={loading}
        pagination={true}
        emptyMessage="No attendance requests found."
      />

      <RejectionReasonDialog
        open={rejectDialogOpen}
        title="Reject Attendance Request"
        description="Please provide a reason for rejection. This will be saved with the request."
        loading={rejectLoading}
        onCancel={() => {
          if (rejectLoading) return;
          setRejectDialogOpen(false);
          setRejectingRequestId(null);
        }}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};

export default AttendanceApprovalsPage;

