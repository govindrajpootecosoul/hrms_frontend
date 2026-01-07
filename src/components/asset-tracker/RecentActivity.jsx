'use client';

import { CheckCircle2, Wrench, Search } from 'lucide-react';
import Card from '@/components/common/Card';

const activityIcons = {
  checkout: { icon: CheckCircle2, color: 'bg-blue-500' },
  checkin: { icon: CheckCircle2, color: 'bg-emerald-500' },
  maintenance: { icon: Wrench, color: 'bg-orange-500' },
  audit: { icon: Search, color: 'bg-violet-500' },
};

const RecentActivity = ({ activities = [] }) => {
  return (
    <Card title="Recent Activity">
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const activityType = activity.type?.toLowerCase() || 'checkout';
          const iconConfig = activityIcons[activityType] || activityIcons.checkout;
          const Icon = iconConfig.icon;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`h-8 w-8 ${iconConfig.color} text-white rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-900 font-medium">{activity.assetId}</span>
                  <span className="text-neutral-500">-</span>
                  <span className="text-neutral-600 capitalize">{activity.action}</span>
                </div>
                <div className="text-sm text-neutral-500 mt-0.5">
                  {activity.user} • {activity.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;

