'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Receipt, Plus, Download, Filter, Search } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import Table from '@/components/common/Table';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';

const ExpensesListPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);

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
      description: 'Stationery purchase'
    }
  ];

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleExportExpenses = () => {
    toast.success('Expenses data exported successfully');
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || expense.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
      key: 'category',
      title: 'Category',
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
      key: 'date',
      title: 'Date',
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
    }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Expenses
        </h1>
        <p className="text-lg text-neutral-600">
          Manage and track employee expense submissions
        </p>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button onClick={handleAddExpense} icon={<Plus className="w-4 h-4" />} className="bg-[#A28752] text-white">
            Add Expense
          </Button>
          <Button onClick={handleExportExpenses} icon={<Download className="w-4 h-4" />} className="bg-[#A28752] text-white">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          icon={<Filter className="w-4 h-4" />}
        />
      </div>

      {/* Expenses Table */}
      <Table
        columns={columns}
        data={filteredExpenses}
        loading={false}
        pagination={true}
        emptyMessage="No expenses found. Add your first expense to get started."
      />

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="Add New Expense"
        size="xl"
      >
        <div className="p-4">
          <p className="text-neutral-600">Expense form will be implemented here.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesListPage;

