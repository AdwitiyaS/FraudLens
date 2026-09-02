import React from 'react';
import EmptyState from './EmptyState';

/**
 * Column definition shape:
 *   { key: string, label: string, render?: (value, row) => ReactNode, className?: string }
 */
const DataTable = ({ 
  columns = [], 
  rows = [], 
  loading = false, 
  error = null, 
  emptyMessage = 'No records found',
  onRetry = null
}) => {
  if (loading && rows.length === 0) {
    return (
      <div className="glass-panel border-white/5 overflow-hidden">
        <EmptyState loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel border-white/5 overflow-hidden">
        <EmptyState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="glass-panel border-white/5 overflow-hidden">
        <EmptyState message={emptyMessage} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="ng-card" style={{ padding: 0, position: 'relative' }}>
      {/* Subtle loading overlay when refetching with existing data */}
      {loading && rows.length > 0 && (
        <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
          <span style={{ display: 'flex', height: 12, width: 12, position: 'relative' }}>
            <span style={{ animation: 'ng-pulse 2s infinite', position: 'absolute', height: '100%', width: '100%', borderRadius: '50%', background: 'var(--ng-accent)', opacity: 0.75 }} />
            <span style={{ position: 'relative', borderRadius: '50%', height: 12, width: 12, background: 'var(--ng-accent)' }} />
          </span>
        </div>
      )}

      {/* A11y: Wrapping table in a focusable region with horizontal scroll support */}
      <div 
        style={{ overflowX: 'auto' }}
        tabIndex="0"
        role="region"
        aria-label="Data Table"
      >
        <table className="ng-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.className || ''}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={row.id || rowIdx}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className || ''}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
