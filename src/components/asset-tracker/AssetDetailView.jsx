'use client';

import { useState, useEffect } from 'react';
import { Package, User, MapPin, Calendar, Printer, Edit, MoreVertical, Image as ImageIcon, FileText, Shield, Link2, Wrench, Bookmark, Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

const AssetDetailView = ({ asset }) => {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [modalHistory, setModalHistory] = useState([]);
  const [loadingModalHistory, setLoadingModalHistory] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      // Try parsing as YYYY-MM-DD
      const [y, m, d] = String(iso).split('-');
      return d && m && y ? `${d}/${m}/${y}` : '';
    }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    const hh12 = String(d.getHours() % 12 || 12).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh12}:${min} ${ampm}`;
  };

  const fetchModalHistory = async () => {
    if (!asset) return;

    try {
      setLoadingModalHistory(true);
      const params = new URLSearchParams();
      
      // Get company from sessionStorage
      const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      if (selectedCompany) params.set('company', selectedCompany);
      
      const assetId = asset.id || asset._id?.toString();
      if (assetId) params.set('assetId', assetId);
      if (asset.assetTag) params.set('assetTag', asset.assetTag);
      
      params.set('limit', '200');

      const url = `/api/asset-tracker/history?${params.toString()}`;
      console.log('[AssetDetailView] Fetching modal history:', url);

      const res = await fetch(url);
      const data = await res.json();

      if (data?.success && data.data) {
        // Sort by createdAt descending (newest first)
        const sortedHistory = [...data.data].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setModalHistory(sortedHistory);
      } else {
        setModalHistory([]);
      }
    } catch (e) {
      console.error('[AssetDetailView] Error fetching modal history:', e);
      setModalHistory([]);
    } finally {
      setLoadingModalHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && asset) {
      const fetchHistory = async () => {
        try {
          setLoadingHistory(true);
          const params = new URLSearchParams();
          const assetId = asset.id || asset._id?.toString();
          if (assetId) {
            params.set('assetId', assetId);
          }
          if (asset.assetTag) {
            params.set('assetTag', asset.assetTag);
          }
          params.set('limit', '200');
          const res = await fetch(`/api/asset-tracker/history?${params.toString()}`);
          const data = await res.json();
          if (data?.success) {
            setHistory(data.data || []);
          } else {
            setHistory([]);
          }
        } catch (e) {
          console.error('Error fetching history:', e);
          setHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, asset]);

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'assigned' || statusLower === 'checked out') {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Checked out</Badge>;
    }
    if (statusLower === 'available') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Available</Badge>;
    }
    if (statusLower === 'maintenance') {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Maintenance</Badge>;
    }
    if (statusLower === 'broken') {
      return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Broken</Badge>;
    }
    return <Badge>{status || 'Unknown'}</Badge>;
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'events', label: 'Events' },
    { id: 'photos', label: 'Photos' },
    { id: 'docs', label: 'Docs.' },
    { id: 'warranty', label: 'Warranty' },
    { id: 'linking', label: 'Linking' },
    { id: 'maint', label: 'Maint.' },
    { id: 'reserve', label: 'Reserve' },
    { id: 'audit', label: 'Audit' },
    { id: 'history', label: 'History' },
  ];

  const renderHistory = () => {
    if (loadingHistory) {
      return (
        <Card>
          <div className="py-8 text-center text-neutral-500">Loading history...</div>
        </Card>
      );
    }

    if (history.length === 0) {
      return (
        <Card>
          <div className="py-8 text-center text-neutral-500">No history found</div>
        </Card>
      );
    }

    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">Date</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">Event</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">Field</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">Changed from</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">Changed to</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider py-3 px-4">Action by</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => {
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

                const event = getHistoryEventLabel(h.type);
                const { field, changedFrom, changedTo } = parseHistoryEntry(h);
                const actionBy = h.actionBy || h.assignedTo || h.assignedFrom || '—';

                return (
                  <tr key={h._id || idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-xs text-neutral-700">{formatDateTime(h.createdAt)}</td>
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
      </Card>
    );
  };

  if (!asset) {
    return <div className="py-8 text-center text-neutral-500">Asset not found</div>;
  }

  // Debug: Log asset data to console
  useEffect(() => {
    console.log('[AssetDetailView] Full asset object:', asset);
    console.log('[AssetDetailView] Asset Tag:', asset?.assetTag);
    console.log('[AssetDetailView] Assigned To:', asset?.assignedTo);
    console.log('[AssetDetailView] Department:', asset?.department);
    console.log('[AssetDetailView] Status:', asset?.status);
    console.log('[AssetDetailView] Model:', asset?.model);
    console.log('[AssetDetailView] Category:', asset?.category);
    console.log('[AssetDetailView] All keys:', Object.keys(asset || {}));
  }, [asset]);

  // Main asset title (processor/model description) - prioritize processor, then model, then description
  const getAssetTitle = () => {
    if (asset.processor) return asset.processor;
    if (asset.model) return asset.model;
    if (asset.description) return asset.description;
    const brandModel = [asset.brand, asset.model].filter(Boolean).join(' ');
    if (brandModel) return brandModel;
    return asset.assetTag || 'Asset';
  };
  const assetTitle = getAssetTitle();

  return (
    <div className="space-y-6">
      {/* Top Section - Asset Header with Image */}
      <Card className="p-6">
        <div className="flex gap-6">
          {/* Left - Asset Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center">
              {asset.image ? (
                <img src={asset.image} alt={asset.assetTag} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Package className="w-12 h-12 text-neutral-400" />
              )}
            </div>
          </div>

          {/* Middle - Asset Info */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Asset Tag ID</p>
                <p className="text-sm font-medium text-neutral-900">{asset.assetTag || ''}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Purchase Date</p>
                <p className="text-sm text-neutral-700">{formatDate(asset.purchaseDate) || ''}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Cost</p>
                <p className="text-sm text-neutral-700">{asset.purchasePrice ? `₹${asset.purchasePrice}` : ''}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Site</p>
                <p className="text-sm text-neutral-700">{asset.site || ''}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Location</p>
                <p className="text-sm text-neutral-700">{asset.location || ''}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Category</p>
                <p className="text-sm text-neutral-700">{asset.category || ''}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Sub Category</p>
                <p className="text-sm text-neutral-700">{asset.subcategory || ''}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Department</p>
                <p className="text-sm text-neutral-700">{asset.department || ''}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Assigned to</p>
                <p className="text-sm text-neutral-700">{asset.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Status</p>
                <div>{getStatusBadge(asset.status)}</div>
              </div>
            </div>
          </div>

          {/* Right - Action Buttons */}
          <div className="flex-shrink-0 flex flex-col gap-2">
            <Button
              icon={<Printer className="w-4 h-4" />}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Print
            </Button>
            <Button
              icon={<Edit className="w-4 h-4" />}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Edit Asset
            </Button>
            <Button
              icon={<MoreVertical className="w-4 h-4" />}
              className="bg-primary-600 text-white hover:bg-primary-700"
            >
              More Actions
            </Button>
          </div>
        </div>

        {/* Asset Title */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">{assetTitle}</h2>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <Card className="p-6">
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Asset Tag ID</label>
                  <p className="text-sm text-neutral-900 mt-1 font-mono">{asset.assetTag || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Category</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.category || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Sub Category</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.subcategory || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Site</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.site || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Location</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.location || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Department</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.department || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Assigned To</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Status</label>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Brand</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.brand || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Model</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.model || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Serial Number</label>
                  <p className="text-sm text-neutral-900 mt-1 font-mono">{asset.serialNumber || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Description</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.description || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Processor</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.processor || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Processor Generation</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.processorGeneration || '—'}</p>
                </div>
                {asset.ram1Size && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 uppercase">RAM 1 Size</label>
                      <p className="text-sm text-neutral-900 mt-1">{asset.ram1Size || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 uppercase">RAM 2 Size</label>
                      <p className="text-sm text-neutral-900 mt-1">{asset.ram2Size || '—'}</p>
                    </div>
                  </>
                )}
                {!asset.ram1Size && asset.ram && (
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase">Total RAM</label>
                    <p className="text-sm text-neutral-900 mt-1">{asset.ram || '—'}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Storage</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.storage || '—'}</p>
                </div>
              </div>
            </div>

            {/* Warranty Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Warranty Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Purchase Date</label>
                  <p className="text-sm text-neutral-900 mt-1">{formatDate(asset.purchaseDate) || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Purchase Price</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.purchasePrice ? `₹${asset.purchasePrice}` : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Start</label>
                  <p className="text-sm text-neutral-900 mt-1">{formatDate(asset.warrantyStart) || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Months</label>
                  <p className="text-sm text-neutral-900 mt-1">{asset.warrantyMonths ? `${asset.warrantyMonths} months` : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Warranty Expire</label>
                  <p className="text-sm text-neutral-900 mt-1">{formatDate(asset.warrantyExpire || asset.warrantyEnd) || '—'}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Notes
              </h3>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{asset.notes || '—'}</p>
              </div>
            </div>

            {/* View History Button */}
            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button
                onClick={async () => {
                  setShowHistoryModal(true);
                  await fetchModalHistory();
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                View History
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'history' && renderHistory()}

      {/* Other tabs - placeholder */}
      {activeTab !== 'details' && activeTab !== 'history' && (
        <Card>
          <div className="py-8 text-center text-neutral-500">
            {tabs.find(t => t.id === activeTab)?.label} tab coming soon
          </div>
        </Card>
      )}

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setModalHistory([]);
        }}
        title={`History: ${asset?.assetTag || ''}`}
        size="xl"
      >
        {loadingModalHistory ? (
          <div className="py-8 text-center text-sm text-neutral-500">Loading history...</div>
        ) : modalHistory.length === 0 ? (
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
                {modalHistory.map((h, idx) => {
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

                  const event = getHistoryEventLabel(h.type);
                  const { field, changedFrom, changedTo } = parseHistoryEntry(h);
                  const actionBy = h.actionBy || h.assignedTo || h.assignedFrom || '—';

                  return (
                    <tr key={h._id || idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-xs text-neutral-700">
                        {formatDateTime(h.createdAt)}
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

export default AssetDetailView;
