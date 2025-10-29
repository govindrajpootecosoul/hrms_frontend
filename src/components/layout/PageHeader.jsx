'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/common/Button';

const PageHeader = ({ 
  title, 
  description, 
  actions, 
  breadcrumb, 
  showBackButton = false,
  backHref,
  leadingAction, // optional element rendered before the title on the left
  className = '' 
}) => {
  const onlyLeadingAction = !title && !description && !actions && !breadcrumb && !showBackButton;

  if (onlyLeadingAction) {
    return (
      <div className={className}>
        <div className="py-2">
          {leadingAction && (
            <div className="-ml-1">
              {leadingAction}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 shadow-sm ${className}`}>
      {/* Back button */}
      {breadcrumb && (
        <div className="mb-2 text-sm text-white/70">{breadcrumb}</div>
      )}
      {showBackButton && (
        <div className="mb-4">
          <Link href={backHref || '#'}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
        </div>
      )}

      {/* Header content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {leadingAction && (
              <div className="-ml-1">
                {leadingAction}
              </div>
            )}
            {title && (
              <h1 className="text-3xl font-bold text-white">
                {title}
              </h1>
            )}
          </div>
          {description && (
            <p className="text-white/80 text-lg mt-3">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {Array.isArray(actions) ? actions.map((action, index) => (
                <div key={index}>{action}</div>
              )) : actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
