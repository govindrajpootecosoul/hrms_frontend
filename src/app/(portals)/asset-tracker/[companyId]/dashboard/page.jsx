'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Package, Users, MapPin, Settings } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import PageHeader from '@/components/layout/PageHeader';
import MetricCards from '@/components/asset-tracker/MetricCards';
import AssetTable from '@/components/asset-tracker/AssetTable';
import AssetForm from '@/components/asset-tracker/AssetForm';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const AssetTrackerDashboard = () => {
  const params = useParams();
  const companyId = params.companyId;
  
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEditAsset, setShowEditAsset] = useState(false);

  // Mock data - replace with actual API calls
  const metrics = {
    totalAssets: 245,
    assigned: 180,
    available: 45,
    underMaintenance: 15,
    broken: 5
  };

  const assets = [
    {
      id: '1',
      assetTag: 'COM123456',
      category: 'Computer',
      subcategory: 'Laptop',
      status: 'assigned',
      brand: 'Dell',
      model: 'Latitude 5520',
      serialNumber: 'DL123456789',
      location: 'Office Building 1',
      site: 'Floor 2',
      assignedTo: 'John Doe',
      ram: '16GB DDR4',
      processor: 'Intel i7-10700K',
      storage: '512GB SSD',
      warrantyStart: '2023-01-15',
      warrantyEnd: '2026-01-15',
      purchaseDate: '2023-01-15',
      purchasePrice: '1200.00',
      notes: 'High-performance laptop for development work'
    },
    {
      id: '2',
      assetTag: 'EXT789012',
      category: 'External Device',
      subcategory: 'Monitor',
      status: 'available',
      brand: 'Samsung',
      model: '27" 4K Monitor',
      serialNumber: 'SM789012345',
      location: 'Office Building 1',
      site: 'Floor 1',
      assignedTo: null,
      warrantyStart: '2023-03-01',
      warrantyEnd: '2026-03-01',
      purchaseDate: '2023-03-01',
      purchasePrice: '450.00',
      notes: '4K monitor for design work'
    },
    {
      id: '3',
      assetTag: 'FUR345678',
      category: 'Furniture',
      subcategory: 'Chair',
      status: 'maintenance',
      brand: 'Herman Miller',
      model: 'Aeron Chair',
      serialNumber: 'HM345678901',
      location: 'Office Building 2',
      site: 'Floor 3',
      assignedTo: 'Jane Smith',
      warrantyStart: '2022-06-01',
      warrantyEnd: '2025-06-01',
      purchaseDate: '2022-06-01',
      purchasePrice: '800.00',
      notes: 'Ergonomic office chair - needs maintenance'
    }
  ];

  const employees = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' }
  ];

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setShowAddAsset(true);
  };

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setShowEditAsset(true);
  };

  const handleViewAsset = (asset) => {
    console.log('View asset:', asset);
  };

  const handleDeleteAsset = (asset) => {
    if (confirm(`Are you sure you want to delete ${asset.assetTag}?`)) {
      console.log('Delete asset:', asset);
    }
  };

  const handleAssignAsset = (assetId, employeeId) => {
    console.log('Assign asset:', assetId, 'to employee:', employeeId);
  };

  const handleSubmitAsset = (formData) => {
    console.log('Submit asset:', formData);
    setShowAddAsset(false);
    setShowEditAsset(false);
    setSelectedAsset(null);
  };

  const handleExportAssets = () => {
    console.log('Export assets');
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Asset Tracker Dashboard"
        description="Manage and track your company's assets and equipment"
        actions={[
          <Button
            key="add-asset"
            onClick={handleAddAsset}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Asset
          </Button>
        ]}
      />

      {/* Metric Cards */}
      <MetricCards {...metrics} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Package className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Asset Management</h3>
              <p className="text-sm text-neutral-700 mt-1">View and manage assets</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Users className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Employee Settings</h3>
              <p className="text-sm text-neutral-700 mt-1">Manage assignable employees</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <MapPin className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Location Settings</h3>
              <p className="text-sm text-neutral-700 mt-1">Manage locations and sites</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Settings className="w-7 h-7 text-neutral-900" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">Category Settings</h3>
              <p className="text-sm text-neutral-700 mt-1">Manage asset categories</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Asset table removed as requested */}

      {/* Modals */}
      <Modal
        isOpen={showAddAsset}
        onClose={() => setShowAddAsset(false)}
        title="Add New Asset"
        size="xl"
      >
        <AssetForm
          onSubmit={handleSubmitAsset}
          onCancel={() => setShowAddAsset(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditAsset}
        onClose={() => setShowEditAsset(false)}
        title="Edit Asset"
        size="xl"
      >
        <AssetForm
          asset={selectedAsset}
          onSubmit={handleSubmitAsset}
          onCancel={() => setShowEditAsset(false)}
        />
      </Modal>
    </div>
  );
};

export default AssetTrackerDashboard;
