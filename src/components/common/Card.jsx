'use client';

import { forwardRef } from 'react';
import { X } from 'lucide-react';

const Card = forwardRef(({ 
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  ...props
}, ref) => {
  // Check if className already has padding, if not use default p-3
  const hasPadding = className.includes('p-');
  const basePadding = hasPadding ? '' : 'p-3';
  const base = `rounded-lg transition-all duration-300 ${basePadding} bg-white border border-neutral-200 shadow-sm hover:shadow-md`;
  const cardClasses = `${base} ${className}`.trim();
  return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
      {/* Removed Silk background overlay for light theme */}
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {title && (
              <h3 className="text-sm font-semibold mb-0.5">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-600">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="ml-3">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className="relative space-y-2">
        {children}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
