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
        className={`relative rounded-2xl shadow-2xl w-full ${MODAL_SIZES[size]} max-h-[90vh] overflow-hidden animate-scale-in bg-white/10 backdrop-blur-lg border border-white/20 text-white ${className}`}
        {...props}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            {title && (
              <h2 className="text-xl font-semibold text-white">
                {title}
              </h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
