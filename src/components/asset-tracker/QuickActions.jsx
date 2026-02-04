'use client';

import { Plus, RefreshCw, Download, Settings } from 'lucide-react';
import Card from '@/components/common/Card';

const QuickActions = ({ onAddAsset, onAudit, onExport, onSettings }) => {
  const actions = [
    {
      label: 'Add New Asset',
      icon: Plus,
      color: 'border-blue-500 text-blue-600 hover:bg-blue-50',
      onClick: onAddAsset,
    },
    {
      label: 'Audit Assets',
      icon: RefreshCw,
      color: 'border-emerald-500 text-emerald-600 hover:bg-emerald-50',
      onClick: onAudit,
    },
    {
      label: 'Export Report',
      icon: Download,
      color: 'border-violet-500 text-violet-600 hover:bg-violet-50',
      onClick: onExport,
    },
    {
      label: 'Manage Settings',
      icon: Settings,
      color: 'border-orange-500 text-orange-600 hover:bg-orange-50',
      onClick: onSettings,
    },
  ];

  return (
    <Card title="Quick Actions" className="p-3">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-1 p-2 border-2 border-dashed rounded-lg transition-colors ${action.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;

