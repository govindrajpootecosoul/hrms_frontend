'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Settings as SettingsIcon, LayoutDashboard, List, FileText, CheckCircle, FileText as FileTextIcon, Wrench, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import MetricCards from '@/components/asset-tracker/MetricCards';
import AssetForm from '@/components/asset-tracker/AssetForm';
import AssetTable from '@/components/asset-tracker/AssetTable';
import StatusOverviewCard from '@/components/asset-tracker/StatusOverviewCard';
import RecentActivity from '@/components/asset-tracker/RecentActivity';
import QuickActions from '@/components/asset-tracker/QuickActions';
import AssetCategoryCountTable from '@/components/asset-tracker/AssetCategoryCountTable';
import Settings from '@/components/asset-tracker/Settings';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const AssetTrackerDashboard = () => {
  const params = useParams();
  const companyId = params.companyId;
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEditAsset, setShowEditAsset] = useState(false);

  // Static data matching the image description
  const staticData = {
    totalAssets: 552,
    assigned: 423,
    available: 129,
    underMaintenance: 18,
    broken: 7,
    categories: {
      'Computer Assets': 245,
      'External Equipment': 189,
      'Office Supplies': 76,
      'Furniture': 42,
    },
    recentActivities: [
      {
        assetId: 'CA-LAP-045',
        action: 'Checkout',
        user: 'John Smith',
        time: '2 hours ago',
        type: 'checkout',
      },
      {
        assetId: 'EE-KBD-023',
        action: 'Checkin',
        user: 'Sarah Johnson',
        time: '4 hours ago',
        type: 'checkin',
      },
      {
        assetId: 'CA-DESK-112',
        action: 'Maintenance',
        user: 'Mike Wilson',
        time: '1 day ago',
        type: 'maintenance',
      },
      {
        assetId: 'EE-LCD-078',
        action: 'Audit',
        user: 'Emma Davis',
        time: '2 days ago',
        type: 'audit',
      },
      {
        assetId: 'EE-MSE-156',
        action: 'Checkout',
        user: 'David Brown',
        time: '3 days ago',
        type: 'checkout',
      },
    ],
  };

  // Mock data - replace with actual API calls
  const metrics = {
    totalAssets: staticData.totalAssets,
    assigned: staticData.assigned,
    available: staticData.available,
    underMaintenance: staticData.underMaintenance,
    broken: staticData.broken
  };

  const assets = [
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
      subcategory: 'LCD-Monitors',
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
  ];

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

  const handleAudit = () => {
    console.log('Audit clicked');
  };

  const handleSettings = () => {
    // Navigate to settings or open settings modal
    console.log('Settings clicked');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'asset-list', label: 'Asset List', icon: <List className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-neutral-900 text-4xl font-bold mb-3">Dashboard</h2>
              <p className="text-neutral-600 text-lg mb-6">
                Welcome back! Here's what's happening with your assets today.
              </p>
            </div>

            {/* Top Section - Key Metrics */}
            <MetricCards {...metrics} />

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left - Asset Status Overview */}
              <Card title="Asset Status Overview">
                <div className="grid grid-cols-2 gap-3">
                  <StatusOverviewCard
                    status="Assigned"
                    count={staticData.assigned}
                    color="blue"
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                  <StatusOverviewCard
                    status="Available"
                    count={staticData.available}
                    color="green"
                    icon={<FileTextIcon className="w-5 h-5" />}
                  />
                  <StatusOverviewCard
                    status="Maintenance"
                    count={staticData.underMaintenance}
                    color="orange"
                    icon={<Wrench className="w-5 h-5" />}
                  />
                  <StatusOverviewCard
                    status="Broken"
                    count={staticData.broken}
                    color="red"
                    icon={<X className="w-5 h-5" />}
                  />
                </div>
              </Card>

              {/* Right - Asset Categories */}
              <AssetCategoryCountTable staticData={staticData.categories} />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left - Recent Activity */}
              <RecentActivity activities={staticData.recentActivities} />

              {/* Right - Quick Actions */}
              <QuickActions
                onAddAsset={handleAddAsset}
                onAudit={handleAudit}
                onExport={handleExportAssets}
                onSettings={handleSettings}
              />
            </div>
          </div>
        );
      case 'asset-list':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Asset Management</h1>
                <p className="text-lg text-neutral-600">Track and manage all your company assets</p>
              </div>
              <Button
                onClick={handleAddAsset}
                icon={<Plus className="w-4 h-4" />}
                className="bg-blue-600 text-white hover:bg-blue-700"
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
          </div>
        );
      case 'settings':
        return <Settings />;
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Coming Soon</h3>
              <p className="text-neutral-600">This feature is under development and will be available soon.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Page Header - Only show for reports tab */}
      {activeTab === 'reports' && (
        <PageHeader
          title="Asset Tracker Dashboard"
          description="Manage and track your company's assets and equipment"
          actions={[]}
        />
      )}

      {/* Tab Content */}
      {renderTabContent()}


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
