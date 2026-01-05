'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { FileCheck, Plus, Edit, Trash2 } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import ListView from '@/components/layout/ListView';

const ClaimsAndPoliciesPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Mock policy data
  const policies = [
    {
      id: '1',
      policyName: 'Travel Expense Policy',
      category: 'Travel',
      maxAmount: 10000,
      description: 'Policy for business travel expenses including flights, hotels, and meals',
      effectiveDate: '2024-01-01',
      status: 'active'
    },
    {
      id: '2',
      policyName: 'Meal Reimbursement Policy',
      category: 'Meals',
      maxAmount: 2000,
      description: 'Daily meal allowance for business travel and client meetings',
      effectiveDate: '2024-01-01',
      status: 'active'
    },
    {
      id: '3',
      policyName: 'Office Supplies Policy',
      category: 'Supplies',
      maxAmount: 5008,
      description: 'Policy for office supplies and equipment purchases',
      effectiveDate: '2024-01-01',
      status: 'active'
    }
  ];

  // Mock claim categories
  const claimCategories = [
    {
      id: '1',
      title: 'Travel Expenses',
      description: 'Flights, hotels, local transport',
      date: 'Active',
      tag: { label: 'Policy', variant: 'info' }
    },
    {
      id: '2',
      title: 'Meal Allowances',
      description: 'Business meals and client entertainment',
      date: 'Active',
      tag: { label: 'Policy', variant: 'success' }
    },
    {
      id: '3',
      title: 'Office Supplies',
      description: 'Stationery, equipment, and tools',
      date: 'Active',
      tag: { label: 'Policy', variant: 'info' }
    },
    {
      id: '4',
      title: 'Communication',
      description: 'Phone bills, internet, and communication tools',
      date: 'Active',
      tag: { label: 'Policy', variant: 'info' }
    }
  ];

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setShowAddPolicy(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setShowAddPolicy(true);
  };

  const handleDeletePolicy = (policy) => {
    if (confirm(`Are you sure you want to delete ${policy.policyName}?`)) {
      toast.success('Policy deleted successfully');
    }
  };

  const columns = [
    {
      key: 'policyName',
      title: 'Policy Name',
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
      key: 'maxAmount',
      title: 'Max Amount',
      render: (value) => (
        <span className="font-semibold text-neutral-900">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'effectiveDate',
      title: 'Effective Date',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`text-sm px-2 py-1 rounded ${
          value === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => handleEditPolicy(row)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            icon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => handleDeletePolicy(row)}
            className="bg-red-600 hover:bg-red-700 text-white"
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Claims and Policies
        </h1>
        <p className="text-lg text-neutral-600">
          Manage expense claim categories and reimbursement policies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Categories List */}
        <div className="lg:col-span-1">
          <ListView
            title="Claim Categories"
            subtitle="Available expense claim categories"
            items={claimCategories}
            scrollable={false}
          />
        </div>

        {/* Policies Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Expense Policies</h2>
            <Button onClick={handleAddPolicy} icon={<Plus className="w-4 h-4" />} className="bg-[#A28752] text-white">
              Add Policy
            </Button>
          </div>

          <Table
            columns={columns}
            data={policies}
            loading={false}
            pagination={true}
            emptyMessage="No policies found. Add your first policy to get started."
          />
        </div>
      </div>

      {/* Add/Edit Policy Modal */}
      <Modal
        isOpen={showAddPolicy}
        onClose={() => {
          setShowAddPolicy(false);
          setSelectedPolicy(null);
        }}
        title={selectedPolicy ? 'Edit Policy' : 'Add New Policy'}
        size="xl"
      >
        <div className="p-4">
          <p className="text-neutral-600">Policy form will be implemented here.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ClaimsAndPoliciesPage;

