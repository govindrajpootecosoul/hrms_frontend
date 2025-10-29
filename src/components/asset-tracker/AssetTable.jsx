'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, Plus, UserPlus, QrCode } from 'lucide-react';
import { ASSET_STATUS, ASSET_CATEGORIES } from '@/lib/utils/constants';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';

const AssetTable = ({
  assets = [],
  employees = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onAssign,
  onExport,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const pageSize = 15;

  // Filter assets based on search and filters
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    const matchesCategory = !categoryFilter || asset.category === categoryFilter;
    const matchesLocation = !locationFilter || asset.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentTablePage(1);
  }, [searchTerm, statusFilter, categoryFilter, locationFilter, assets]);

  const totalPagesCalc = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
  const startIdx = (currentTablePage - 1) * pageSize;
  const paginatedAssets = filteredAssets.slice(startIdx, startIdx + pageSize);

  const statusOptions = [
    { value: '', label: 'All Status' },
    ...ASSET_STATUS.map(status => ({ value: status.value, label: status.label }))
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...ASSET_CATEGORIES.map(category => ({ value: category.id, label: category.name }))
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'office-1', label: 'Office Building 1' },
    { value: 'office-2', label: 'Office Building 2' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'remote', label: 'Remote' }
  ];

  const handleAssign = (asset) => {
    setSelectedAsset(asset);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = (employeeId) => {
    if (onAssign && selectedAsset) {
      onAssign(selectedAsset.id, employeeId);
    }
    setShowAssignModal(false);
    setSelectedAsset(null);
  };

  const columns = [
    {
      key: 'assetTag',
      title: 'Asset Tag',
      render: (value) => (
        <div className="flex items-center">
          <span className="font-mono text-sm font-medium text-primary-400 mr-2">
            {value}
          </span>
          <button className="text-white/60 hover:text-white">
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (value, asset) => (
        <div>
          <Badge variant="info" size="sm" className="mb-1">
            {asset.category}
          </Badge>
          <div className="text-xs text-white/60">{asset.subcategory}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = ASSET_STATUS.find(s => s.value === value);
        const variant = statusConfig?.color === 'green' ? 'success' : 
                      statusConfig?.color === 'blue' ? 'info' :
                      statusConfig?.color === 'orange' ? 'warning' : 'danger';
        return <Badge variant={variant} size="sm">{statusConfig?.label || value}</Badge>;
      }
    },
    {
      key: 'model',
      title: 'Model',
      render: (value, asset) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-xs text-white/60">{asset.brand}</div>
        </div>
      )
    },
    {
      key: 'serialNumber',
      title: 'Serial Number',
      render: (value) => (
        <span className="font-mono text-sm text-white/80">{value}</span>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (value, asset) => (
        <div>
          <div className="text-sm text-white">{value}</div>
          <div className="text-xs text-white/60">{asset.site}</div>
        </div>
      )
    },
    {
      key: 'assignedTo',
      title: 'Assigned To',
      render: (value) => (
        <span className="text-sm text-white/80">{value || 'Unassigned'}</span>
      )
    }
  ];

  const actions = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: 'View Asset',
      onClick: (asset) => onView?.(asset)
    },
    {
      icon: <Edit className="w-4 h-4" />,
      title: 'Edit Asset',
      onClick: (asset) => onEdit?.(asset)
    },
    {
      icon: <UserPlus className="w-4 h-4" />,
      title: 'Assign Asset',
      onClick: (asset) => handleAssign(asset)
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      title: 'Delete Asset',
      variant: 'danger',
      onClick: (asset) => onDelete?.(asset)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button onClick={onAdd} icon={<Plus className="w-4 h-4" />}>
            Add Asset
          </Button>
          <Button variant="ghost" onClick={onExport} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
        
        <div className="text-sm text-neutral-600">
          {filteredAssets.length} of {assets.length} assets
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search assets..."
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
        
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
        
        <Select
          options={locationOptions}
          value={locationFilter}
          onChange={setLocationFilter}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedAssets}
        loading={loading}
        actions={actions}
        pagination={true}
        currentPage={currentTablePage}
        totalPages={totalPagesCalc}
        onPageChange={setCurrentTablePage}
        emptyMessage="No assets found. Add your first asset to get started."
      />

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Asset: ${selectedAsset?.assetTag}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Asset Details</h4>
            <div className="text-sm text-neutral-600">
              <p><strong>Model:</strong> {selectedAsset?.model}</p>
              <p><strong>Serial:</strong> {selectedAsset?.serialNumber}</p>
              <p><strong>Location:</strong> {selectedAsset?.location}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Employee
            </label>
            <Select
              options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
              placeholder="Choose an employee"
              onChange={handleAssignSubmit}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAssignSubmit('')}>
              Assign Asset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssetTable;
