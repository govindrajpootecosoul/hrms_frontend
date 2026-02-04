'use client';

import Card from '@/components/common/Card';

const StatusOverviewCard = ({ status, count, color, icon, onClick }) => {
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
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg ${styles.bg} border ${styles.border} p-2 flex items-center gap-2 ${
        onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : 'cursor-default'
      }`}
      aria-label={onClick ? `View ${status} assets` : undefined}
      disabled={!onClick}
    >
      <div className={`h-6 w-6 ${styles.iconBg} text-white rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`text-base font-bold ${styles.text}`}>{count}</div>
        <div className="text-xs text-neutral-600">{status}</div>
      </div>
    </button>
  );
};

export default StatusOverviewCard;

