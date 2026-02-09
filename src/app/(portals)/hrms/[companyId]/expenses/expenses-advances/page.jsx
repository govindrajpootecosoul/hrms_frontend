'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Receipt, Plus, Download, Search, Wallet } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';

const ExpensesAdvancesPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [activeSection, setActiveSection] = useState('expenses'); // 'expenses' or 'advances'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddAdvance, setShowAddAdvance] = useState(false);

  // Mock expense data
  const expenses = [
    {
      id: '1',
      employeeName: 'John Doe',
      category: 'Travel',
      amount: 5008,
      date: '2024-01-15',
      status: 'approved',
      description: 'Client meeting travel expenses'
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      category: 'Meals',
      amount: 2500,
      date: '2024-01-16',
      status: 'pending',
      description: 'Team lunch reimbursement'
    },
    {
      id: '3',
      employeeName: 'Mike Johnson',
      category: 'Office Supplies',
      amount: 1500,
      date: '2024-01-17',
      status: 'rejected',
      description: 'Office stationery purchase'
    },
  ];

  // Mock advance data
  const advances = [
    {
      id: '1',
      employeeName: 'Sarah Wilson',
      amount: 10000,
      requestedDate: '2024-01-10',
      status: 'approved',
      purpose: 'Business trip advance',
      settled: false
    },
    {
      id: '2',
      employeeName: 'David Brown',
      amount: 5000,
      requestedDate: '2024-01-12',
      status: 'pending',
      purpose: 'Training advance',
      settled: false
    },
    {
      id: '3',
      employeeName: 'Lisa Anderson',
      amount: 8000,
      requestedDate: '2024-01-08',
      status: 'approved',
      purpose: 'Project advance',
      settled: true
    },
  ];

  const expenseColumns = [
    {
      key: 'employeeName',
      title: 'Employee',
      render: (value) => <span className="font-medium text-slate-900">{value}</span>
    },
    {
      key: 'category',
      title: 'Category',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => <span className="font-semibold text-slate-900">₹{value.toLocaleString()}</span>
    },
    {
      key: 'date',
      title: 'Date',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>
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
        return <Badge size="sm" variant={config.variant}>{config.label}</Badge>;
      }
    },
    {
      key: 'action',
      title: 'Action',
      render: (value, row) => (
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          View
        </button>
      )
    }
  ];

  const advanceColumns = [
    {
      key: 'employeeName',
      title: 'Employee',
      render: (value) => <span className="font-medium text-slate-900">{value}</span>
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => <span className="font-semibold text-slate-900">₹{value.toLocaleString()}</span>
    },
    {
      key: 'purpose',
      title: 'Purpose',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>
    },
    {
      key: 'requestedDate',
      title: 'Requested Date',
      render: (value) => <span className="text-sm text-slate-700">{value}</span>
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
        return <Badge size="sm" variant={config.variant}>{config.label}</Badge>;
      }
    },
    {
      key: 'settled',
      title: 'Settled',
      render: (value) => (
        <Badge size="sm" variant={value ? 'success' : 'warning'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      key: 'action',
      title: 'Action',
      render: (value, row) => (
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">
            Expenses & Advances
          </h1>
          <p className="text-sm text-slate-600">
            Manage employee expenses and advance requests
          </p>
        </div>
        <div className="flex gap-2">
          {activeSection === 'expenses' ? (
            <Button
              onClick={() => setShowAddExpense(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              Add Expense
            </Button>
          ) : (
            <Button
              onClick={() => setShowAddAdvance(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              Request Advance
            </Button>
          )}
        </div>
      </div>

      {/* Section Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveSection('expenses')}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
              ${activeSection === 'expenses'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
            `}
          >
            <Receipt className="w-4 h-4" />
            <span>Expenses</span>
          </button>
          <button
            onClick={() => setActiveSection('advances')}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
              ${activeSection === 'advances'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
            `}
          >
            <Wallet className="w-4 h-4" />
            <span>Advances</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder={`Search ${activeSection === 'expenses' ? 'expenses' : 'advances'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
              { value: 'rejected', label: 'Rejected' }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
          <Button
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            icon={<Download className="w-4 h-4" />}
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Expenses Section */}
      {activeSection === 'expenses' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Expenses</h2>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={expenseColumns}
              data={expenses}
              loading={false}
              pagination={true}
              itemsPerPage={10}
            />
          </div>
        </div>
      )}

      {/* Advances Section */}
      {activeSection === 'advances' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Advances</h2>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={advanceColumns}
              data={advances}
              loading={false}
              pagination={true}
              itemsPerPage={10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesAdvancesPage;
