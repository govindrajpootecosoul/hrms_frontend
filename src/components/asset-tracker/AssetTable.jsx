'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Eye, Edit, MoreHorizontal, UserPlus, CheckCircle, Wrench, X, ArrowLeft, ChevronDown, Plus, Upload, FileText, History } from 'lucide-react';
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
  onUpload,
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(null); // Track which asset's menu is open
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
  const [bulkSelectedEmployee, setBulkSelectedEmployee] = useState('');
  const [assignedToSearchQuery, setAssignedToSearchQuery] = useState('');
  const [isAssignedToOpen, setIsAssignedToOpen] = useState(false);
  const prevFilteredAssetsRef = useRef([]);
  const optionsMenuRef = useRef(null);
  const assignedToDropdownRef = useRef(null);
  const menuButtonClickedRef = useRef(false);

  // Keep status filter in sync when arriving via deep-link (?status=assigned)
  useEffect(() => {
    setStatusFilter(initialStatusFilter || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatusFilter]);

  // Filter assets based on search and filters
  const filteredAssets = assets.filter(asset => {
    // Enhanced search - search across all relevant fields
    const searchLower = searchTerm?.toLowerCase().trim() || '';
    const matchesSearch = !searchLower || 
      // Asset identification
      asset.assetTag?.toLowerCase().includes(searchLower) ||
      asset.serialNumber?.toLowerCase().includes(searchLower) ||
      // Product details
      asset.model?.toLowerCase().includes(searchLower) ||
      asset.brand?.toLowerCase().includes(searchLower) ||
      // Categories
      asset.category?.toLowerCase().includes(searchLower) ||
      asset.subcategory?.toLowerCase().includes(searchLower) ||
      // Assignment details
      asset.assignedTo?.toLowerCase().includes(searchLower) ||
      asset.department?.toLowerCase().includes(searchLower) ||
      // Location details
      asset.location?.toLowerCase().includes(searchLower) ||
      asset.site?.toLowerCase().includes(searchLower) ||
      // Status
      asset.status?.toLowerCase().includes(searchLower) ||
      // Notes/description (if available)
      asset.notes?.toLowerCase().includes(searchLower);
    
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

  // Filter employees based on search query for assigned to dropdown
  const filteredAssignedToOptions = allEmployees.filter(emp => {
    if (!assignedToSearchQuery.trim()) return true;
    const query = assignedToSearchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.employeeId?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
  });

  const assignedToOptions = [
    { value: '', label: 'Assigned To' },
    ...filteredAssignedToOptions.map(emp => ({ value: emp.name, label: emp.name })),
    { value: 'unassigned', label: 'Unassigned' },
  ];

  // Close assigned to dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assignedToDropdownRef.current && !assignedToDropdownRef.current.contains(event.target)) {
        setIsAssignedToOpen(false);
        setAssignedToSearchQuery('');
      }
    };

    if (isAssignedToOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAssignedToOpen]);

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

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
    setShowOptionsMenu(null); // Close any open menu
  };

  const handleEditAsset = (asset) => {
    console.log('[AssetTable] Edit asset clicked:', asset);
    setShowOptionsMenu(null); // Close menu
    if (onEdit) {
      onEdit(asset);
    } else {
      console.warn('[AssetTable] onEdit callback not provided');
    }
  };

  const handleDeleteAsset = (asset) => {
    console.log('[AssetTable] Delete asset clicked:', asset);
    setShowOptionsMenu(null); // Close menu
    if (window.confirm(`Are you sure you want to delete asset ${asset.assetTag || asset.id}? This action cannot be undone.`)) {
      if (onDelete) {
        onDelete(asset);
      } else {
        console.warn('[AssetTable] onDelete callback not provided');
      }
    }
  };

  const handleViewHistory = async (asset) => {
    console.log('[AssetTable] View history clicked for asset:', asset);
    setShowOptionsMenu(null); // Close menu
    setSelectedAsset(asset);
    setShowHistoryModal(true);
    await fetchAssetHistory(asset);
  };

  const fetchAssetHistory = async (asset) => {
    if (!asset) return;

    try {
      setLoadingHistory(true);
      const params = new URLSearchParams();
      
      // Get company from sessionStorage
      const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      if (selectedCompany) params.set('company', selectedCompany);
      
      // Get companyId from props or context if available
      // For now, we'll use asset's companyId if available
      
      const assetId = asset.id || asset._id?.toString();
      const assetTag = asset.assetTag;
      
      if (assetId) params.set('assetId', assetId);
      if (assetTag) params.set('assetTag', assetTag);
      
      params.set('limit', '200');

      const url = `/api/asset-tracker/history?${params.toString()}`;
      console.log('[AssetTable] Fetching asset history:', url);

      const res = await fetch(url);
      const data = await res.json();

      if (data?.success && data.data) {
        // Sort by createdAt descending (newest first)
        const sortedHistory = [...data.data].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setAssetHistory(sortedHistory);
      } else {
        setAssetHistory([]);
      }
    } catch (e) {
      console.error('[AssetTable] Error fetching asset history:', e);
      setAssetHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDateTimeWithAMPM = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const hh12 = String(hh % 12 || 12).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh12}:${min} ${ampm}`;
  };

  const getHistoryEventLabel = (type) => {
    const labels = {
      checkout: 'Check out',
      checkin: 'Check in',
      maintenance: 'Under Repair',
      broken: 'Broken',
      created: 'Asset created',
      updated: 'Asset edit',
      deleted: 'Asset deleted',
      warranty: 'Warranty',
      linking: 'Asset Linking',
    };
    return labels[type] || type || '—';
  };

  const parseHistoryEntry = (entry) => {
    let field = 'Status';
    let changedFrom = '—';
    let changedTo = '—';

    const type = entry.type || '';
    const action = entry.action || '';

    if (type === 'checkout') {
      if (entry.assignedFrom && entry.assignedTo && entry.assignedFrom !== entry.assignedTo) {
        field = 'Assignment';
        changedFrom = entry.assignedFrom;
        changedTo = entry.assignedTo;
      } else if (entry.assignedTo) {
        field = 'Status';
        changedFrom = 'Available';
        changedTo = 'Checked out';
      } else {
        field = 'Status';
        changedFrom = 'Available';
        changedTo = 'Checked out';
      }
      
      if (entry.department) {
        field = 'Department';
        changedTo = entry.department;
      }
    } else if (type === 'checkin') {
      if (entry.assignedFrom) {
        field = 'Status';
        changedFrom = 'Checked out';
        changedTo = 'Available';
      } else {
        field = 'Status';
        changedFrom = 'Checked out';
        changedTo = 'Available';
      }
    } else if (type === 'updated') {
      const actionLower = action.toLowerCase();
      if (actionLower.includes('ram 1')) {
        field = 'RAM 1 Size';
      } else if (actionLower.includes('ram 2')) {
        field = 'RAM 2 Size';
      } else if (actionLower.includes('ram')) {
        field = 'Total RAM';
      } else if (actionLower.includes('serial')) {
        field = 'Serial No';
      } else if (actionLower.includes('brand')) {
        field = 'Brand';
      } else if (actionLower.includes('model')) {
        field = 'Model';
      } else if (actionLower.includes('device id')) {
        field = 'Device ID';
      } else if (actionLower.includes('sub category')) {
        field = 'Sub Category';
      } else if (actionLower.includes('category')) {
        field = 'Category';
      } else if (actionLower.includes('warranty')) {
        field = 'Warranty';
      } else if (actionLower.includes('linking') || actionLower.includes('child')) {
        field = 'Child Asset';
      } else if (actionLower.includes('re-assigned')) {
        field = 'Assignment';
        changedFrom = entry.assignedFrom || '—';
        changedTo = entry.assignedTo || '—';
      } else {
        field = 'Asset edit';
      }
      
      if (entry.description && field !== 'Asset edit') {
        changedTo = entry.description;
      }
    } else if (type === 'created') {
      field = 'Asset created';
      if (entry.description) {
        changedTo = entry.description;
      }
    } else if (type === 'warranty') {
      field = 'Warranty';
    } else if (type === 'linking') {
      field = 'Child Asset';
      if (entry.description) {
        changedTo = entry.description;
      }
    } else if (type === 'broken') {
      field = 'Status';
      changedFrom = entry.status || 'Available';
      changedTo = 'Broken';
    } else if (type === 'maintenance') {
      field = 'Status';
      changedFrom = entry.status || 'Available';
      changedTo = 'Under Repair';
    } else if (type === 'deleted') {
      field = 'Asset deleted';
    }

    return { field, changedFrom, changedTo };
  };

  // Close options menu when clicking outside
  useEffect(() => {
    if (!showOptionsMenu) {
      menuButtonClickedRef.current = false;
      return;
    }

    const handleClickOutside = (event) => {
      // Ignore if menu button was just clicked
      if (menuButtonClickedRef.current) {
        menuButtonClickedRef.current = false;
        return;
      }
      
      // Check if click is outside the menu
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowOptionsMenu(null);
      }
    };

    // Use setTimeout to ensure menu is rendered and button click event has completed
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('keydown', handleEscape);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showOptionsMenu]);

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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by tag ID, model, brand, assigned to, department, location, site, or any field..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-3.5 h-3.5" />}
            className="!pl-10 !pr-3 !py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-36 relative" ref={assignedToDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAssignedToOpen(!isAssignedToOpen)}
              className={`w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 bg-white text-left flex items-center justify-between cursor-pointer hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 ${
                assignedToFilter ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span className="truncate">
                {assignedToFilter === 'unassigned' 
                  ? 'Unassigned' 
                  : assignedToFilter 
                    ? allEmployees.find(emp => emp.name === assignedToFilter)?.name || assignedToFilter
                    : 'Assigned To'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isAssignedToOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Backdrop to close dropdown */}
            {isAssignedToOpen && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => {
                  setIsAssignedToOpen(false);
                  setAssignedToSearchQuery('');
                }}
              />
            )}
            
            {isAssignedToOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
                {/* Search Input */}
                <div className="p-2 border-b border-neutral-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={assignedToSearchQuery}
                      onChange={(e) => setAssignedToSearchQuery(e.target.value)}
                      placeholder="Search by name, email, ID..."
                      className="w-full pl-7 pr-2 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Options List */}
                <div className="overflow-y-auto max-h-48">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignedToFilter('');
                      setIsAssignedToOpen(false);
                      setAssignedToSearchQuery('');
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-100 transition-colors ${
                      !assignedToFilter ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignedToFilter('unassigned');
                      setIsAssignedToOpen(false);
                      setAssignedToSearchQuery('');
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-100 transition-colors ${
                      assignedToFilter === 'unassigned' ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                    }`}
                  >
                    Unassigned
                  </button>
                  {filteredAssignedToOptions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500">
                      {assignedToSearchQuery ? 'No employees found matching your search.' : 'No employees available.'}
                    </div>
                  ) : (
                    filteredAssignedToOptions.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => {
                          setAssignedToFilter(employee.name);
                          setIsAssignedToOpen(false);
                          setAssignedToSearchQuery('');
                        }}
                        className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-100 transition-colors ${
                          assignedToFilter === employee.name ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.name}</span>
                          {(employee.email || employee.department) && (
                            <span className="text-neutral-500 text-xs truncate">
                              {employee.email}
                              {employee.email && employee.department ? ' • ' : ''}
                              {employee.department}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer with count */}
                {filteredAssignedToOptions.length > 0 && (
                  <div className="px-3 py-1.5 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                    Showing {filteredAssignedToOptions.length} of {allEmployees.length} employees
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-28">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              className="!px-3 !py-2 text-sm"
            />
          </div>
          <div className="w-36">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Category"
              className="!px-3 !py-2 text-sm"
            />
          </div>
          <div className="w-36">
            <Select
              options={departmentOptions}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="Department"
              className="!px-3 !py-2 text-sm"
            />
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onExport}
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              className="bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
            >
              Export Report
            </Button>
            <Button
              onClick={onUpload}
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              className="bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
            >
              Upload Excel
            </Button>
            <Button
              onClick={onAdd}
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Asset
            </Button>
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
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  ASSIGNED TO
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-40">
                  DEPARTMENT
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  ASSET TAG ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  MODEL
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  CATEGORY
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  SUB CATEGORY
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  LOCATION
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  SITE
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider w-32">
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
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={() => handleSelectAsset(asset.id)}
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-neutral-700">
                      {asset.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-2 py-2 text-sm text-neutral-700">
                      {asset.department || '—'}
                    </td>
                    <td className="px-3 py-2">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleViewAsset(asset)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        {asset.assetTag}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-sm text-neutral-900">
                      {asset.model}
                    </td>
                    <td className="px-3 py-2 text-sm text-neutral-700">
                      {asset.category}
                    </td>
                    <td className="px-3 py-2 text-sm text-neutral-700">
                      {asset.subcategory}
                    </td>
                    <td className="px-3 py-2 text-sm text-neutral-700">
                      {asset.location}
                    </td>
                    <td className="px-3 py-2 text-sm text-neutral-700">
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
                                handleViewAsset(asset);
                              }}
                              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                              title="View Asset Details"
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
                                handleViewAsset(asset);
                              }}
                              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                              title="View Asset Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <div className="relative" ref={optionsMenuRef}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              menuButtonClickedRef.current = true;
                              const newMenuState = showOptionsMenu === asset.id ? null : asset.id;
                              console.log('Options menu button clicked, setting menu to:', newMenuState);
                              setShowOptionsMenu(newMenuState);
                            }}
                            className="w-8 h-8 rounded-full bg-neutral-300 hover:bg-neutral-400 text-white flex items-center justify-center transition-colors"
                            title="More Options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {showOptionsMenu === asset.id && (
                            <div 
                              className="absolute right-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-xl z-[100]"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  console.log('Edit button clicked for asset:', asset);
                                  handleEditAsset(asset);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2 transition-colors rounded-t-lg"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  console.log('View History button clicked for asset:', asset);
                                  handleViewHistory(asset);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2 transition-colors"
                              >
                                <History className="w-4 h-4" />
                                View History
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  console.log('Delete button clicked for asset:', asset);
                                  handleDeleteAsset(asset);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-b-lg"
                              >
                                <X className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
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

      {/* View Asset Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAsset(null);
        }}
        title={`Asset Details: ${selectedAsset?.assetTag || ''}`}
        size="xl"
      >
        {selectedAsset && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Asset Tag ID</label>
                  <p className="text-sm text-neutral-900 mt-1 font-mono">{selectedAsset.assetTag || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedAsset.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Category</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.category || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Sub Category</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.subcategory || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Site</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.site || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Location</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.location || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Assigned To</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Department</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.department || '—'}</p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Brand</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.brand || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Model</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.model || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Serial Number</label>
                  <p className="text-sm text-neutral-900 mt-1 font-mono">{selectedAsset.serialNumber || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Description</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.description || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Processor</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.processor || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Processor Generation</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.processorGeneration || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Total RAM</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.totalRAM || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">RAM 1 Size</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.ram1Size || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">RAM 2 Size</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.ram2Size || '—'}</p>
                </div>
              </div>
            </div>

            {/* Warranty Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Warranty Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Start</label>
                  <p className="text-sm text-neutral-900 mt-1">
                    {selectedAsset.warrantyStart ? new Date(selectedAsset.warrantyStart).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Months</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.warrantyMonths || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Expire</label>
                  <p className="text-sm text-neutral-900 mt-1">
                    {selectedAsset.warrantyExpire ? new Date(selectedAsset.warrantyExpire).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Purchase Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Purchase Date</label>
                  <p className="text-sm text-neutral-900 mt-1">
                    {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Purchase Price</label>
                  <p className="text-sm text-neutral-900 mt-1">
                    {selectedAsset.purchasePrice ? `$${selectedAsset.purchasePrice}` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Notes
              </h3>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{selectedAsset.notes || '—'}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Timestamps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedAsset.createdAt && (
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase">Created At</label>
                    <p className="text-sm text-neutral-900 mt-1">
                      {new Date(selectedAsset.createdAt).toLocaleString() || '—'}
                    </p>
                  </div>
                )}
                {selectedAsset.updatedAt && (
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase">Last Updated</label>
                    <p className="text-sm text-neutral-900 mt-1">
                      {new Date(selectedAsset.updatedAt).toLocaleString() || '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAsset(null);
                }}
                className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAsset(selectedAsset);
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Edit Asset
              </Button>
            </div>
          </div>
        )}
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

      {/* Asset History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setAssetHistory([]);
          setSelectedAsset(null);
        }}
        title={`History: ${selectedAsset?.assetTag || ''}`}
        size="xl"
      >
        {loadingHistory ? (
          <div className="py-8 text-center text-sm text-neutral-500">Loading history...</div>
        ) : assetHistory.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500">No history found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">
                    Event
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">
                    Field
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">
                    Changed from
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">
                    Changed to
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">
                    Action by
                  </th>
                </tr>
              </thead>
              <tbody>
                {assetHistory.map((h, idx) => {
                  const event = getHistoryEventLabel(h.type);
                  const { field, changedFrom, changedTo } = parseHistoryEntry(h);
                  const actionBy = h.actionBy || h.assignedTo || h.assignedFrom || '—';

                  return (
                    <tr key={h._id || idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-xs text-neutral-700">
                        {formatDateTimeWithAMPM(h.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-xs text-neutral-700 capitalize">{event}</td>
                      <td className="py-3 px-4 text-xs text-neutral-700">{field}</td>
                      <td className="py-3 px-4 text-xs text-neutral-600">{changedFrom || '—'}</td>
                      <td className="py-3 px-4 text-xs text-neutral-600">{changedTo || '—'}</td>
                      <td className="py-3 px-4 text-xs text-neutral-700">{actionBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssetTable;
