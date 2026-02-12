'use client';

import { forwardRef, useEffect } from 'react';
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
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Disable body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Re-enable body scroll when modal closes
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [isOpen]);

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

  const handleBackdropWheel = (e) => {
    // Prevent background scroll when scrolling on backdrop only
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      onWheel={(e) => {
        // Only prevent scroll if clicking directly on backdrop container
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-md"
        onWheel={handleBackdropWheel}
        onTouchMove={handleBackdropWheel}
      />
      
      {/* Modal */}
      <div
        ref={ref}
        className={`relative rounded-2xl shadow-2xl w-full ${MODAL_SIZES[size]} max-h-[95vh] flex flex-col animate-scale-in bg-white border border-neutral-200 text-neutral-900 ${className}`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          // Prevent modal container from scrolling, let content handle it
          e.stopPropagation();
        }}
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
        <div 
          className="flex-1 overflow-y-auto p-6 min-h-0"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent',
            overscrollBehavior: 'contain'
          }}
          onWheel={(e) => {
            // Always stop propagation to prevent backdrop/body scroll
            // The content div itself will handle the scroll
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Prevent touch events from bubbling
            e.stopPropagation();
          }}
          onScroll={(e) => {
            // Prevent scroll events from bubbling
            e.stopPropagation();
          }}
        >
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
