import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, colorClass = "from-cyan-500 to-blue-600", formatting = 'number' }) => {
  // Simple formatter
  const formattedValue = formatting === 'compact' && value && typeof value === 'number'
    ? Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)
    : formatting === 'currency' && value && typeof value === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : formatting === 'percentage' && value && typeof value === 'number'
    ? `${(value * 100).toFixed(1)}%`
    : value;

  return (
    <div className="glass-panel p-6 flex items-start gap-4">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorClass} shrink-0`}>
          <Icon size={24} className="text-[var(--ng-text)]" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-[var(--ng-muted)] text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[var(--ng-text)] leading-none tracking-tight">{formattedValue}</span>
          {trend && (
            <span className={`text-sm font-medium mb-0.5 ${trend.startsWith('-') || trend.includes('down') ? 'text-[var(--ng-red)]' : 'text-[var(--ng-green)]'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
