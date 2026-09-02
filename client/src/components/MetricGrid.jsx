import React from 'react';
import { Target, TrendingUp, AlertCircle, Activity } from 'lucide-react';

const MetricGrid = ({ stats }) => {
  const metrics = [
    {
      label: 'Fraud Detection Rate',
      value: `${(stats.fraudRate || 0).toFixed(2)}%`,
      icon: <Target size={18} />,
      color: 'text-[var(--ng-red)]',
      bgColor: 'bg-[var(--ng-red)]/10'
    },
    {
      label: 'Total Analyzed',
      value: (stats.total || 0).toLocaleString(),
      icon: <Activity size={18} />,
      color: 'text-[var(--ng-accent)]',
      bgColor: 'bg-[var(--ng-accent)]/10'
    },
    {
      label: 'Anomalies Confirmed',
      value: (stats.fraudCount || 0).toLocaleString(),
      icon: <AlertCircle size={18} />,
      color: 'text-[var(--ng-amber)]',
      bgColor: 'bg-[var(--ng-amber)]/10'
    },
    {
      label: 'Legitimate Baseline',
      value: (stats.legitCount || 0).toLocaleString(),
      icon: <TrendingUp size={18} />,
      color: 'text-[var(--ng-green)]',
      bgColor: 'bg-[var(--ng-green)]/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="glass-panel p-5 flex items-center gap-4 border-[var(--ng-border)] group hover:border-[var(--ng-accent)]/50 transition-colors">
          <div className={`p-3 rounded-xl ${m.bgColor} ${m.color} transition-transform group-hover:scale-110`}>
            {m.icon}
          </div>
          <div>
            <div className="text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-widest mb-0.5">{m.label}</div>
            <div className="text-lg font-black text-[var(--ng-text)]">{m.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricGrid;
