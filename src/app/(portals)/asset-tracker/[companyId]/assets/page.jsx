'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import AssetTable from '@/components/asset-tracker/AssetTable';
import AssetForm from '@/components/asset-tracker/AssetForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const AssetsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const router = useRouter();
  const toast = useToast();
  
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showEditAsset, setShowEditAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState([
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
  ]);

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
    router.push(`/asset-tracker/${companyId}/assets/${asset.id}`);
  };

  const handleDeleteAsset = (asset) => {
    if (confirm(`Are you sure you want to delete ${asset.assetTag}?`)) {
      setAssets(prev => prev.filter(ast => ast.id !== asset.id));
      toast.success(`${asset.assetTag} has been deleted successfully`);
    }
  };

  const handleAssignAsset = (assetId, employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, assignedTo: employee?.name || null, status: 'assigned' }
        : asset
    ));
    toast.success(`Asset assigned to ${employee?.name || 'unassigned'}`);
  };

  const handleSubmitAsset = (formData) => {
    if (selectedAsset) {
      // Update existing asset
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id 
          ? { ...asset, ...formData, updatedAt: new Date().toISOString() }
          : asset
      ));
      toast.success('Asset updated successfully');
    } else {
      // Add new asset
      const newAsset = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAssets(prev => [...prev, newAsset]);
      toast.success('Asset added successfully');
    }
    
    setShowAddAsset(false);
    setShowEditAsset(false);
    setSelectedAsset(null);
  };

  const handleExportAssets = () => {
    toast.success('Asset data exported successfully');
  };

  return (
    <div className="min-h-screen bg-black text-white space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Asset Management"
        description="Track and manage your company's assets and equipment"
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

      {/* Asset Table */}
      <AssetTable
        assets={assets}
        employees={employees}
        onView={handleViewAsset}
        onEdit={handleEditAsset}
        onDelete={handleDeleteAsset}
        onAdd={handleAddAsset}
        onAssign={handleAssignAsset}
        onExport={handleExportAssets}
      />

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

export default AssetsPage;
