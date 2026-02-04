'use client';

import Card from '@/components/common/Card';

const Row = ({ label, count, percent, colorClass = 'bg-neutral-400' }) => {
  return (
    <div className="flex items-start justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 ${colorClass} rounded-full`} />
        <span className="text-xs text-neutral-700">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-xs text-neutral-800 font-semibold">{count}</div>
        {typeof percent === 'number' && (
          <div className="text-xs text-neutral-400">{percent}%</div>
        )}
      </div>
    </div>
  );
};

const AssetCategoryCountTable = ({ title = 'Asset Categories', staticData = null }) => {
  // Define color classes for different categories
  const getColorClass = (categoryName) => {
    const colorMap = {
      'Computer Assets': 'bg-blue-500',
      'External Equipments': 'bg-emerald-500',
      'External Equipment': 'bg-emerald-500', // Support both singular and plural
      'Office Supplies': 'bg-violet-500',
      'Furniture': 'bg-orange-500',
    };
    return colorMap[categoryName] || 'bg-neutral-400';
  };

  // Convert data to component format
  const data = staticData
    ? Object.entries(staticData).map(([label, count]) => ({
        label,
        count,
        colorClass: getColorClass(label),
      }))
    : [];

  const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);

  // Calculate percentages
  const dataWithPercentages = data.map((item) => ({
    ...item,
    percent: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0,
  }));

  return (
    <Card title={title} className="p-3">
      <div className="mt-1">
        {dataWithPercentages.map((item) => (
          <Row
            key={item.label}
            label={item.label}
            count={item.count}
            percent={item.percent}
            colorClass={item.colorClass}
          />
        ))}
      </div>

      <div className="my-1.5 h-px bg-neutral-200" />

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-xs text-neutral-600">Total Assets</span>
        <span className="text-xs text-neutral-900 font-semibold">{total}</span>
      </div>
    </Card>
  );
};

export default AssetCategoryCountTable;

