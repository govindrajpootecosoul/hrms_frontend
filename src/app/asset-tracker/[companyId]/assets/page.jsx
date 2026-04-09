'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Upload, FileText, Download } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import AssetTable from '@/components/asset-tracker/AssetTable';
import AssetForm from '@/components/asset-tracker/AssetForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { API_BASE_URL } from '@/lib/utils/constants';
import { getCompanyFromEmail } from '@/lib/config/database.config';

const AssetsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showEditAsset, setShowEditAsset] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [filteredAssets, setFilteredAssets] = useState([]);

  // Optional: allow deep-linking to filtered views from dashboard cards (e.g. ?status=assigned)
  const initialStatusFilter = (searchParams?.get('status') || '').toLowerCase();
  
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

  // Load assets from MongoDB
  const loadAssets = async () => {
    try {
      setLoading(true);
      
      // Get selected company from state or sessionStorage (don't modify state here to avoid re-renders)
      let company = selectedCompany || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
      
      // Auto-detect company from user email if not available
      if (!company && user?.email) {
        const detectedCompany = getCompanyFromEmail(user.email);
        if (detectedCompany) {
          company = detectedCompany;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedCompany', company);
          }
          // Update state but don't trigger another loadAssets call
          if (!selectedCompany) {
            setSelectedCompany(company);
          }
          console.log(`[AssetsPage] Auto-detected company from email: ${company}`);
        }
      }
      
      // Company is REQUIRED - if still not available, don't clear assets, just return
      if (!company) {
        console.warn('[AssetsPage] Company name is required but not available - skipping load');
        setLoading(false);
        return; // Don't clear assets, just don't load new ones
      }
      
      console.log(`[AssetsPage] Fetching assets for companyId: ${companyId}, Company: ${company}`);
      
      // Build API URL - company parameter is REQUIRED
      const apiUrl = `/api/asset-tracker/assets?companyId=${companyId}&company=${encodeURIComponent(company)}`;
      
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log(`[AssetsPage] API Response:`, { success: data.success, count: data.count, dataLength: data.data?.length, company: company });
      
      if (data.success && Array.isArray(data.data)) {
        // Convert MongoDB _id to id for frontend compatibility
        const formattedAssets = data.data.map(asset => ({
          ...asset,
          id: asset.id || asset._id?.toString() || Date.now().toString(),
        }));
        
        console.log(`[AssetsPage] Loaded ${formattedAssets.length} assets from database${selectedCompany ? ` (filtered by company: ${selectedCompany})` : ''}`);
        setAssets(formattedAssets);
      } else {
        console.warn('[AssetsPage] No assets data received or invalid format:', data);
        setAssets([]);
        if (data.error) {
          toast.error(data.error || 'Failed to load assets');
        }
      }
    } catch (error) {
      console.error('[AssetsPage] Error loading assets:', error);
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
      
      // Auto-detect from user's email if available
      if (!company && user?.email) {
        const detectedCompany = getCompanyFromEmail(user.email);
        if (detectedCompany) {
          company = detectedCompany;
          sessionStorage.setItem('selectedCompany', company);
          console.log(`[AssetsPage] Auto-detected and set company from email: ${company}`);
        }
      }
      
      // Only update state if it's different to avoid unnecessary re-renders
      if (company !== selectedCompany) {
        setSelectedCompany(company);
      }
    }
  }, [user, selectedCompany]);

  // Load assets on mount and when companyId or selectedCompany changes
  // Only load if selectedCompany is available
  useEffect(() => {
    if (selectedCompany) {
      loadAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, selectedCompany]);

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
      // Get company name for the DELETE request
      const company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      if (!company) {
        toast.error('Company information is required to delete asset');
        return;
      }
      
      const res = await fetch(`/api/asset-tracker/assets?id=${asset.id}&company=${encodeURIComponent(company)}`, {
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
      // Get company name for the DELETE requests
      const company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      if (!company) {
        toast.error('Company information is required to delete assets');
        return;
      }
      
      // Delete all assets in parallel without any confirmations
      const deletePromises = assetsToDelete.map(asset =>
        fetch(`/api/asset-tracker/assets?id=${asset.id}&company=${encodeURIComponent(company)}`, {
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
          const userRes = await fetch(`${API_BASE_URL}/admin-users`);
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

      // Get company name for the update request
      const company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      if (!company) {
        toast.error('Company information is required to assign asset');
        return;
      }
      
      const updateData = {
        id: assetId,
        assignedTo: employeeName || null,
        status: employeeName ? 'assigned' : 'available',
        department: employeeName ? employeeDepartment : null, // Always use employee's department, or null if not found
        companyId,
        company: company, // Include company name
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
        
        // Trigger refresh event for feed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('asset-assigned'));
        }
        
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
        // Update status - use formData.status if provided, otherwise keep existing logic
        let finalStatus = formData.status;
        if (!finalStatus || !finalStatus.trim()) {
          // If status is empty, determine based on assignedTo
          finalStatus = formData.assignedTo ? 'assigned' : 'available';
        }
        
        const updateData = {
          id: selectedAsset.id,
          ...formData,
          status: finalStatus,
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
        // Add new asset - default status to 'available' if not provided
        const newAsset = {
          id: Date.now().toString(),
          ...formData,
          status: formData.status && formData.status.trim() ? formData.status : 'available',
          companyId,
          company: selectedCompany || '', // Store company name from sessionStorage
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('[AssetsPage] Adding new asset with company:', selectedCompany);
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

  const handleExportReport = async () => {
    try {
      // Use filtered assets if available, otherwise use all assets
      const assetsToExport = filteredAssets.length > 0 ? filteredAssets : assets;
      
      if (assetsToExport.length === 0) {
        toast.error('No assets to export');
        return;
      }

      // Convert filtered assets to CSV format
      const headers = ['Asset Tag ID', 'Model', 'Category', 'Sub Category', 'Status', 'Location', 'Site', 'Assigned To', 'Department', 'Brand', 'Serial Number', 'Purchase Date', 'Purchase Price'];
      const csvRows = [headers.join(',')];
      
      assetsToExport.forEach(asset => {
        const row = [
          asset.assetTag || '',
          asset.model || '',
          asset.category || '',
          asset.subcategory || '',
          asset.status || '',
          asset.location || '',
          asset.site || '',
          asset.assignedTo || 'Unassigned',
          asset.department || '',
          asset.brand || '',
          asset.serialNumber || '',
          asset.purchaseDate || '',
          asset.purchasePrice || '',
        ];
        csvRows.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
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
      // Get company name for the upload request - auto-detect if not in sessionStorage
      let company = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      
      // Auto-detect company from user email if not in sessionStorage
      if (!company && user?.email) {
        const detectedCompany = getCompanyFromEmail(user.email);
        if (detectedCompany) {
          company = detectedCompany;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('selectedCompany', company);
          }
          setSelectedCompany(company);
          console.log(`[AssetsPage] Auto-detected company from email for upload: ${company}`);
        }
      }
      
      if (!company) {
        toast.error('Company information is required to upload assets. Please ensure your email is configured correctly.');
        setUploading(false);
        return;
      }
      
      console.log(`[AssetsPage] Uploading assets for company: ${company}, companyId: ${companyId}`);
      
      const fd = new FormData();
      fd.append('file', file);
      fd.append('companyId', companyId);
      fd.append('company', company);

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
        // Reload assets using the existing loadAssets function to ensure consistency
        await loadAssets();
        console.log(`[AssetsPage] Reloaded assets after bulk upload: ${data.createdCount} assets uploaded`);
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

  return (
    <div className="min-h-screen space-y-4" style={{ zoom: '0.85' }}>
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
        onExport={handleExportReport}
        onUpload={openUpload}
        onFilteredAssetsChange={handleFilteredAssetsChange}
      />

      {/* Modals */}
      <Modal
        isOpen={showAddAsset}
        onClose={() => setShowAddAsset(false)}
        title="Add New Asset"
        size="xl"
      >
        <AssetForm
          companyId={companyId}
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

export default AssetsPage;
