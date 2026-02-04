'use client';

import { LucideIcon } from 'lucide-react';

const KPICard = ({
  title,
  value,
  active,
  inactive,
  gradient,
  shadow,
  titleColor = 'text-white/90',
  textColor = 'text-white',
  activeColor = 'text-white/90',
  inactiveColor = 'text-white/70',
  icon: Icon,
  clickable = false,
  onClick,
  className = '',
}) => {
  const cardContent = (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} shadow-xl ${shadow || ''} ${clickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-300' : ''} ${className}`}
      onClick={clickable && onClick ? onClick : undefined}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className={`text-[11px] font-semibold uppercase tracking-wide ${titleColor} mb-1`}>
              {title}
            </p>
            <p className={`text-2xl lg:text-3xl font-bold ${textColor}`}>
              {value}
            </p>
            {active !== undefined && inactive !== undefined && (
              <div className="flex items-center gap-4 mt-2">
                <span className={`text-xs ${activeColor}`}>
                  Active: {active}
                </span>
                <span className={`text-xs ${inactiveColor}`}>
                  Inactive: {inactive}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return cardContent;
};

export default KPICard;

