'use client';

import { forwardRef } from 'react';

const Skeleton = forwardRef(({
  className = '',
  width,
  height,
  ...props
}, ref) => {
  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div
      ref={ref}
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Predefined skeleton components
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="1rem"
        className={`${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${className}`}>
    <div className="space-y-4">
      <Skeleton height="1.5rem" width="60%" />
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton height="2rem" width="5rem" />
        <Skeleton height="2rem" width="5rem" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 p-4">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1rem" width="25%" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-b border-gray-100 last:border-b-0">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="1rem" width="25%" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
