import React from 'react';
import { Download, Filter } from 'lucide-react';

const selectBase =
  'bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--ng-muted)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors appearance-none cursor-pointer';

const TableToolbar = ({ filter, onFilterChange, limit, onLimitChange, onExport }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      {/* Filter select */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-[var(--ng-muted)]" />
        <select
          id="filter-select"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className={selectBase}
        >
          <option value="all">All Transactions</option>
          <option value="fraud">Fraud Only</option>
          <option value="legitimate">Legitimate Only</option>
        </select>
      </div>

      {/* Rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--ng-muted)] font-medium">Rows</span>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className={selectBase}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CSV Export */}
      <button
        id="csv-export-btn"
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ng-surface)] border border-[var(--ng-border)] text-[var(--ng-muted)] hover:bg-[var(--ng-hover-bg)] hover:text-[var(--ng-text)] transition-colors text-sm font-medium"
      >
        <Download size={14} />
        <span>Export CSV</span>
      </button>
    </div>
  );
};

export default TableToolbar;
