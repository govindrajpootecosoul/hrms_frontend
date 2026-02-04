'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Upload, Settings as SettingsIcon, LayoutDashboard, List, FileText, CheckCircle, FileText as FileTextIcon, Wrench, X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import MetricCards from '@/components/asset-tracker/MetricCards';
import AssetForm from '@/components/asset-tracker/AssetForm';
import AssetTable from '@/components/asset-tracker/AssetTable';
import StatusOverviewCard from '@/components/asset-tracker/StatusOverviewCard';
import AssetHistoryFeed from '@/components/asset-tracker/AssetHistoryFeed';
import QuickActions from '@/components/asset-tracker/QuickActions';
import AssetCategoryCountTable from '@/components/asset-tracker/AssetCategoryCountTable';
import Settings from '@/components/asset-tracker/Settings';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { API_BASE_URL } from '@/lib/utils/constants';
import { useAuth } from '@/lib/context/AuthContext';
import { getCompanyFromEmail } from '@/lib/config/database.config';

const AssetTrackerDashboard = () => {
  const params = useParams();
  const companyId = params.companyId;
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanySelectModal, setShowCompanySelectModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEditAsset, setShowEditAsset] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialStatusFilter, setInitialStatusFilter] = useState('');
  const fileInputRef = useRef(null);
  const [assets, setAssets] = useState([]); // Start with empty array, load from MongoDB
  const [filteredAssets, setFilteredAssets] = useState([]);
  
  // Memoize the callback to prevent infinite loops
  const handleFilteredAssetsChange = useCallback((filtered) => {
    // Only update if the array reference or content actually changed
    setFilteredAssets(prev => {
      // Compare by length and IDs to avoid unnecessary updates
      if (prev.length !== filtered.length) {
        return filtered;
      }
      const prevIds = prev.map(a => a.id || a._id?.toString()).sort().join(',');
      const newIds = filtered.map(a => a.id || a._id?.toString()).sort().join(',');
      if (prevIds !== newIds) {
        return filtered;
      }
      return prev; // No change, return previous state
    });
  }, []);

  const employees = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Wilson' },
    { id: '4', name: 'Emma Davis' },
    { id: '5', name: 'David Brown' }
  ];

  // Load assets from MongoDB
  const loadAssets = async () => {
    try {
      setLoading(true);
      
      // Get selected company from sessionStorage to filter assets
      const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      
      console.log(`[AssetTracker] Fetching assets for companyId: ${companyId}, Company: ${selectedCompany}`);
      
      // Build API URL with company filter if available
      let apiUrl = `/api/asset-tracker/assets?companyId=${companyId}`;
      if (selectedCompany) {
        apiUrl += `&company=${encodeURIComponent(selectedCompany)}`;
      }
      
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log(`[AssetTracker] API Response:`, { success: data.success, count: data.count, dataLength: data.data?.length, company: selectedCompany });
      
      if (data.success && Array.isArray(data.data)) {
        const formattedAssets = data.data.map(asset => ({
          ...asset,
          id: asset.id || asset._id?.toString() || Date.now().toString(),
        }));
        
        console.log(`[AssetTracker] Loaded ${formattedAssets.length} assets from database${selectedCompany ? ` (filtered by company: ${selectedCompany})` : ''}`);
        setAssets(formattedAssets);
      } else {
        console.warn('[AssetTracker] No assets data received or invalid format:', data);
        setAssets([]);
        if (data.error) {
          toast.error(data.error || 'Failed to load assets');
        }
      }
    } catch (error) {
      console.error('[AssetTracker] Error loading assets:', error);
      toast.error(`Failed to load assets: ${error.message}`);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Format company name for display
  const formatCompanyName = (company) => {
    if (!company) return null;
    // Format "Ecosoul Home" to "EcoSoul"
    if (company === 'Ecosoul Home') {
      return 'EcoSoul';
    }
    // Keep "Thrive" as is
    if (company === 'Thrive') {
      return 'Thrive';
    }
    return company;
  };

  // Get selected company from sessionStorage and auto-detect from user email if not set
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let company = sessionStorage.getItem('selectedCompany');
      
      // Always auto-detect from user's email if available (overrides any existing selection)
      // This ensures that when user logs in with Thrive email, they see Thrive assets
      if (user?.email) {
        const detectedCompany = getCompanyFromEmail(user.email);
        if (detectedCompany) {
          // Auto-set the company based on email domain (this ensures correct company is always set)
          company = detectedCompany;
          sessionStorage.setItem('selectedCompany', company);
          console.log(`[AssetTracker] Auto-detected and set company from email: ${company}`);
        }
      }
      
      setSelectedCompany(company);
      
      // Show company selection modal only if we still don't have a company after checking user email
      if (!company) {
        if (user?.email) {
          // User is loaded but email doesn't match expected domains - show modal
          setShowCompanySelectModal(true);
        } else {
          // User not loaded yet - wait a bit before showing modal
          const timer = setTimeout(() => {
            const finalCompany = sessionStorage.getItem('selectedCompany');
            if (!finalCompany) {
              setShowCompanySelectModal(true);
            }
          }, 500);
          return () => clearTimeout(timer);
        }
      } else {
        // Company is set, make sure modal is closed
        setShowCompanySelectModal(false);
      }
    }
  }, [user]);
  
  // Handle company selection
  const handleCompanySelect = (companyName) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedCompany', companyName);
      setSelectedCompany(companyName);
      setShowCompanySelectModal(false);
      // Reload assets for the selected company
      loadAssets();
    }
  };

  // Load assets on mount and when companyId or selectedCompany changes
  // Also reload when user changes (to ensure company is set from email)
  useEffect(() => {
    // Only load assets if we have a company set (either from sessionStorage or auto-detected)
    if (selectedCompany || user?.email) {
      loadAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, selectedCompany, user]);

  // Calculate metrics dynamically from assets (using useMemo for performance)
  const metrics = useMemo(() => {
    const totalAssets = assets.length;
    const assigned = assets.filter(a => a.status === 'assigned').length;
    const available = assets.filter(a => a.status === 'available').length;
    const underMaintenance = assets.filter(a => a.status === 'maintenance').length;
    const broken = assets.filter(a => a.status === 'broken').length;

    // Calculate category counts
    const categories = {};
    assets.forEach(asset => {
      if (asset.category) {
        categories[asset.category] = (categories[asset.category] || 0) + 1;
      }
    });

    return {
      totalAssets,
      assigned,
      available,
      underMaintenance,
      broken,
      categories,
    };
  }, [assets]);

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setShowAddAsset(true);
  };

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setShowEditAsset(true);
  };

  const handleViewAsset = (asset) => {
    // Open edit form when clicking eye button
    setSelectedAsset(asset);
    setShowEditAsset(true);
  };

  const handleDeleteAsset = async (asset) => {
    try {
      const res = await fetch(`/api/asset-tracker/assets?id=${asset.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setAssets(prev => prev.filter(ast => ast.id !== asset.id));
        toast.success(`${asset.assetTag} has been deleted successfully`);
      } else {
        toast.error(data.error || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const handleBulkDeleteAssets = async (assetsToDelete) => {
    try {
      // Delete all assets in parallel without any confirmations
      const deletePromises = assetsToDelete.map(asset =>
        fetch(`/api/asset-tracker/assets?id=${asset.id}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(deletePromises);
      const dataResults = await Promise.all(results.map(res => res.json()));

      // Count successes and failures
      const successCount = dataResults.filter(data => data.success).length;
      const failCount = dataResults.length - successCount;

      // Remove successfully deleted assets from state
      const deletedIds = assetsToDelete
        .filter((asset, index) => dataResults[index]?.success)
        .map(asset => asset.id);
      
      setAssets(prev => prev.filter(ast => !deletedIds.includes(ast.id)));

      // Show appropriate toast message
      if (successCount > 0 && failCount === 0) {
        toast.success(`Successfully deleted ${successCount} asset${successCount !== 1 ? 's' : ''}`);
      } else if (successCount > 0 && failCount > 0) {
        toast.success(`Deleted ${successCount} asset${successCount !== 1 ? 's' : ''}, ${failCount} failed`);
      } else {
        toast.error(`Failed to delete ${failCount} asset${failCount !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error bulk deleting assets:', error);
      toast.error('Failed to delete assets');
    }
  };

  const handleAssignAsset = async (assetId, employeeName) => {
    try {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) {
        toast.error('Asset not found');
        return;
      }

      let employeeDepartment = null;
      
      // If assigning to an employee, fetch their department from users database
      if (employeeName) {
        try {
          // Get selected company to filter employees
          const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
          
          // Build API URL with company filter if available
          let userApiUrl = `${API_BASE_URL}/admin-users`;
          if (selectedCompany) {
            userApiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
          }
          
          const userRes = await fetch(userApiUrl);
          const userData = await userRes.json();
          if (userData.success && userData.users) {
            const employee = userData.users.find(u => u.name === employeeName && u.active !== false);
            if (employee) {
              employeeDepartment = employee.department || null;
              console.log(`[Assign Asset] Employee: ${employeeName}, Department: ${employeeDepartment}`);
            } else {
              console.warn(`[Assign Asset] Employee not found: ${employeeName}`);
            }
          }
        } catch (err) {
          console.error('Error fetching employee department:', err);
          toast.error('Failed to fetch employee department. Assignment will continue without department.');
        }
      }

      const updateData = {
        id: assetId,
        assignedTo: employeeName || null,
        status: employeeName ? 'assigned' : 'available',
        department: employeeName ? employeeDepartment : null, // Always use employee's department, or null if not found
        companyId,
        company: selectedCompany || '', // ensure history is attributable to a company name
      };

      const res = await fetch('/api/asset-tracker/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh assets from database to ensure consistency
        await loadAssets();
        toast.success(employeeName ? `Asset assigned to ${employeeName}` : 'Asset unassigned successfully');
      } else {
        toast.error(data.error || 'Failed to assign asset');
      }
    } catch (error) {
      console.error('Error assigning asset:', error);
      toast.error('Failed to assign asset');
    }
  };

  const handleSubmitAsset = async (formData) => {
    try {
      // Get selected company from sessionStorage to store with asset
      const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      
      if (selectedAsset) {
        // Update status based on assignedTo
        const updateData = {
          id: selectedAsset.id,
          ...formData,
          status: formData.assignedTo ? 'assigned' : (formData.status || 'available'),
          companyId,
          company: selectedCompany || '', // Store company name
        };

        // Update existing asset
        const res = await fetch('/api/asset-tracker/assets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        const data = await res.json();
        if (data.success) {
          // Refresh assets from database to ensure consistency
          await loadAssets();
          toast.success('Asset updated successfully');
        } else {
          toast.error(data.error || 'Failed to update asset');
          return;
        }
      } else {
        // Add new asset
        const newAsset = {
          id: Date.now().toString(),
          ...formData,
          companyId,
          company: selectedCompany || '', // Store company name from sessionStorage
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('[AssetTracker] Adding new asset with company:', selectedCompany);
        const res = await fetch('/api/asset-tracker/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAsset),
        });
        const data = await res.json();
        if (data.success) {
          setAssets(prev => [...prev, { ...newAsset, _id: data.data._id }]);
          toast.success('Asset added successfully');
        } else {
          toast.error(data.error || 'Failed to add asset');
          return;
        }
      }
      
      setShowAddAsset(false);
      setShowEditAsset(false);
      setSelectedAsset(null);
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
    }
  };

  const handleExportAssets = () => {
    try {
      // Use filtered assets if available, otherwise use all assets
      const assetsToExport = filteredAssets.length > 0 ? filteredAssets : assets;
      
      if (assetsToExport.length === 0) {
        toast.error('No assets to export');
        return;
      }

      const headers = [
        'Asset Tag ID',
        'Model',
        'Category',
        'Sub Category',
        'Location',
        'Site',
        'Assigned To',
        'Department',
        'Status',
        'Brand',
        'Serial Number',
        'Purchase Date',
        'Purchase Price',
      ];
      const csvRows = [headers.join(',')];

      assetsToExport.forEach((asset) => {
        const row = [
          asset.assetTag || '',
          asset.model || '',
          asset.category || '',
          asset.subcategory || '',
          asset.location || '',
          asset.site || '',
          asset.assignedTo || 'Unassigned',
          asset.department || '',
          asset.status || '',
          asset.brand || '',
          asset.serialNumber || '',
          asset.purchaseDate || '',
          asset.purchasePrice || '',
        ];
        csvRows.push(row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      const filterInfo = filteredAssets.length < assets.length 
        ? `-filtered-${filteredAssets.length}-of-${assets.length}` 
        : '';
      link.setAttribute('download', `asset-report-${new Date().toISOString().split('T')[0]}${filterInfo}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${assetsToExport.length} asset${assetsToExport.length !== 1 ? 's' : ''}${filteredAssets.length < assets.length ? ' (filtered)' : ''}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('/api/asset-tracker/template', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to download template');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asset-upload-template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel template downloaded');
    } catch (e) {
      toast.error(e?.message || 'Failed to download template');
    }
  };

  const openUpload = () => {
    setUploadResult(null);
    setShowUploadModal(true);
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('companyId', companyId);

      const res = await fetch('/api/asset-tracker/bulk-upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Upload failed');
      }

      if (Array.isArray(data.created) && data.created.length) {
        // Assets are already saved to MongoDB by the bulk-upload route
        // Just refresh the list from DB
        const res = await fetch(`/api/asset-tracker/assets?companyId=${companyId}`);
        const loadData = await res.json();
        if (loadData.success && Array.isArray(loadData.data)) {
          const formattedAssets = loadData.data.map(asset => ({
            ...asset,
            id: asset.id || asset._id?.toString() || Date.now().toString(),
          }));
          setAssets(formattedAssets);
        }
      }

      setUploadResult(data);
      toast.success(`Uploaded: ${data.createdCount} • Errors: ${data.errorCount}`);
    } catch (e) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-3">
            {/* Header */}
            <div>
              <h2 className="text-neutral-900 text-xl font-bold mb-1">Dashboard</h2>
              <p className="text-neutral-600 text-xs mb-3">
                Welcome back! Here's what's happening with your assets today.
              </p>
            </div>

            {/* Top Section - Key Metrics */}
            <MetricCards
              {...metrics}
              loading={loading}
              onMetricClick={(metricKey) => {
                switch (metricKey) {
                  case 'total':
                    setInitialStatusFilter('');
                    break;
                  case 'assigned':
                    setInitialStatusFilter('assigned');
                    break;
                  case 'available':
                    setInitialStatusFilter('available');
                    break;
                  case 'maintenance':
                    setInitialStatusFilter('maintenance');
                    break;
                  default:
                    setInitialStatusFilter('');
                }
                setActiveTab('asset-list');
              }}
            />

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Left - Asset Status Overview */}
              <Card title="Asset Status Overview" className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  <StatusOverviewCard
                    status="Assigned"
                    count={metrics.assigned}
                    color="blue"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => {
                      setInitialStatusFilter('assigned');
                      setActiveTab('asset-list');
                    }}
                  />
                  <StatusOverviewCard
                    status="Available"
                    count={metrics.available}
                    color="green"
                    icon={<FileTextIcon className="w-4 h-4" />}
                    onClick={() => {
                      setInitialStatusFilter('available');
                      setActiveTab('asset-list');
                    }}
                  />
                  <StatusOverviewCard
                    status="Maintenance"
                    count={metrics.underMaintenance}
                    color="orange"
                    icon={<Wrench className="w-4 h-4" />}
                    onClick={() => {
                      setInitialStatusFilter('maintenance');
                      setActiveTab('asset-list');
                    }}
                  />
                  <StatusOverviewCard
                    status="Broken"
                    count={metrics.broken}
                    color="red"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => {
                      setInitialStatusFilter('broken');
                      setActiveTab('asset-list');
                    }}
                  />
                </div>
              </Card>

              {/* Right - Asset Categories */}
              <AssetCategoryCountTable staticData={metrics.categories} />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Left - Asset History */}
              <AssetHistoryFeed companyId={companyId} company={selectedCompany} />

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
                <h1 className="text-xl font-bold text-neutral-900 mb-1">
                  {selectedCompany ? `${formatCompanyName(selectedCompany)} Assets` : 'Asset Management'}
                </h1>
                <p className="text-xs text-neutral-600">
                  {selectedCompany 
                    ? `Track and manage all ${formatCompanyName(selectedCompany)} assets`
                    : 'Track and manage all your company assets'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleExportAssets}
                  icon={<FileText className="w-4 h-4" />}
                  className="bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
                >
                  Export Report
                </Button>
                <Button
                  onClick={openUpload}
                  icon={<Upload className="w-4 h-4" />}
                  className="bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
                >
                  Upload Excel
                </Button>
                <Button
                  onClick={handleAddAsset}
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  + Add New Asset
                </Button>
              </div>
            </div>

            {/* Asset Table */}
            <AssetTable
              assets={assets}
              employees={employees}
              initialStatusFilter={initialStatusFilter}
              onView={handleViewAsset}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              onBulkDelete={handleBulkDeleteAssets}
              onAdd={handleAddAsset}
              onAssign={handleAssignAsset}
              onUnassign={(assetId) => handleAssignAsset(assetId, '')}
              onExport={handleExportAssets}
              onFilteredAssetsChange={handleFilteredAssetsChange}
            />
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen space-y-3">
      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors
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

      {/* Tab Content */}
      {renderTabContent()}


      {/* Company Selection Modal */}
      {showCompanySelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - prevent closing on click */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          
          {/* Modal */}
          <div className="relative rounded-2xl shadow-2xl w-full max-w-md bg-white border border-neutral-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white">
              <h2 className="text-xl font-semibold">Select Company</h2>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Please select a company to access the Asset Tracker Portal
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleCompanySelect('Ecosoul Home')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Ecosoul Home
                </Button>
                <Button
                  onClick={() => handleCompanySelect('Thrive')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Thrive
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          companyId={companyId}
          asset={selectedAsset}
          onSubmit={handleSubmitAsset}
          onCancel={() => setShowEditAsset(false)}
        />
      </Modal>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Assets (Excel)"
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Upload a single <strong>.xlsx</strong> file to add multiple assets at once. If you don't have the file yet, download the template first.
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleUploadFile(e.target.files?.[0])}
          />

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePickFile}
              disabled={uploading}
              loading={uploading}
              icon={<Upload className="w-4 h-4" />}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Choose file & Upload
            </Button>
            <Button
              onClick={handleDownloadTemplate}
              disabled={uploading}
              icon={<Download className="w-4 h-4" />}
              className="bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
            >
              Download Template
            </Button>
          </div>

          {uploadResult && (
            <div className="space-y-2">
              <div className="text-sm text-neutral-800">
                <strong>Uploaded:</strong> {uploadResult.createdCount} • <strong>Errors:</strong> {uploadResult.errorCount}
              </div>

              {Array.isArray(uploadResult.rowErrors) && uploadResult.rowErrors.length > 0 && (
                <div className="max-h-56 overflow-auto rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <div className="font-semibold mb-2">Rows with issues</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {uploadResult.rowErrors.slice(0, 50).map((re) => (
                      <li key={`${re.rowNumber}-${re.assetTag}`}>
                        Row {re.rowNumber}: {re.errors?.join(', ')}
                      </li>
                    ))}
                  </ul>
                  {uploadResult.rowErrors.length > 50 && (
                    <div className="mt-2 text-xs text-rose-800">
                      Showing first 50 errors. Fix and re-upload the file.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setShowUploadModal(false)} className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssetTrackerDashboard;
