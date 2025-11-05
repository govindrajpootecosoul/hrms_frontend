'use client';

import { Package, User, MapPin, Calendar } from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const AssetDetailView = ({ asset }) => {

  const formatDate = (iso) => {
    if (!iso) return 'Not provided';
    const [y, m, d] = String(iso).split('-');
    return d && m && y ? `${d}/${m}/${y}` : String(iso);
  };

  const SummaryCard = ({ icon, title, children, trailing }) => (
    <Card variant="glass" className="h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            <span className="text-neutral-800">{icon}</span>
          </div>
          <h4 className="text-neutral-900 font-medium">{title}</h4>
        </div>
        {trailing}
      </div>
      <div className="mt-4 text-neutral-800 space-y-1">
        {children}
      </div>
    </Card>
  );

  const renderAll = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard icon={<Package className="w-5 h-5" />} title={asset.assetTag}>
          <p className="text-neutral-600">{asset.brand} {asset.model}</p>
        </SummaryCard>
        <SummaryCard icon={<User className="w-5 h-5" />} title="Assignment">
          <p className="text-sm text-neutral-600">Assigned To</p>
          <p>{asset.assignedTo || 'Unassigned'}</p>
          <div className="mt-2"><Badge variant={asset.status === 'assigned' ? 'success' : asset.status === 'maintenance' ? 'warning' : 'default'}>{asset.status}</Badge></div>
        </SummaryCard>
        <SummaryCard icon={<Calendar className="w-5 h-5" />} title="Warranty">
          <p className="text-sm text-neutral-600">Start</p>
          <p>{formatDate(asset.warrantyStart)}</p>
          <p className="text-sm text-neutral-600 mt-2">End</p>
          <p>{formatDate(asset.warrantyEnd)}</p>
        </SummaryCard>
        <SummaryCard icon={<MapPin className="w-5 h-5" />} title="Location">
          <p className="text-sm text-neutral-600">Location</p>
          <p>{asset.location}</p>
          <p className="text-sm text-neutral-600 mt-2">Site</p>
          <p>{asset.site}</p>
        </SummaryCard>
      </div>

      <Card variant="glass">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-neutral-600">Brand</p>
              <p className="text-neutral-900">{asset.brand}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Model</p>
              <p className="text-neutral-900">{asset.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Serial Number</p>
              <p className="text-neutral-900 font-mono">{asset.serialNumber}</p>
            </div>
            {asset.ram && (
              <div>
                <p className="text-sm font-medium text-neutral-600">RAM</p>
                <p className="text-neutral-900">{asset.ram}</p>
              </div>
            )}
            {asset.processor && (
              <div>
                <p className="text-sm font-medium text-neutral-600">Processor</p>
                <p className="text-neutral-900">{asset.processor}</p>
              </div>
            )}
            {asset.storage && (
              <div>
                <p className="text-sm font-medium text-neutral-600">Storage</p>
                <p className="text-neutral-900">{asset.storage}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-neutral-600">Purchase Date</p>
              <p className="text-neutral-900">{formatDate(asset.purchaseDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Purchase Price</p>
              <p className="text-neutral-900">{asset.purchasePrice ? `₹${asset.purchasePrice}` : '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Warranty</p>
              <p className="text-neutral-900">{formatDate(asset.warrantyStart)} → {formatDate(asset.warrantyEnd)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Location</p>
              <p className="text-neutral-900">{asset.location} — {asset.site}</p>
            </div>
            {asset.notes && (
              <div>
                <p className="text-sm font-medium text-neutral-600">Notes</p>
                <p className="text-neutral-800">{asset.notes}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderAll()}
    </div>
  );
};

export default AssetDetailView;


