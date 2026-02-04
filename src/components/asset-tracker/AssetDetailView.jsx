'use client';

import { useState, useEffect } from 'react';
import { Package, User, MapPin, Calendar, Printer, Edit, MoreVertical, Image as ImageIcon, FileText, Shield, Link2, Wrench, Bookmark, Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

const AssetDetailView = ({ asset }) => {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
                const event = h.type === 'checkout' ? 'Check out' : 
                             h.type === 'checkin' ? 'Check in' :
                             h.type === 'maintenance' ? 'Maintenance' :
                             h.type === 'broken' ? 'Broken' :
                             h.type === 'created' ? 'Asset created' :
                             h.type === 'updated' ? 'Asset edit' :
                             h.type === 'deleted' ? 'Asset deleted' :
                             h.type === 'warranty' ? 'Warranty' : h.type || '—';
                
                let field = 'Status';
                let changedFrom = '—';
                let changedTo = '—';

                if (h.type === 'checkout' || h.type === 'checkin') {
                  if (h.assignedFrom && h.assignedTo) {
                    field = 'Assignment';
                    changedFrom = h.assignedFrom;
                    changedTo = h.assignedTo;
                  } else {
                    field = 'Status';
                    changedFrom = h.type === 'checkout' ? 'Available' : 'Checked out';
                    changedTo = h.type === 'checkout' ? 'Checked out' : 'Available';
                  }
                  // Check for department change
                  if (h.department) {
                    // This would need to be tracked separately in history
                  }
                } else if (h.type === 'updated') {
                  field = h.action || 'Asset edit';
                } else if (h.type === 'warranty') {
                  field = 'Warranty';
                }

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
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Brand</p>
                <p className="text-neutral-900">{asset.brand || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Model</p>
                <p className="text-neutral-900">{asset.model || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Serial Number</p>
                <p className="text-neutral-900 font-mono">{asset.serialNumber || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Processor</p>
                <p className="text-neutral-900">{asset.processor || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Processor Generation</p>
                <p className="text-neutral-900">{asset.processorGeneration || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">RAM 1 Size</p>
                <p className="text-neutral-900">{asset.ram1Size || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">RAM 2 Size</p>
                <p className="text-neutral-900">{asset.ram2Size || ''}</p>
              </div>
              {!asset.ram1Size && (
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">RAM</p>
                  <p className="text-neutral-900">{asset.ram || ''}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Storage</p>
                <p className="text-neutral-900">{asset.storage || ''}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Purchase Date</p>
                <p className="text-neutral-900">{formatDate(asset.purchaseDate) || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Purchase Price</p>
                <p className="text-neutral-900">{asset.purchasePrice ? `₹${asset.purchasePrice}` : ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Warranty Start</p>
                <p className="text-neutral-900">{formatDate(asset.warrantyStart) || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Warranty (Months)</p>
                <p className="text-neutral-900">{asset.warrantyMonths ? `${asset.warrantyMonths} months` : ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Warranty Expire</p>
                <p className="text-neutral-900">{formatDate(asset.warrantyExpire || asset.warrantyEnd) || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Site</p>
                <p className="text-neutral-900">{asset.site || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Location</p>
                <p className="text-neutral-900">{asset.location || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Category</p>
                <p className="text-neutral-900">{asset.category || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Sub Category</p>
                <p className="text-neutral-900">{asset.subcategory || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Department</p>
                <p className="text-neutral-900">{asset.department || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Assigned To</p>
                <p className="text-neutral-900">{asset.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Status</p>
                <div>{getStatusBadge(asset.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Notes</p>
                <p className="text-neutral-800">{asset.notes || ''}</p>
              </div>
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
    </div>
  );
};

export default AssetDetailView;
