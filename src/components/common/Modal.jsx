'use client';

import { forwardRef } from 'react';
import { X } from 'lucide-react';
import { MODAL_SIZES } from '@/lib/utils/constants';

const Modal = forwardRef(({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md" />
      
      {/* Modal */}
      <div
        ref={ref}
        className={`relative rounded-2xl shadow-2xl w-full ${MODAL_SIZES[size]} max-h-[90vh] flex flex-col animate-scale-in bg-white border border-neutral-200 text-neutral-900 ${className}`}
        {...props}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white flex-shrink-0">
            {title && (
              <h2 className="text-xl font-semibold">
                {title}
              </h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-white flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
