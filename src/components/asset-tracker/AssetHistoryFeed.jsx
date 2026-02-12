'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const ACTIVITY_TYPES = ['checkout', 'checkin', 'maintenance'];

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // dd/mm/yyyy hh:mm
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatDateTimeWithAMPM(iso) {
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
}

function getActivityLabel(type) {
  const labels = {
    checkout: 'Checked out',
    checkin: 'Checked in',
    maintenance: 'Under Repair',
  };
  return labels[type] || type;
}

export default function AssetHistoryFeed({ companyId, company }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAssetDetailsModal, setShowAssetDetailsModal] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Ensure company is available
      const selectedCompany = company || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
      
      if (!selectedCompany) {
        console.warn('[AssetHistoryFeed] No company provided, cannot fetch history');
        setItems([]);
        setLoading(false);
        return;
      }
      
      console.log('[AssetHistoryFeed] Fetching history for company:', selectedCompany, 'companyId:', companyId);
      
      // Fetch all activity types
      const allPromises = ACTIVITY_TYPES.map(async (type) => {
        const params = new URLSearchParams();
        if (companyId) params.set('companyId', companyId);
        params.set('company', selectedCompany);
        params.set('type', type);
        params.set('limit', '100');

        const url = `/api/asset-tracker/history?${params.toString()}`;
        console.log(`[AssetHistoryFeed] Fetching ${type} history:`, url);
        
        const res = await fetch(url);
        const data = await res.json();
        
        console.log(`[AssetHistoryFeed] ${type} history response:`, { success: data?.success, count: data?.data?.length });
        
        if (data?.success && data.data) {
          return (data.data || []).map(item => ({
            ...item,
            activityType: type,
          }));
        }
        return [];
      });

      const allResults = await Promise.all(allPromises);
      const allItems = allResults.flat();
      
      console.log('[AssetHistoryFeed] Total items fetched:', allItems.length);
      
      // Sort by createdAt descending (newest first)
      const sortedItems = [...allItems].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      // Get last 10 assigned activities
      const last10Activities = sortedItems.slice(0, 10);
      
      console.log('[AssetHistoryFeed] Last 10 activities:', last10Activities.length);
      
      setItems(last10Activities);
    } catch (e) {
      console.error('[AssetHistoryFeed] Error fetching history:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      if (cancelled) return;
      await fetchHistory();
    };

    loadHistory();

    // Auto-refresh every 10 seconds
    const intervalId = setInterval(() => {
      if (!cancelled) {
        fetchHistory();
      }
    }, 10000);

    // Refresh when window gains focus
    const handleFocus = () => {
      if (!cancelled) {
        fetchHistory();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, company, refreshKey]);

  // Listen for custom refresh event
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('asset-assigned', handleRefresh);
    window.addEventListener('asset-updated', handleRefresh);

    return () => {
      window.removeEventListener('asset-assigned', handleRefresh);
      window.removeEventListener('asset-updated', handleRefresh);
    };
  }, []);

  const fetchAssetHistory = async (asset) => {
    if (!asset) return;

    try {
      setLoadingHistory(true);
      const params = new URLSearchParams();
      
      const selectedCompany =
        company || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
      if (selectedCompany) params.set('company', selectedCompany);
      if (companyId) params.set('companyId', companyId);
      
      // Try both assetId and assetTag
      const assetId = asset.id || asset._id?.toString();
      const assetTag = asset.assetTag;
      
      if (assetId) params.set('assetId', assetId);
      if (assetTag) params.set('assetTag', assetTag);
      
      params.set('limit', '200'); // Get all history entries

      const url = `/api/asset-tracker/history?${params.toString()}`;
      console.log('[AssetHistoryFeed] Fetching asset history:', url);

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
      console.error('[AssetHistoryFeed] Error fetching asset history:', e);
      setAssetHistory([]);
    } finally {
      setLoadingHistory(false);
    }
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
        // Re-assignment
        field = 'Assignment';
        changedFrom = entry.assignedFrom;
        changedTo = entry.assignedTo;
      } else if (entry.assignedTo) {
        // New assignment
        field = 'Status';
        changedFrom = 'Available';
        changedTo = 'Checked out';
      } else {
        field = 'Status';
        changedFrom = 'Available';
        changedTo = 'Checked out';
      }
      
      // Show department if available
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
      // Parse action to determine field
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
      
      // Try to extract values from description or other fields
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

  const handleAssetClick = async (historyItem) => {
    // Prefer assetTag (stable identifier), then fall back to assetId
    const idToUse = historyItem.assetTag || historyItem.assetId;
    if (!idToUse) return;

    try {
      setLoadingAsset(true);
      setShowAssetDetailsModal(true);

      const params = new URLSearchParams();
      if (companyId) params.set('companyId', companyId);
      const selectedCompany =
        company || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
      if (selectedCompany) params.set('company', selectedCompany);

      const url = `/api/asset-tracker/assets/${encodeURIComponent(idToUse)}?${params.toString()}`;
      console.log('[AssetHistoryFeed] Fetching asset details for modal:', url);

      let res = await fetch(url);
      let data = await res.json();

      if (data?.success && data.data) {
        setSelectedAsset(data.data);
      } else {
        console.warn('[AssetHistoryFeed] Direct asset lookup failed for', idToUse, 'response:', data);

        // Fallback: fetch all assets for the company and try to find by id or tag
        const listParams = new URLSearchParams();
        if (companyId) listParams.set('companyId', companyId);
        const selectedCompanyForList =
          company || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null);
        if (selectedCompanyForList) listParams.set('company', selectedCompanyForList);

        const listUrl = `/api/asset-tracker/assets?${listParams.toString()}`;
        console.log('[AssetHistoryFeed] Fallback fetching asset list:', listUrl);

        res = await fetch(listUrl);
        data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          const lowerId = String(idToUse).toLowerCase();
          const found = data.data.find((a) => {
            const idMatch =
              a.id === String(idToUse) ||
              a._id?.toString() === String(idToUse);
            const tagMatch =
              a.assetTag && a.assetTag.toLowerCase() === lowerId;
            return idMatch || tagMatch;
          });

          if (found) {
            console.log('[AssetHistoryFeed] Fallback found asset for', idToUse);
            setSelectedAsset(found);
          } else {
            console.warn('[AssetHistoryFeed] Fallback could not find asset for', idToUse);
            setSelectedAsset(null);
          }
        } else {
          console.warn('[AssetHistoryFeed] Fallback list fetch failed:', data);
          setSelectedAsset(null);
        }
      }
    } catch (e) {
      console.error('[AssetHistoryFeed] Error fetching asset details:', e);
      setSelectedAsset(null);
    } finally {
      setLoadingAsset(false);
    }
  };

  const columns = ['ASSET TAG ID', 'DESCRIPTION', 'DATE', 'ACTIVITY', 'ASSIGNED FROM', 'ASSIGNED TO'];

  return (
    <>
      <Card title="Last 10 Assigned Activities" className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-200">
                {columns.map((c) => (
                  <th
                    key={c}
                    className="text-left text-[10px] font-semibold tracking-wider text-neutral-500 uppercase py-2"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-center text-xs text-neutral-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-center text-xs text-neutral-500">
                    No activity found
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const assetTag = it.assetTag || it.assetId || '—';
                  const description = it.description || '—';
                  const date = formatDateTime(it.createdAt);
                  const activityType = it.activityType || it.type || 'checkout';
                  const activityLabel = getActivityLabel(activityType);

                  return (
                    <tr key={it._id || `${it.assetId}-${it.createdAt}`} className="border-b border-neutral-100">
                      <td className="py-2 text-xs">
                        <button
                          onClick={() => handleAssetClick(it)}
                          className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
                        >
                          {assetTag}
                        </button>
                      </td>
                      <td className="py-2 text-xs text-neutral-800">{description}</td>
                      <td className="py-2 text-xs text-neutral-700">{date}</td>
                      <td className="py-2 text-xs text-neutral-700">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            activityType === 'checkout'
                              ? 'bg-blue-100 text-blue-700'
                              : activityType === 'checkin'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {activityLabel}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-neutral-700">{it.assignedFrom || '—'}</td>
                      <td className="py-2 text-xs text-neutral-700">{it.assignedTo || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Asset Details Modal */}
      <Modal
        isOpen={showAssetDetailsModal}
        onClose={() => {
          setShowAssetDetailsModal(false);
          setSelectedAsset(null);
        }}
        title={`Asset Details: ${selectedAsset?.assetTag || ''}`}
        size="xl"
      >
        {loadingAsset && (
          <div className="py-6 text-center text-sm text-neutral-500">Loading asset details...</div>
        )}
        {!loadingAsset && !selectedAsset && (
          <div className="py-6 text-center text-sm text-neutral-500">Asset not found</div>
        )}
        {!loadingAsset && selectedAsset && (
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
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.status || '—'}</p>
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
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Storage</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.storage || '—'}</p>
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
                    {selectedAsset.warrantyStart
                      ? new Date(selectedAsset.warrantyStart).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Months</label>
                  <p className="text-sm text-neutral-900 mt-1">{selectedAsset.warrantyMonths || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Expire</label>
                  <p className="text-sm text-neutral-900 mt-1">
                    {selectedAsset.warrantyExpire
                      ? new Date(selectedAsset.warrantyExpire).toLocaleDateString()
                      : '—'}
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
                    {selectedAsset.purchaseDate
                      ? new Date(selectedAsset.purchaseDate).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Purchase Price</label>
                  <p className="text-sm text-neutral-900 mt-1">
                    {selectedAsset.purchasePrice ? `₹${selectedAsset.purchasePrice}` : '—'}
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
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {selectedAsset.notes || '—'}
                </p>
              </div>
            </div>

            {/* View History Button */}
            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button
                onClick={async () => {
                  setShowHistoryModal(true);
                  await fetchAssetHistory(selectedAsset);
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                View History
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Asset History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setAssetHistory([]);
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
                  const actionBy = h.assignedTo || h.assignedFrom || h.actionBy || '—';

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
    </>
  );
}


