'use client';

import { forwardRef } from 'react';

const Badge = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full text-sm font-medium shadow-sm text-black';

  const variantClassesMap = {
    default: 'bg-blue-100 text-blue-700',
    // Talent & people updates
    newHire: 'bg-[#ffe4d6]',
    leaveApproved: 'bg-[#ffe0e3]',
    promotion: 'bg-[#ffe9d6]',
    departmentChange: 'bg-[#ffe4d6]',
    interview: 'bg-[#fff5d6]',
    training: 'bg-[#e5f5dd]',
    meeting: 'bg-[#ddf4ed]',
    workshop: 'bg-[#e0f4ee]',
    festival: 'bg-[#dde3ec]',
    leave: 'bg-[#d8e9f4]',
    anniversary: 'bg-[#f5d7e4] ',
  };

  const variantClasses = variantClassesMap[variant] || variantClassesMap.default;

  const sizeClasses = {
    sm: 'px-3 py-1 text-[10px]',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
