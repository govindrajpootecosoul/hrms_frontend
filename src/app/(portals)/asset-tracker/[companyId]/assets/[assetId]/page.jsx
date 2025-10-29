'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react';
import AssetDetailView from '@/components/asset-tracker/AssetDetailView';

// Pull assets from the list page mock to keep things consistent
import { mockEmployees } from '@/lib/utils/hrmsMockData';

const mockAssets = [
  {
    id: '1', assetTag: 'COM123456', category: 'Computer', subcategory: 'Laptop', status: 'assigned',
    brand: 'Dell', model: 'Latitude 5520', serialNumber: 'DL123456789', location: 'Office Building 1', site: 'Floor 2',
    assignedTo: 'John Doe', ram: '16GB DDR4', processor: 'Intel i7-10700K', storage: '512GB SSD',
    warrantyStart: '2023-01-15', warrantyEnd: '2026-01-15', purchaseDate: '2023-01-15', purchasePrice: '1200.00',
    notes: 'High-performance laptop for development work'
  },
  {
    id: '2', assetTag: 'EXT789012', category: 'External Device', subcategory: 'Monitor', status: 'available',
    brand: 'Samsung', model: '27" 4K Monitor', serialNumber: 'SM789012345', location: 'Office Building 1', site: 'Floor 1',
    assignedTo: null, warrantyStart: '2023-03-01', warrantyEnd: '2026-03-01', purchaseDate: '2023-03-01', purchasePrice: '450.00',
    notes: '4K monitor for design work'
  }
];

const AssetDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { companyId, assetId } = params;

  const asset = useMemo(() => mockAssets.find(a => a.id === String(assetId)), [assetId]);

  const handleBack = () => router.push(`/asset-tracker/${companyId}/assets`);

  return (
    <div className="min-h-screen bg-black text-white space-y-6">
      <PageHeader
        title={asset ? asset.assetTag : 'Asset'}
        description={asset ? `${asset.brand} ${asset.model}` : 'Asset details'}
        breadcrumbs={[{ label: 'Assets', href: `/asset-tracker/${companyId}/assets` }]}
        leadingAction={
          <Button
            variant="ghost"
            size="sm"
            aria-label="Back"
            className="!p-2 rounded-lg border border-white/10 hover:bg-white/10"
            onClick={handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          />
        }
      />

      <div className="mt-2">
        {asset && <AssetDetailView asset={asset} />}
      </div>
    </div>
  );
};

export default AssetDetailsPage;


