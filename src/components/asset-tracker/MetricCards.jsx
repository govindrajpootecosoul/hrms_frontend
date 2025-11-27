'use client';

import { Package, UserCheck, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const MetricCards = ({ 
  totalAssets = 0, 
  assigned = 0, 
  available = 0, 
  underMaintenance = 0,
  broken = 0,
  loading = false 
}) => {
  const metrics = [
    {
      title: 'Total Assets',
      value: totalAssets,
      icon: <Package className="w-6 h-6" />,
      color: 'primary',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600'
    },
    {
      title: 'Assigned',
      value: assigned,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'success',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-600'
    },
    {
      title: 'Available',
      value: available,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'info',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600'
    },
    {
      title: 'Under Maintenance',
      value: underMaintenance,
      icon: <Wrench className="w-6 h-6" />,
      color: 'warning',
      bgColor: 'bg-accent-100',
      textColor: 'text-accent-600'
    },
    {
      title: 'Broken',
      value: broken,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'danger',
      bgColor: 'bg-danger-100',
      textColor: 'text-danger-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric, index) => {
        const resolveColor = (c) => {
          if (!c) return '#ffffff';
          if (typeof c === 'string' && c.startsWith('#')) return c;
          const map = {
            primary: '#3b82f6',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#0ea5e9',
            secondary: '#8b5cf6',
            accent: '#22d3ee'
          };
          return map[c] || '#ffffff';
        };
        const themeColor = resolveColor(metric.color);
        return (
        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg`}
              style={{ backgroundColor: `${themeColor}20`, border: `1px solid ${themeColor}40` }}
            >
              <span style={{ color: themeColor }}>
                {metric.icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600 mb-2">
                {metric.title}
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {metric.value.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Optional percentage indicator */}
          {metric.title === 'Assigned' && totalAssets > 0 && (
            <div className="mt-3">
              <Badge 
                size="sm"
              >
                {Math.round((assigned / totalAssets) * 100)}% assigned
              </Badge>
            </div>
          )}
          
          {metric.title === 'Available' && totalAssets > 0 && (
            <div className="mt-3">
              <Badge 
                size="sm"
              >
                {Math.round((available / totalAssets) * 100)}% available
              </Badge>
            </div>
          )}
        </Card>
        );
      })}
    </div>
  );
};

export default MetricCards;
