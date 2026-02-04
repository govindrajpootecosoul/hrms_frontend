'use client';

import { BarChart3, Percent, CheckCircle, Wrench, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/common/Card';

const MetricCards = ({ 
  totalAssets = 0, 
  assigned = 0, 
  available = 0, 
  underMaintenance = 0,
  broken = 0,
  loading = false,
  onMetricClick,
}) => {
  const metrics = [
    {
      title: 'Total Assets',
      value: totalAssets,
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'blue',
      key: 'total',
    },
    {
      title: 'Assigned Assets',
      value: assigned,
      icon: <Percent className="w-4 h-4" />,
      color: 'blue',
      key: 'assigned',
    },
    {
      title: 'Available Assets',
      value: available,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green',
      key: 'available',
    },
    {
      title: 'Under Maintenance',
      value: underMaintenance,
      icon: <Wrench className="w-4 h-4" />,
      color: 'orange',
      key: 'maintenance',
    }
  ];

  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-500',
      valueText: 'text-blue-600',
    },
    green: {
      iconBg: 'bg-emerald-500',
      valueText: 'text-emerald-600',
    },
    orange: {
      iconBg: 'bg-orange-500',
      valueText: 'text-orange-600',
    },
    red: {
      iconBg: 'bg-rose-500',
      valueText: 'text-rose-600',
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-3">
            <div className="animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-neutral-200 rounded w-3/4 mb-1"></div>
                  <div className="h-5 bg-neutral-200 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-neutral-200 rounded-lg"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric, index) => {
        const styles = colorStyles[metric.color] || colorStyles.blue;
        const clickable = typeof onMetricClick === 'function';
        return (
          <Card
            key={index}
            className={`p-3 ${clickable ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
            onClick={clickable ? () => onMetricClick(metric.key) : undefined}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs font-medium text-neutral-500 mb-0.5">{metric.title}</div>
                <div className={`text-lg font-bold tracking-tight ${styles.valueText}`}>
                  {metric.value.toLocaleString()}
                </div>
                {metric.trend && metric.trendText && (
                  <div className={`mt-1 flex items-center gap-1 text-xs ${
                    metric.trend === 'up' ? 'text-emerald-600' : metric.trend === 'down' ? 'text-rose-600' : 'text-neutral-500'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    <span>{metric.trendText}</span>
                  </div>
                )}
              </div>
              {metric.icon && (
                <div className={`h-8 w-8 ${styles.iconBg} text-white rounded-lg flex items-center justify-center shadow-sm`}>
                  {metric.icon}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricCards;
