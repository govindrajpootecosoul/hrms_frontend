'use client';

import { isValidElement } from 'react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const StatisticsCards = ({ 
  cards = [],
  loading = false,
  valueFormatter,
  compact = false
}) => {
  const safeCards = Array.isArray(cards) ? cards : [];

  const formatValue = (value, card) => {
    if (typeof valueFormatter === 'function') {
      return valueFormatter(value, card);
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value ?? '--';
  };

  const resolveColor = (color) => {
    if (!color) return '#ffffff';
    if (typeof color === 'string' && color.startsWith('#')) return color;
    const map = {
      primary: '#3b82f6',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
      secondary: '#8b5cf6',
      accent: '#22d3ee',
    };
    return map[color] || '#ffffff';
  };

  const skeletonCount = safeCards.length || 4;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Card key={index} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-200 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (safeCards.length === 0) {
    return (
      <Card className="p-8 text-center text-neutral-500">
        No statistics available.
      </Card>
    );
  }

  let gridClasses = ['grid', 'gap-4'];
  if (compact) {
    // Compact layout: responsive full-width row for metric-style cards
    gridClasses.push(
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4',
      'xl:grid-cols-5'
    );
  } else {
    gridClasses.push('grid-cols-1');
    if (safeCards.length > 1) gridClasses.push('md:grid-cols-2');
    if (safeCards.length > 2) gridClasses.push('lg:grid-cols-3');
    if (safeCards.length > 3) gridClasses.push('xl:grid-cols-4');
  }

  return (
    <div className={gridClasses.join(' ')}>
      {safeCards.map((stat, index) => {
        const themeColor = resolveColor(stat.color);
        const rawBadge = typeof stat.badge === 'function' ? stat.badge(stat) : stat.badge;

        const renderBadge = () => {
          if (!rawBadge) return null;

          if (isValidElement(rawBadge)) {
            return rawBadge;
          }

          if (typeof rawBadge === 'string' || typeof rawBadge === 'number') {
            return (
              <Badge size="sm">
                {rawBadge}
              </Badge>
            );
          }

          if (typeof rawBadge === 'object' && rawBadge !== null) {
            const { size = 'sm', text, value } = rawBadge;
            const content = text ?? formatValue(value ?? stat.value, stat);
            return (
              <Badge size={size}>
                {content}
              </Badge>
            );
          }

          return rawBadge;
        };

        const hasBackground = Boolean(stat.backgroundColor);

        return (
          <Card
            key={stat.key ?? index}
            className={`transition-all duration-300 ${
              hasBackground
                ? 'shadow-lg hover:shadow-xl ring-1 ring-black/5'
                : 'hover:shadow-lg'
            } ${compact ? 'px-6 py-4' : 'p-6'}`}
            style={hasBackground ? { background: stat.backgroundColor } : undefined}
          >
            <div className="flex items-center">
              {stat.icon && (
                <div
                  className={`rounded-xl flex items-center justify-center mr-4 shadow-lg ${
                    compact ? 'w-12 h-12' : 'w-14 h-14'
                  }`}
                  style={{ backgroundColor: `${themeColor}20`, border: `1px solid ${themeColor}40` }}
                >
                  <span style={{ color: themeColor }}>
                    {stat.icon}
                  </span>
                </div>
              )}
              <div className="flex-1">
                {stat.title && (
                  <p className={`font-medium text-white mb-2 ${compact ? 'text-sm' : 'text-sm'}`}>
                    {stat.title}
                  </p>
                )}
                <p className={`font-bold text-white ${compact ? 'text-3xl' : 'text-3xl'}`}>
                  {formatValue(stat.value, stat)}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-neutral-500 mt-1 hidden">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>

            {(rawBadge || stat.footer) && (
              <div className="mt-3 hidden">
                {renderBadge() || stat.footer}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default StatisticsCards;
