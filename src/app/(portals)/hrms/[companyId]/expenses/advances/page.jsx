'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Wallet, Plus, RefreshCw } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';

const AdvancesPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  // Mock advance data matching the design
  const advances = [
    {
      id: '1',
      employeeName: 'Jane Smith',
      employeeId: 'EMP004',
      amount: 5008,
      purpose: 'Outstation Travel - Mumbai',
      requestedOn: '2025-01-02',
      status: 'Released',
      settlement: {
        actual: 4600,
        balance: 400,
        balanceType: 'Refund'
      }
    },
    {
      id: '2',
      employeeName: 'John Doe',
      employeeId: 'EMP003',
      amount: 3200,
      purpose: 'Conference Attendance',
      requestedOn: '2025-01-05',
      status: 'Approved',
      settlement: {
        actual: null,
        balance: null,
        balanceType: null
      }
    }
  ];

  const handleAddAdvance = () => {
    setShowAddAdvance(true);
  };

  const handleRefresh = () => {
    toast.success('Advances refreshed successfully');
  };

  const handleSettle = (advance) => {
    setSelectedAdvance(advance);
    setShowSettleModal(true);
  };

  const columns = [
    {
      key: 'employeeName',
      title: 'Employee',
      render: (value, row) => (
        <div>
          <div className="font-medium text-neutral-900">{value}</div>
          <div className="text-xs text-neutral-600 mt-0.5">{row.employeeId}</div>
        </div>
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
      key: 'purpose',
      title: 'Purpose',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
      )
    },
    {
      key: 'requestedOn',
      title: 'Requested On',
      render: (value) => (
        <span className="text-sm text-neutral-700">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          'Approved': { variant: 'info', label: 'Approved' },
          'Released': { variant: 'info', label: 'Released' },
          'Pending': { variant: 'warning', label: 'Pending' },
          'Settled': { variant: 'success', label: 'Settled' }
        };
        const config = statusConfig[value] || { variant: 'info', label: value };
        return <Badge size="sm">{config.label}</Badge>;
      }
    },
    {
      key: 'settlement',
      title: 'Settlement',
      render: (value, row) => {
        if (row.settlement.actual === null) {
          return <span className="text-sm text-neutral-600">Pending</span>;
        }
        return (
          <div className="text-sm">
            <div className="text-neutral-700">Actual: ₹{row.settlement.actual.toLocaleString()}</div>
            <div className="text-neutral-600 mt-0.5">
              Balance: ₹{row.settlement.balance.toLocaleString()} ({row.settlement.balanceType})
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        if (row.status === 'Released' && row.settlement.actual !== null) {
          return (
            <Button
              size="sm"
              onClick={() => handleSettle(row)}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Settle
            </Button>
          );
        }
        return null;
      }
    }
  ];

  return (
    <div className="min-h-screen space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Advance Requests
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleRefresh} 
            icon={<RefreshCw className="w-4 h-4" />} 
            className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Refresh
          </Button>
          <Button 
            onClick={handleAddAdvance} 
            icon={<Plus className="w-4 h-4" />} 
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            New Advance
          </Button>
        </div>
      </div>

      {/* Advances Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <Table
          columns={columns}
          data={advances}
          loading={false}
          pagination={false}
          emptyMessage="No advance requests found."
        />
      </div>

      {/* Add Advance Modal */}
      <Modal
        isOpen={showAddAdvance}
        onClose={() => setShowAddAdvance(false)}
        title="New Advance Request"
        size="xl"
      >
        <div className="p-4">
          <p className="text-neutral-600">Advance request form will be implemented here.</p>
        </div>
      </Modal>

      {/* Settle Advance Modal */}
      <Modal
        isOpen={showSettleModal}
        onClose={() => {
          setShowSettleModal(false);
          setSelectedAdvance(null);
        }}
        title="Settle Advance"
        size="xl"
      >
        <div className="p-4">
          <p className="text-neutral-600">Settlement form will be implemented here.</p>
        </div>
      </Modal>
    </div>
  );
};

export default AdvancesPage;

