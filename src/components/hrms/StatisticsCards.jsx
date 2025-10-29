'use client';

import { Users, Clock, UserCheck, UserX } from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const StatisticsCards = ({ 
  totalEmployees = 0, 
  presentToday = 0, 
  absentToday = 0, 
  onLeave = 0,
  loading = false 
}) => {
  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: <Users className="w-6 h-6" />,
      color: '#FF2B00',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600'
    },
    {
      title: 'Present Today',
      value: presentToday,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'success',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-600'
    },
    {
      title: 'Absent Today',
      value: absentToday,
      icon: <UserX className="w-6 h-6" />,
      color: 'danger',
      bgColor: 'bg-danger-100',
      textColor: 'text-danger-600'
    },
    {
      title: 'On Leave',
      value: onLeave,
      icon: <Clock className="w-6 h-6" />,
      color: 'warning',
      bgColor: 'bg-accent-100',
      textColor: 'text-accent-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
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
        const themeColor = resolveColor(stat.color);
        return (
          <Card key={index} variant="glass" className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg`}
                style={{ backgroundColor: `${themeColor}20`, border: `1px solid ${themeColor}40` }}
              >
                <span style={{ color: themeColor }}>
                  {stat.icon}
                </span>
              </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/70 mb-2">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-white">
                {stat.value.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Optional trend indicator */}
          {stat.title === 'Present Today' && totalEmployees > 0 && (
            <div className="mt-3">
              <Badge 
                variant={presentToday / totalEmployees >= 0.8 ? 'success' : 'warning'}
                size="sm"
              >
                {Math.round((presentToday / totalEmployees) * 100)}% attendance
              </Badge>
            </div>
          )}
          </Card>
        );
      })}
    </div>
  );
};

export default StatisticsCards;
