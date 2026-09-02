import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const LiveFeedItem = ({ transaction }) => {
  if (!transaction) return null;

  const { id, amount, isFraud, time, fraudProbability } = transaction;

  // Formatting timestamp roughly
  const dateObj = new Date(time);
  const timeString = isNaN(dateObj) ? 'Just now' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={`p-4 border-b border-[var(--ng-border)] flex items-center gap-4 transition-colors hover:bg-[var(--ng-hover-bg)] ${isFraud ? 'bg-[var(--ng-red)]/5' : ''}`}>
      <div className="shrink-0 flex items-center justify-center">
        {isFraud ? (
          <AlertCircle size={20} className="text-red-500" />
        ) : (
          <CheckCircle size={20} className="text-emerald-500/50" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold truncate text-[var(--ng-text)] opacity-90">
            {id}
          </span>
          <span className="text-sm font-medium text-[var(--ng-text)] opacity-80 whitespace-nowrap">
            ${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--ng-muted)]">{timeString}</span>
          {isFraud && fraudProbability && (
            <span className="text-xs font-semibold text-[var(--ng-red)] bg-[var(--ng-red)]/10 px-2 py-0.5 rounded">
              {(fraudProbability * 100).toFixed(1)}% Risk
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveFeedItem;
