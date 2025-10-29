'use client';

import { forwardRef } from 'react';
import Silk from '@/components/common/SilkBackground';
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
    default: 'bg-white border border-neutral-100 shadow-sm hover:shadow-lg',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
  };
  const cardClasses = `${base} ${variants[variant] || variants.default} ${className}`.trim();
  return (
      <div
        ref={ref}
        className={`${cardClasses} ${variant === 'glass' ? 'relative overflow-hidden' : ''}`}
        {...props}
      >
      {variant === 'glass' && (
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <Silk speed={3} scale={1} color="#7B7481" noiseIntensity={1.2} rotation={0.2} />
        </div>
      )}
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4 text-white">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-white mb-1">
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
