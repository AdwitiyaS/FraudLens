import React, { useMemo } from 'react';
import { fetchPaginatedTransactions, fetchStats } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import DataTable from '../components/DataTable';
import AlertBadge from '../components/AlertBadge';
import { AlertCircle } from 'lucide-react';

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
    label: 'Time Detected',
    render: (val) => {
      // The Kaggle dataset uses "seconds from first transaction"
      const hrs = Math.floor(val / 3600).toString().padStart(2, '0');
      const mins = Math.floor((val % 3600) / 60).toString().padStart(2, '0');
      const secs = Math.floor(val % 60).toString().padStart(2, '0');
      return (
        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ng-text)', fontWeight: 600 }}>
          T+{hrs}:{mins}:{secs}
        </span>
      );
    },
  },
  {
    key: 'amount',
    label: 'Risk Exposure',
    render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--ng-text)' }}>
        ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    ),
    className: 'text-right',
  },
  {
    key: 'fraudProbability',
    label: 'Risk Probability',
    render: (val) => {
      if (val == null) return <span className="text-[var(--ng-text)] opacity-50">—</span>;
      const pct = (val * 100).toFixed(1);
      // Alerts are inherently high risk, apply warning stylization natively
      return (
        <div className="flex items-center justify-end gap-2 text-[var(--ng-red)] font-bold bg-red-400/[0.05] px-2 py-0.5 rounded border border-red-500/10 w-fit ml-auto">
           {pct}% <AlertCircle size={12} className="opacity-80" />
        </div>
      );
    },
    className: 'text-right',
  },
  {
    key: 'reviewed',
    label: 'Investigation Action Required',
    render: (val) =>
      val ? (
        <span className="text-xs font-medium px-2 py-1 bg-cyan-500/10 text-[var(--ng-accent)] rounded">Reviewed</span>
      ) : (
        <span className="text-xs font-semibold px-2 py-1 bg-amber-500/10 text-[var(--ng-amber)] rounded animate-pulse">Pending Review</span>
      ),
  },
];

const Alerts = () => {
  // Grab the overall global stats primarily just to fuel the active badge count accurately
  const { data: statsData } = useFetch(fetchStats, []);

  // Fetch only anomalies natively. We fetch a broader subset locally (e.g. 100)
  // to ensure aggressive real-time sorting hits true high-priority records
  const { data: alertData, loading, error, refetch } = useFetch(
    () => fetchPaginatedTransactions({ page: 1, limit: 100, filter: 'fraud' }),
    []
  );

  // Derive the active sorted array on the frontend
  const activeAlerts = useMemo(() => {
    const records = alertData?.transactions || [];
    
    // Sort identically off the normalized `fraudProbability` float (descending)
    return [...records].sort((a, b) => (b.fraudProbability || 0) - (a.fraudProbability || 0));
  }, [alertData]);

  const activeFraudCount = statsData?.fraudsDetected || 0;

  return (
    <div className="font-syne" style={{ margin: '-2rem', background: 'var(--ng-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--ng-border)',
        background: 'var(--ng-surface)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Alerts center</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            Unsupervised anomaly detection results
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ng-status-badge">
            <span style={{ color: 'var(--ng-red)' }}>{activeFraudCount.toLocaleString()} flagged</span>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        <div className="ng-card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
          <div className="ng-card-header" style={{ padding: '0 0 14px 0' }}>
            <div className="ng-card-title">Fraud anomalies</div>
            <span className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)' }}>
              Showing {activeAlerts.length} high-priority records
            </span>
          </div>
          
          <DataTable
            columns={COLUMNS}
            rows={activeAlerts}
            loading={loading}
            error={error}
            onRetry={refetch}
            emptyMessage="System cleared! No high-risk threats detected currently."
          />
        </div>
      </div>
    </div>
  );
};

export default Alerts;
