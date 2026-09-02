import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchPaginatedTransactions } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import DataTable from '../components/DataTable';
import TableToolbar from '../components/TableToolbar';
import KpiCard from '../components/KpiCard';

// ─── Column definitions ─────────────────────
const COLUMNS = [
  {
    key: 'id',
    label: 'Transaction ID',
    render: (val) => (
      <span className="font-mono text-xs text-[var(--ng-text)] font-semibold truncate max-w-[140px] inline-block" title={val}>
        {val}
      </span>
    ),
  },
  {
    key: 'time',
    label: 'Time',
    render: (val) => {
      const hrs = Math.floor(val / 3600).toString().padStart(2, '0');
      const mins = Math.floor((val % 3600) / 60).toString().padStart(2, '0');
      const secs = Math.floor(val % 60).toString().padStart(2, '0');
      return <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ng-text)', fontWeight: 600 }}>T+{hrs}:{mins}:{secs}</span>;
    },
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--ng-text)' }}>
        ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    key: 'isFraud',
    label: 'Classification',
    render: (val) =>
      val ? (
        <span className="ng-badge ng-badge-live" style={{ color: 'var(--ng-red)', borderColor: 'rgba(255,59,92,.2)', background: 'rgba(255,59,92,.08)' }}>Fraud detected</span>
      ) : (
        <span className="ng-badge ng-badge-info" style={{ color: 'var(--ng-green)', borderColor: 'rgba(0,200,122,.2)', background: 'rgba(0,200,122,.08)' }}>Verified normal</span>
      ),
  },
  {
    key: 'fraudProbability',
    label: 'Confidence',
    render: (val, row) => {
      const risk = row.isFraud ? 95 : 2;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 80, height: 4, background: 'var(--ng-dim)', borderRadius: 2 }}>
            <div style={{ width: `${risk}%`, height: '100%', background: row.isFraud ? 'var(--ng-red)' : 'var(--ng-accent)', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--ng-text)', fontWeight: 700 }}>{risk}%</span>
        </div>
      );
    },
  },
];

// ─── CSV helper ─────────────────────────────────────────────────────────────
const exportCSV = (transactions) => {
  const headers = ['ID', 'Time', 'Amount', 'Is Fraud', 'Fraud Probability', 'Reviewed', 'Review Label', 'Notes'];
  const csvRows = [
    headers.join(','),
    ...transactions.map((tx) =>
      [
        `"${tx.id}"`,
        tx.time,
        tx.amount,
        tx.isFraud,
        tx.fraudProbability ?? '',
        tx.reviewed,
        `"${tx.reviewLabel || ''}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `transactions_page_export.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

// ─── Page Component ─────────────────────────────────────────────────────────
const TransactionHistory = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filter, setFilter] = useState('all');

  const fetcher = useCallback(
    () => fetchPaginatedTransactions({ page, limit, filter }),
    [page, limit, filter]
  );

  const { data, loading, error, refetch } = useFetch(fetcher, [page, limit, filter]);

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const fraudTotal = data?.fraudTotal || 0;
  const legitTotal = total - fraudTotal;

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
  };

  const handleLimitChange = (val) => {
    setLimit(val);
    setPage(1);
  };

  return (
    <div className="font-syne" style={{ margin: '-2rem', background: 'var(--ng-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--ng-border)',
        background: 'var(--ng-surface)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>All transactions</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            {total.toLocaleString()} records · paginated
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TableToolbar
            filter={filter}
            onFilterChange={handleFilterChange}
            limit={limit}
            onLimitChange={handleLimitChange}
            onExport={() => exportCSV(transactions)}
          />
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <KpiCard label="Total" value={total.toLocaleString()} accent="cyan" />
          <KpiCard label="Fraud" value={fraudTotal.toLocaleString()} accent="red" />
          <KpiCard label="Legitimate" value={legitTotal.toLocaleString()} accent="green" />
        </div>

        <div className="ng-card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
          <div className="ng-card-header" style={{ padding: '0 0 14px 0' }}>
            <div className="ng-card-title">Transaction history</div>
            <span className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)' }}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()}
            </span>
          </div>

          <DataTable
            columns={COLUMNS}
            rows={transactions}
            loading={loading}
            error={error}
            onRetry={refetch}
            emptyMessage="No transactions match the current filter."
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ background: 'transparent', border: '1px solid var(--ng-border)', color: 'var(--ng-muted)', padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
              >
                ← Previous
              </button>

              <span className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)' }}>
                Page <span style={{ color: 'var(--ng-text)', fontWeight: 700 }}>{page}</span> / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ background: 'var(--ng-dim)', border: '1px solid var(--ng-border)', color: 'var(--ng-text)', padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
