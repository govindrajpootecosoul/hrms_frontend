'use client';

import Card from '@/components/common/Card';

const StatusOverviewCard = ({ status, count, color, icon }) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      text: 'text-blue-700',
    },
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-500',
      text: 'text-emerald-700',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-500',
      text: 'text-orange-700',
    },
    red: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      iconBg: 'bg-rose-500',
      text: 'text-rose-700',
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`rounded-lg ${styles.bg} border ${styles.border} p-4 flex items-center gap-3`}>
      <div className={`h-10 w-10 ${styles.iconBg} text-white rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`text-2xl font-bold ${styles.text}`}>{count}</div>
        <div className="text-sm text-neutral-600">{status}</div>
      </div>
    </div>
  );
};

export default StatusOverviewCard;

