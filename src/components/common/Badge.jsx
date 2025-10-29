'use client';

import { forwardRef } from 'react';

const Badge = forwardRef(({
  children,
  variant = 'info',
  size = 'md',
  className = '',
  ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-sm';
  
  const variantClasses = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
