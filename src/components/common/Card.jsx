'use client';

import { forwardRef } from 'react';
import { X } from 'lucide-react';

const Card = forwardRef(({ 
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  variant = 'default', // default | glass
  ...props
}, ref) => {
  const base = 'rounded-xl transition-all duration-300 p-6';
  const variants = {
    default: 'bg-white border border-neutral-200 shadow-sm hover:shadow-md',
    glass: 'bg-white/80 backdrop-blur-md border border-neutral-300 shadow-sm'
  };
  const cardClasses = `${base} ${variants[variant] || variants.default} ${className}`.trim();
  return (
      <div
        ref={ref}
        className={`${cardClasses} ${variant === 'glass' ? 'relative overflow-hidden' : ''}`}
        {...props}
      >
      {/* Removed Silk background overlay for light theme */}
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="ml-4">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className="relative space-y-4">
        {children}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
