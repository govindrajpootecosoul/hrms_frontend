'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';

const TABS = [
  { id: 'checkout', label: 'Checked out' },
  { id: 'checkin', label: 'Checked in' },
  { id: 'maintenance', label: 'Under Repair' },
];

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

export default function AssetHistoryFeed({ companyId, company }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('checkout');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (companyId) params.set('companyId', companyId);
        if (company) params.set('company', company);
        params.set('type', activeTab);
        params.set('limit', '500'); // Fetch more to filter client-side
        // Don't use latestOnly - we'll filter client-side to show latest per asset

        const res = await fetch(`/api/asset-tracker/history?${params.toString()}`);
        const data = await res.json();
        if (!cancelled && data?.success && data.data) {
          // Group by assetId/assetTag and keep only the latest entry per asset
          const assetMap = new Map();
          const allItems = data.data || [];
          
          // Sort by createdAt descending (newest first)
          const sortedItems = [...allItems].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          
          // Keep only the latest entry per asset
          for (const item of sortedItems) {
            const assetKey = item.assetId || item.assetTag || '';
            if (assetKey && !assetMap.has(assetKey)) {
              assetMap.set(assetKey, item);
            }
          }
          
          // Convert back to array and sort by date (newest first)
          const uniqueItems = Array.from(assetMap.values()).sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          
          setItems(uniqueItems);
        } else if (!cancelled) {
          setItems([]);
        }
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [activeTab, companyId, company]);

  const columns = useMemo(() => {
    if (activeTab === 'checkout') {
      return ['ASSET TAG ID', 'DESCRIPTION', 'DATE', 'ACTION', 'ASSIGNED FROM', 'ASSIGNED TO'];
    }
    if (activeTab === 'checkin') {
      return ['ASSET TAG ID', 'DESCRIPTION', 'DATE', 'ACTION', 'CHECK-IN FROM'];
    }
    return ['ASSET TAG ID', 'DESCRIPTION', 'DATE', 'STATUS'];
  }, [activeTab]);

  return (
    <Card title="Feeds" className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`text-xs font-medium pb-1 border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

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
                  No history found
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const assetTag = it.assetTag || it.assetId || '—';
                const description = it.description || '—';
                const date = formatDateTime(it.createdAt);
                const action = it.action || it.type || '—';

                if (activeTab === 'checkout') {
                  const handleAssetClick = () => {
                    const idToUse = it.assetId || it.assetTag;
                    if (idToUse && companyId) {
                      router.push(`/asset-tracker/${companyId}/assets/${idToUse}`);
                    }
                  };
                  return (
                    <tr key={it._id || `${it.assetId}-${it.createdAt}`} className="border-b border-neutral-100">
                      <td className="py-2 text-xs">
                        <button
                          onClick={handleAssetClick}
                          className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
                        >
                          {assetTag}
                        </button>
                      </td>
                      <td className="py-2 text-xs text-neutral-800">{description}</td>
                      <td className="py-2 text-xs text-neutral-700">{date}</td>
                      <td className="py-2 text-xs text-neutral-700 capitalize">{action}</td>
                      <td className="py-2 text-xs text-neutral-700">{it.assignedFrom || '—'}</td>
                      <td className="py-2 text-xs text-neutral-700">{it.assignedTo || '—'}</td>
                    </tr>
                  );
                }

                if (activeTab === 'checkin') {
                  const handleAssetClick = () => {
                    const idToUse = it.assetId || it.assetTag;
                    if (idToUse && companyId) {
                      router.push(`/asset-tracker/${companyId}/assets/${idToUse}`);
                    }
                  };
                  return (
                    <tr key={it._id || `${it.assetId}-${it.createdAt}`} className="border-b border-neutral-100">
                      <td className="py-2 text-xs">
                        <button
                          onClick={handleAssetClick}
                          className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
                        >
                          {assetTag}
                        </button>
                      </td>
                      <td className="py-2 text-xs text-neutral-800">{description}</td>
                      <td className="py-2 text-xs text-neutral-700">{date}</td>
                      <td className="py-2 text-xs text-neutral-700 capitalize">{action}</td>
                      <td className="py-2 text-xs text-neutral-700">{it.assignedFrom || it.assignedTo || '—'}</td>
                    </tr>
                  );
                }

                const handleAssetClick = () => {
                  const idToUse = it.assetId || it.assetTag;
                  if (idToUse && companyId) {
                    router.push(`/asset-tracker/${companyId}/assets/${idToUse}`);
                  }
                };
                return (
                  <tr key={it._id || `${it.assetId}-${it.createdAt}`} className="border-b border-neutral-100">
                    <td className="py-2 text-xs">
                      <button
                        onClick={handleAssetClick}
                        className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
                      >
                        {assetTag}
                      </button>
                    </td>
                    <td className="py-2 text-xs text-neutral-800">{description}</td>
                    <td className="py-2 text-xs text-neutral-700">{date}</td>
                    <td className="py-2 text-xs text-neutral-700">{it.status || it.type || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}


