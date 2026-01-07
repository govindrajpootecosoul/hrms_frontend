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
      assetTag: 'CA-LAP-001',
      category: 'Computer Assets',
      subcategory: 'Laptop',
      status: 'assigned',
      brand: 'Dell',
      model: 'Dell Latitude 5520',
      serialNumber: 'DL123456789',
      location: 'Floor 2',
      site: 'Head Office',
      assignedTo: 'John Smith',
      department: 'IT Department',
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
      assetTag: 'CA-DESK-045',
      category: 'Computer Assets',
      subcategory: 'Desktop',
      status: 'available',
      brand: 'HP',
      model: 'HP EliteDesk 800',
      serialNumber: 'HP789012345',
      location: 'Floor 1',
      site: 'Head Office',
      assignedTo: null,
      department: null,
      warrantyStart: '2023-03-01',
      warrantyEnd: '2026-03-01',
      purchaseDate: '2023-03-01',
      purchasePrice: '850.00',
      notes: 'Desktop computer'
    },
    {
      id: '3',
      assetTag: 'EE-KBD-023',
      category: 'External Equipment',
      subcategory: 'Keyboard',
      status: 'assigned',
      brand: 'Logitech',
      model: 'Logitech MX Keys',
      serialNumber: 'LG345678901',
      location: 'Floor 3',
      site: 'Head Office',
      assignedTo: 'Sarah Johnson',
      department: 'HR',
      warrantyStart: '2023-05-01',
      warrantyEnd: '2026-05-01',
      purchaseDate: '2023-05-01',
      purchasePrice: '120.00',
      notes: 'Wireless keyboard'
    },
    {
      id: '4',
      assetTag: 'EE-LCD-078',
      category: 'External Equipment',
      subcategory: 'LCD Monitor',
      status: 'maintenance',
      brand: 'Dell',
      model: 'Dell UltraSharp U2720Q',
      serialNumber: 'DL987654321',
      location: 'Floor 4',
      site: 'Branch Office',
      assignedTo: null,
      department: null,
      warrantyStart: '2023-02-01',
      warrantyEnd: '2026-02-01',
      purchaseDate: '2023-02-01',
      purchasePrice: '550.00',
      notes: '4K monitor - under maintenance'
    },
    {
      id: '5',
      assetTag: 'CA-LAP-089',
      category: 'Computer Assets',
      subcategory: 'Laptop',
      status: 'assigned',
      brand: 'Apple',
      model: 'MacBook Pro 16"',
      serialNumber: 'AP123456789',
      location: 'Floor 2',
      site: 'Head Office',
      assignedTo: 'Mike Wilson',
      department: 'Marketing',
      warrantyStart: '2023-06-01',
      warrantyEnd: '2026-06-01',
      purchaseDate: '2023-06-01',
      purchasePrice: '2500.00',
      notes: 'MacBook Pro for design team'
    }
  ]);

  const employees = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Wilson' },
    { id: '4', name: 'Emma Davis' },
    { id: '5', name: 'David Brown' }
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
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Asset Management</h1>
          <p className="text-lg text-neutral-600">Track and manage all your company assets</p>
        </div>
        <Button
          onClick={handleAddAsset}
          icon={<Plus className="w-4 h-4" />}
        >
          + Add New Asset
        </Button>
      </div>

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
