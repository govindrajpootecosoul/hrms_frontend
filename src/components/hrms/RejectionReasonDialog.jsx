'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Textarea from '@/components/common/Textarea';

export default function RejectionReasonDialog({
  open,
  title = 'Reject Request',
  description = 'Please provide a reason for rejection.',
  confirmText = 'Reject',
  cancelText = 'Cancel',
  loading = false,
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  const reasonTrimmed = useMemo(() => reason.trim(), [reason]);
  const showError = touched && !reasonTrimmed;

  const handleConfirm = () => {
    setTouched(true);
    if (!reasonTrimmed) return;
    onConfirm?.(reasonTrimmed);
  };

  return (
    <Modal
      isOpen={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 w-full justify-end">
          {cancelText && (
            <Button
              onClick={onCancel}
              disabled={loading}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={loading || !reasonTrimmed}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? 'Rejecting...' : confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-700">{description}</p>
        <div className="space-y-1">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
            rows={4}
            className={showError ? 'border-red-500 focus:ring-red-200' : ''}
            disabled={loading}
          />
          {showError && <p className="text-xs text-red-600">Rejection reason is required.</p>}
        </div>
      </div>
    </Modal>
  );
}


