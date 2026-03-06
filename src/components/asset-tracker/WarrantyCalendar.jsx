'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';

const WarrantyCalendar = ({ assets = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [showAssetDetailsModal, setShowAssetDetailsModal] = useState(false);

  // Get assets with warranty expiration dates
  const assetsWithWarranty = useMemo(() => {
    return assets.filter(asset => asset.warrantyExpire).map(asset => ({
      ...asset,
      warrantyDate: new Date(asset.warrantyExpire),
    }));
  }, [assets]);

  // Group assets by warranty expiration date
  const warrantyByDate = useMemo(() => {
    const grouped = {};
    assetsWithWarranty.forEach(asset => {
      const dateKey = format(asset.warrantyDate, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(asset);
    });
    return grouped;
  }, [assetsWithWarranty]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Check if date has warranty expiring
  const getWarrantyAssetsForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return warrantyByDate[dateKey] || [];
  };

  // Check if warranty is expiring soon (within 30 days)
  const isExpiringSoon = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    thirtyDaysLater.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= today && checkDate <= thirtyDaysLater;
  };

  // Check if warranty is expired
  const isExpired = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-25 to-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm shadow-slate-400/30">
              <h3 className="text-sm font-semibold tracking-tight">Warranty</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm">
                <h2 className="text-slate-900 text-base font-semibold min-w-[140px] text-center tracking-tight">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
              </div>
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 shadow-sm shadow-amber-100/80">
              Warranty Expiring
            </div>
            <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-500 shadow-sm">
              month
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs text-slate-500 font-semibold py-2 tracking-wide uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const warrantyAssets = getWarrantyAssetsForDate(day);
              const hasWarranty = warrantyAssets.length > 0;
              const expiringSoon = hasWarranty && isExpiringSoon(day);
              const expired = hasWarranty && isExpired(day);

              return (
                <div
                  key={idx}
                  className={`min-h-[80px] p-1 rounded-xl border ${
                    isCurrentMonth ? 'bg-slate-50 border-slate-200' : 'bg-slate-25 border-slate-100'
                  } ${
                    isToday
                      ? 'ring-2 ring-sky-400/70 shadow-[0_0_0_1px_rgba(56,189,248,0.40)]'
                      : ''
                  }`}
                >
                  <div className={`text-xs mb-1 font-medium ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {warrantyAssets.slice(0, 2).map((asset, assetIdx) => (
                      <button
                        key={assetIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                          setShowAssetDetailsModal(true);
                        }}
                        className={`w-full px-1.5 py-0.5 rounded text-[10px] font-medium truncate text-left hover:opacity-80 transition-opacity cursor-pointer ${
                          expired
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : expiringSoon
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                        title={`${asset.assetTag} - ${asset.model || asset.brand || 'N/A'}`}
                      >
                        {asset.assetTag}
                      </button>
                    ))}
                    {warrantyAssets.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day);
                          setShowAssetsModal(true);
                        }}
                        className="w-full px-1.5 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-left"
                      >
                        +{warrantyAssets.length - 2} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Show All Assets for Selected Date */}
      <Modal
        isOpen={showAssetsModal}
        onClose={() => {
          setShowAssetsModal(false);
          setSelectedDate(null);
        }}
        title={`Warranty Expiring: ${selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : ''}`}
        size="md"
      >
        {selectedDate && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getWarrantyAssetsForDate(selectedDate).map((asset) => {
              const expiringSoon = isExpiringSoon(selectedDate);
              const expired = isExpired(selectedDate);
              
              return (
                <button
                  key={asset.id}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setShowAssetsModal(false);
                    setShowAssetDetailsModal(true);
                  }}
                  className={`w-full p-3 rounded-lg border text-left hover:opacity-80 transition-opacity ${
                    expired
                      ? 'bg-red-50 border-red-200'
                      : expiringSoon
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${
                        expired ? 'text-red-700' : expiringSoon ? 'text-orange-700' : 'text-blue-700'
                      }`}>
                        {asset.assetTag}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">
                        {asset.model || asset.brand || 'N/A'}
                        {asset.category && ` • ${asset.category}`}
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${
                      expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {format(selectedDate, 'MMM dd')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Modal: Show Asset Details */}
      <Modal
        isOpen={showAssetDetailsModal}
        onClose={() => {
          setShowAssetDetailsModal(false);
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
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default WarrantyCalendar;

