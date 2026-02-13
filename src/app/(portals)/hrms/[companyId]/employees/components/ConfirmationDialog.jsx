'use client';

import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning', // 'warning', 'danger', 'success', 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-blue-600 text-white hover:bg-blue-700',
  loading = false
}) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'info':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'warning':
      default:
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 w-full justify-end">
          {cancelText && (
            <Button
              onClick={onClose}
              disabled={loading}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={confirmButtonClass || getConfirmButtonClass()}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-slate-700 whitespace-pre-line">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

