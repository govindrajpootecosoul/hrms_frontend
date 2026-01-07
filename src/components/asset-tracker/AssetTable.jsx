'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Edit, MoreHorizontal, UserPlus, CheckCircle, Wrench, X } from 'lucide-react';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Filter assets based on search and filters
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    const matchesCategory = !categoryFilter || asset.category === categoryFilter;
    const matchesAssignedTo = !assignedToFilter || 
      (assignedToFilter === 'unassigned' ? !asset.assignedTo : asset.assignedTo === assignedToFilter);
    const matchesDepartment = !departmentFilter || asset.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesAssignedTo && matchesDepartment;
  });

  const statusOptions = [
    { value: '', label: 'Status' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'available', label: 'Available' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'broken', label: 'Broken' },
  ];

  const categoryOptions = [
    { value: '', label: 'Category' },
    { value: 'Computer Assets', label: 'Computer Assets' },
    { value: 'External Equipment', label: 'External Equipment' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Furniture', label: 'Furniture' },
  ];

  const assignedToOptions = [
    { value: '', label: 'Assigned To' },
    ...employees.map(emp => ({ value: emp.name, label: emp.name })),
    { value: 'unassigned', label: 'Unassigned' },
  ];

  const departmentOptions = [
    { value: '', label: 'Department' },
    { value: 'IT Department', label: 'IT Department' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  const handleSelectAsset = (assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: {
        label: 'Assigned',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: <UserPlus className="w-3 h-3" />,
      },
      available: {
        label: 'Available',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      maintenance: {
        label: 'Maintenance',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        icon: <Wrench className="w-3 h-3" />,
      },
      broken: {
        label: 'Broken',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-700',
        borderColor: 'border-rose-200',
        icon: <X className="w-3 h-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search assets by name, tag ID, model, or any other field..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-3">
          <div className="w-40">
            <Select
              options={assignedToOptions}
              value={assignedToFilter}
              onChange={setAssignedToFilter}
              placeholder="Assigned To"
            />
          </div>
          <div className="w-32">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
            />
          </div>
          <div className="w-40">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Category"
            />
          </div>
          <div className="w-40">
            <Select
              options={departmentOptions}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="Department"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  ASSET TAG ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  MODEL
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  CATEGORY
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  SUB CATEGORY
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  LOCATION
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  SITE
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  ASSIGNED TO
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  DEPARTMENT
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-neutral-500">
                    Loading assets...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>No assets found</p>
                      <p className="text-sm text-neutral-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-neutral-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={() => handleSelectAsset(asset.id)}
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onView?.(asset)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        {asset.assetTag}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-900">
                      {asset.model}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {asset.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {asset.subcategory}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {asset.location}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {asset.site}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {asset.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {asset.department || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {asset.status === 'available' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssign(asset);
                              }}
                              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                              title="Assign Asset"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView?.(asset);
                              }}
                              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                              title="View/Edit Asset"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {(asset.status === 'assigned') && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView?.(asset);
                              }}
                              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                              title="View/Edit Asset"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // More options menu - could show dropdown with edit, delete, etc.
                          }}
                          className="w-8 h-8 rounded-full bg-neutral-300 hover:bg-neutral-400 text-white flex items-center justify-center transition-colors"
                          title="More Options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            <div className="text-sm text-neutral-600 space-y-1">
              <p><strong>Model:</strong> {selectedAsset?.model}</p>
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
            <Button onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssetTable;
