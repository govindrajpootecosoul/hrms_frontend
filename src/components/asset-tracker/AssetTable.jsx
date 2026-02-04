'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Eye, Edit, MoreHorizontal, UserPlus, CheckCircle, Wrench, X, ArrowLeft } from 'lucide-react';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import EmployeeSelect from '@/components/common/EmployeeSelect';
import { API_BASE_URL } from '@/lib/utils/constants';

const AssetTable = ({
  assets = [],
  employees = [],
  loading = false,
  initialStatusFilter = '',
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  onAdd,
  onAssign,
  onUnassign,
  onExport,
  onFilteredAssetsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
  const [bulkSelectedEmployee, setBulkSelectedEmployee] = useState('');
  const prevFilteredAssetsRef = useRef([]);

  // Keep status filter in sync when arriving via deep-link (?status=assigned)
  useEffect(() => {
    setStatusFilter(initialStatusFilter || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatusFilter]);

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

  // Notify parent component of filtered assets changes
  useEffect(() => {
    // Only update if the filtered assets actually changed (compare by IDs)
    const currentIds = filteredAssets.map(a => a.id || a._id?.toString()).sort().join(',');
    const prevIds = prevFilteredAssetsRef.current.map(a => a.id || a._id?.toString()).sort().join(',');
    
    if (currentIds !== prevIds && onFilteredAssetsChange) {
      prevFilteredAssetsRef.current = filteredAssets;
      onFilteredAssetsChange(filteredAssets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAssets]);

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

  // Fetch employees from API on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Get selected company from sessionStorage
        const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
        
        // Build API URL with company filter if available
        let apiUrl = `${API_BASE_URL}/admin-users`;
        if (selectedCompany) {
          apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.success && data.users) {
          const employeeList = data.users
            .filter(user => user.active !== false)
            .map(user => ({
              id: user.id || user._id,
              name: user.name || '',
              email: user.email || '',
              employeeId: user.employeeId || '',
              department: user.department || ''
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setAllEmployees(employeeList);
          console.log(`[AssetTable] Loaded ${employeeList.length} employees${selectedCompany ? ` for company: ${selectedCompany}` : ''}`);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Fallback to prop employees if API fails
        if (employees && employees.length > 0) {
          setAllEmployees(employees);
        }
      }
    };
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const assignedToOptions = [
    { value: '', label: 'Assigned To' },
    ...allEmployees.map(emp => ({ value: emp.name, label: emp.name })),
    { value: 'unassigned', label: 'Unassigned' },
  ];

  const [departments, setDepartments] = useState([]);

  // Fetch unique departments from users
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Get selected company from sessionStorage
        const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
        
        // Build API URL with company filter if available
        let apiUrl = `${API_BASE_URL}/admin-users`;
        if (selectedCompany) {
          apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.success && data.users) {
          // Get unique departments from users
          const uniqueDepartments = [...new Set(
            data.users
              .filter(user => user.active !== false && user.department)
              .map(user => user.department)
              .filter(Boolean)
          )].sort();
          
          setDepartments(uniqueDepartments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        // Fallback to default departments
        setDepartments(['IT Department', 'HR', 'Finance', 'Marketing']);
      }
    };
    fetchDepartments();
  }, []);

  const departmentOptions = [
    { value: '', label: 'Department' },
    ...departments.map(dept => ({ value: dept, label: dept })),
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

  const handleBulkDelete = () => {
    if (selectedAssets.length === 0) return;
    console.log('[AssetTable] Opening bulk delete modal for', selectedAssets.length, 'assets');
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedAssets.length === 0) {
      setShowBulkDeleteModal(false);
      return;
    }

    try {
      // Use dedicated bulk delete handler if available, otherwise fall back to individual deletes
      if (onBulkDelete) {
        // Get the asset objects for bulk delete
        const assetsToDelete = filteredAssets.filter(asset => selectedAssets.includes(asset.id));
        await onBulkDelete(assetsToDelete);
      } else if (onDelete) {
        // Fallback: Delete each selected asset (permission taken once via the dialog)
        const deletePromises = selectedAssets.map((assetId) => {
          const asset = filteredAssets.find((a) => a.id === assetId);
          if (asset) return onDelete(asset);
          return Promise.resolve();
        });
        await Promise.all(deletePromises);
      }
      setSelectedAssets([]);
    } catch (error) {
      console.error('Error bulk deleting assets:', error);
    } finally {
      setShowBulkDeleteModal(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkSelectedEmployee || selectedAssets.length === 0) return;
    
    try {
      // Assign each selected asset
      const assignPromises = selectedAssets.map(assetId => {
        if (onAssign) {
          return onAssign(assetId, bulkSelectedEmployee);
        }
        return Promise.resolve();
      });

      await Promise.all(assignPromises);
      
      setShowBulkAssignModal(false);
      setBulkSelectedEmployee('');
      setSelectedAssets([]);
    } catch (error) {
      console.error('Error bulk assigning assets:', error);
    }
  };

  const handleBulkEmployeeSelect = (employeeName) => {
    setBulkSelectedEmployee(employeeName);
    
    // Auto-fetch department when employee is selected
    if (employeeName && allEmployees.length > 0) {
      const employee = allEmployees.find(emp => emp.name === employeeName);
      if (employee && employee.department) {
        setSelectedEmployeeDepartment(employee.department);
      } else {
        setSelectedEmployeeDepartment('');
      }
    } else {
      setSelectedEmployeeDepartment('');
    }
  };

  const handleAssign = (asset) => {
    setSelectedAsset(asset);
    setSelectedEmployeeName(asset.assignedTo || '');
    setSelectedEmployeeDepartment('');
    setShowAssignModal(true);
  };

  const handleEmployeeSelect = (employeeName) => {
    setSelectedEmployeeName(employeeName);
    
    // Auto-fetch department when employee is selected
    if (employeeName && allEmployees.length > 0) {
      const employee = allEmployees.find(emp => emp.name === employeeName);
      if (employee && employee.department) {
        setSelectedEmployeeDepartment(employee.department);
        console.log(`[Assign Modal] Selected employee: ${employeeName}, Department: ${employee.department}`);
      } else {
        setSelectedEmployeeDepartment('');
      }
    } else {
      setSelectedEmployeeDepartment('');
    }
  };

  const handleAssignSubmit = () => {
    if (onAssign && selectedAsset) {
      onAssign(selectedAsset.id, selectedEmployeeName);
    }
    setShowAssignModal(false);
    setSelectedAsset(null);
    setSelectedEmployeeName('');
    setSelectedEmployeeDepartment('');
  };

  const handleUnassign = (asset) => {
    if (confirm(`Are you sure you want to collect back this asset from ${asset.assignedTo}?`)) {
      if (onUnassign) {
        onUnassign(asset.id);
      } else if (onAssign) {
        // Fallback to onAssign with null/empty name
        onAssign(asset.id, '');
      }
    }
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

      {/* Bulk Actions Bar */}
      {selectedAssets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowBulkAssignModal(true)}
              icon={<UserPlus className="w-4 h-4" />}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Assign To
            </Button>
            <Button
              onClick={handleBulkDelete}
              icon={<X className="w-4 h-4" />}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
            <Button
              onClick={() => setSelectedAssets([])}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

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
                  ASSIGNED TO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-40">
                  DEPARTMENT
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
                <th className="px-2 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider w-32">
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
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {asset.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-3 py-4 text-sm text-neutral-700">
                      {asset.department || '—'}
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
                    <td className="px-2 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Show Collect Back button if asset has assignedTo */}
                        {asset.assignedTo && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassign(asset);
                              }}
                              className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                              title="Collect Back Asset"
                            >
                              <ArrowLeft className="w-4 h-4" />
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
                        {/* Show Assign button if asset is not assigned */}
                        {!asset.assignedTo && (
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
            <EmployeeSelect
              value={selectedEmployeeName}
              onChange={handleEmployeeSelect}
              placeholder="Select Employee to Assign"
              showUnassigned={true}
            />
          </div>
          
          {/* Show selected employee's department */}
          {selectedEmployeeName && selectedEmployeeDepartment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-900">
                <strong>Department:</strong> <span className="font-medium">{selectedEmployeeDepartment}</span>
                <p className="text-xs text-blue-700 mt-1">This department will be automatically assigned to the asset.</p>
              </div>
            </div>
          )}
          
          {selectedEmployeeName && !selectedEmployeeDepartment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-900">
                <strong>Note:</strong> Selected employee does not have a department assigned. The asset will be assigned without a department.
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              onClick={() => {
                setShowAssignModal(false);
                setSelectedAsset(null);
                setSelectedEmployeeName('');
                setSelectedEmployeeDepartment('');
              }}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Assign Asset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={showBulkAssignModal}
        onClose={() => {
          setShowBulkAssignModal(false);
          setBulkSelectedEmployee('');
          setSelectedEmployeeDepartment('');
        }}
        title={`Bulk Assign ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Selected Assets</h4>
            <div className="text-sm text-neutral-600">
              <p>{selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} will be assigned</p>
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                  {filteredAssets
                    .filter(asset => selectedAssets.includes(asset.id))
                    .slice(0, 10)
                    .map(asset => (
                      <li key={asset.id} className="text-xs">
                        {asset.assetTag || asset.id}
                      </li>
                    ))}
                  {selectedAssets.length > 10 && (
                    <li className="text-xs text-neutral-500">... and {selectedAssets.length - 10} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <EmployeeSelect
              value={bulkSelectedEmployee}
              onChange={handleBulkEmployeeSelect}
              placeholder="Select Employee to Assign"
              showUnassigned={true}
            />
          </div>
          
          {/* Show selected employee's department */}
          {bulkSelectedEmployee && selectedEmployeeDepartment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-900">
                <strong>Department:</strong> <span className="font-medium">{selectedEmployeeDepartment}</span>
                <p className="text-xs text-blue-700 mt-1">This department will be automatically assigned to all selected assets.</p>
              </div>
            </div>
          )}
          
          {bulkSelectedEmployee && !selectedEmployeeDepartment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-900">
                <strong>Note:</strong> Selected employee does not have a department assigned. Assets will be assigned without a department.
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              onClick={() => {
                setShowBulkAssignModal(false);
                setBulkSelectedEmployee('');
                setSelectedEmployeeDepartment('');
              }}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAssign}
              disabled={!bulkSelectedEmployee}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              Assign {selectedAssets.length} Asset{selectedAssets.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Dialog */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title={`Delete ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}?`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <p className="text-sm text-rose-900 font-medium">
              This action cannot be undone.
            </p>
            <p className="text-sm text-rose-800 mt-1">
              You are about to permanently delete {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Selected Assets</h4>
            <div className="text-sm text-neutral-600">
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                  {filteredAssets
                    .filter((asset) => selectedAssets.includes(asset.id))
                    .slice(0, 10)
                    .map((asset) => (
                      <li key={asset.id} className="text-xs">
                        {asset.assetTag || asset.id}
                      </li>
                    ))}
                  {selectedAssets.length > 10 && (
                    <li className="text-xs text-neutral-500">... and {selectedAssets.length - 10} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              onClick={() => setShowBulkDeleteModal(false)}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete {selectedAssets.length} Asset{selectedAssets.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssetTable;
