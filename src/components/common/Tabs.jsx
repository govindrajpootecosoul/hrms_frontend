'use client';

import { forwardRef } from 'react';

const Tabs = forwardRef(({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`border-b border-white/10 ${className}`} {...props}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
              ${activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white hover:border-white/20'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              {tab.icon && (
                <span className="w-4 h-4">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;
