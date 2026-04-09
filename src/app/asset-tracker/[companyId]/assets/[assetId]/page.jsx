'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react';
import AssetDetailView from '@/components/asset-tracker/AssetDetailView';
import { API_BASE_URL } from '@/lib/utils/constants';

const AssetDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { companyId, assetId } = params;
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        // Get company name from sessionStorage for better filtering
        const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
        
        // Use the new direct asset endpoint
        let url = `${API_BASE_URL}/asset-tracker/assets/${encodeURIComponent(assetId)}?companyId=${companyId}`;
        if (selectedCompany) {
          url += `&company=${encodeURIComponent(selectedCompany)}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data?.success && data.data) {
          setAsset(data.data);
        } else {
          // Fallback: try fetching all assets and searching
          let fallbackUrl = `${API_BASE_URL}/asset-tracker/assets?companyId=${companyId}`;
          if (selectedCompany) {
            fallbackUrl += `&company=${encodeURIComponent(selectedCompany)}`;
          }
          const fallbackRes = await fetch(fallbackUrl);
          const fallbackData = await fallbackRes.json();
          if (fallbackData?.success && fallbackData.data) {
            const found = fallbackData.data.find(a => {
              const idMatch = a.id === String(assetId) || a._id?.toString() === String(assetId);
              const tagMatch = a.assetTag && a.assetTag.toLowerCase() === String(assetId).toLowerCase();
              return idMatch || tagMatch;
            });
            if (found) {
              setAsset(found);
            } else {
              setAsset(null);
            }
          } else {
            setAsset(null);
          }
        }
      } catch (e) {
        console.error('Error fetching asset:', e);
        setAsset(null);
      } finally {
        setLoading(false);
      }
    };
    if (assetId && companyId) fetchAsset();
  }, [assetId, companyId]);

  const handleBack = () => router.push(`/asset-tracker/${companyId}/dashboard`);

  return (
    <div className="min-h-screen space-y-6">
      <PageHeader
        title={asset ? (asset.assetTag || asset.id || 'Asset') : 'Asset'}
        description={asset ? [asset.brand, asset.model].filter(Boolean).join(' ') || asset.processor || asset.assetTag || 'Asset details' : 'Asset details'}
        breadcrumbs={[{ label: 'Dashboard', href: `/asset-tracker/${companyId}/dashboard` }]}
        leadingAction={
          <Button
            size="sm"
            aria-label="Back"
            className="!p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100"
            onClick={handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          />
        }
      />

      <div className="mt-2">
        {loading ? (
          <div className="py-8 text-center text-neutral-500">Loading asset...</div>
        ) : asset ? (
          <AssetDetailView asset={asset} />
        ) : (
          <div className="py-8 text-center text-neutral-500">Asset not found</div>
        )}
      </div>
    </div>
  );
};

export default AssetDetailsPage;


