'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckSquare, Filter, Search } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import StatisticsCards from '@/components/hrms/StatisticsCards';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const ApprovalsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Mock statistics
  const approvalStats = {
    pendingApprovals: 15,
    approvedToday: 8,
    rejectedToday: 2,
    totalThisMonth: 120
  };

  const statCards = [
    {
      key: 'pending-approvals',
      title: 'Pending Approvals',
      value: approvalStats.pendingApprovals,
      icon: <CheckSquare className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #f59e0b, #fbbf24)', // amber gradient
    },
    {
      key: 'approved-today',
      title: 'Approved Today',
      value: approvalStats.approvedToday,
      icon: <CheckSquare className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #059669, #10b981)', // green gradient
    },
    {
      key: 'rejected-today',
      title: 'Rejected Today',
      value: approvalStats.rejectedToday,
      icon: <CheckSquare className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #b91c1c, #f97316)', // deep red to amber
    },
    {
      key: 'total-this-month',
      title: 'Total This Month',
      value: approvalStats.totalThisMonth,
      icon: <CheckSquare className="w-6 h-4" />,
      color: '',
      backgroundColor: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', // professional blue
    }
  ];

  // Mock approval data
  const approvals = [
    {
      id: '1',
      employeeName: 'John Doe',
      type: 'Expense',
      amount: 5000,
      submittedDate: '2024-01-15',
      status: 'pending',
      description: 'Travel expenses for client meeting'
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      type: 'Advance',
      amount: 10000,
      submittedDate: '2024-01-16',
      status: 'pending',
      description: 'Medical emergency advance request'
    },
    {
      id: '3',
      employeeName: 'Mike Johnson',
      type: 'Expense',
      amount: 2500,
      submittedDate: '2024-01-14',
      status: 'approved',
      description: 'Team lunch reimbursement'
    }
  ];

  const handleApprove = (id) => {
    toast.success('Request approved successfully');
  };

  const handleReject = (id) => {
    toast.success('Request rejected');
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = !searchTerm || 
      approval.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || approval.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      key: 'employeeName',
      title: 'Employee',
      render: (value) => (
        <span className="font-medium text-neutral-900">{value}</span>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="font-semibold text-neutral-900">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'submittedDate',
      title: 'Submitted Date',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
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
        ) : null
      )
    }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Expense', label: 'Expense' },
    { value: 'Advance', label: 'Advance' }
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Approvals
        </h1>
        <p className="text-lg text-neutral-600">
          Review and approve expense and advance requests
        </p>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards cards={statCards} />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Search approvals..."
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
      </div>

      {/* Approvals Table */}
      <Table
        columns={columns}
        data={filteredApprovals}
        loading={false}
        pagination={true}
        emptyMessage="No approvals pending. All requests have been processed."
      />
    </div>
  );
};

export default ApprovalsPage;

