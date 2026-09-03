import { fetchAuditTrail } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import EmptyState from '../components/EmptyState';
import { ClipboardList } from 'lucide-react';

const ACTION_STYLES = {
  AUTO_APPROVE: { color: '#00c87a', bg: 'rgba(0,200,122,0.08)', border: 'rgba(0,200,122,0.2)', label: 'Auto Approved' },
  HOLD_FOR_REVIEW: { color: '#f5a623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)', label: 'Held for Review' },
  AUTO_BLOCK: { color: '#ff4d5e', bg: 'rgba(255,77,94,0.08)', border: 'rgba(255,77,94,0.2)', label: 'Auto Blocked' },
};

const ActionBadge = ({ action }) => {
  const style = ACTION_STYLES[action] || ACTION_STYLES.HOLD_FOR_REVIEW;
  return (
    <span
      style={{
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 6,
        padding: '3px 10px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {style.label}
    </span>
  );
};

const SummaryCard = ({ label, value, color }) => (
  <div className="ng-card" style={{ padding: 16 }}>
    <div className="font-mono2" style={{ fontSize: 9, fontWeight: 700, color: 'var(--ng-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
      {label}
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color: color || 'var(--ng-text)' }}>
      {value}
    </div>
  </div>
);

const AuditTrail = () => {
  const { data, loading, error, refetch } = useFetch(fetchAuditTrail, []);

  const logs = data?.logs || [];
  const summary = data?.summary || {};

  if (error) {
    return (
      <EmptyState
        title="Audit Trail Offline"
        message="We couldn't reach the decision logging service. Ensure the backend services are running."
        icon="error"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="font-syne" style={{ margin: '-2rem', background: 'var(--ng-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--ng-border)',
        background: 'var(--ng-surface)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Audit trail</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            Every automated decision — explainable, bounded, logged
          </div>
        </div>
        <div className="ng-badge ng-badge-live" style={{ color: 'var(--ng-accent)', borderColor: 'rgba(0,229,255,.2)', background: 'rgba(0,229,255,.08)' }}>
          {logs.length} recent decisions
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        {loading && !data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ng-card" style={{ height: 80, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />
              ))}
            </div>
            <div className="ng-card" style={{ height: 400, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Decisions Yet"
            message="Run a transaction check to see the decision engine's audit trail here."
            icon="success"
            onRetry={refetch}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'ng-fadeIn 0.4s ease' }}>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <SummaryCard label="Total Decisions" value={summary.total_decisions ?? 0} />
              <SummaryCard label="Auto Approved" value={summary.auto_approved ?? 0} color="#00c87a" />
              <SummaryCard label="Held for Review" value={summary.held_for_review ?? 0} color="#f5a623" />
              <SummaryCard label="Auto Blocked" value={summary.auto_blocked ?? 0} color="#ff4d5e" />
            </div>

            {/* Decision Log Table */}
            <div className="ng-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ng-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={14} style={{ color: 'var(--ng-muted)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ng-text)' }}>Decision Log</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--ng-border)' }}>
                      {['Time', 'Amount', 'Fraud Prob.', 'Action', 'Reason', 'Model'].map((h) => (
                        <th
                          key={h}
                          className="font-mono2"
                          style={{
                            textAlign: 'left', padding: '10px 20px', fontSize: 9,
                            fontWeight: 700, color: 'var(--ng-muted)', textTransform: 'uppercase', letterSpacing: 1,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} style={{ borderBottom: '1px solid var(--ng-border)' }}>
                        <td className="font-mono2" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--ng-muted)', whiteSpace: 'nowrap' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                        </td>
                        <td className="font-mono2" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--ng-text)' }}>
                          ${Number(log.amount || 0).toFixed(2)}
                        </td>
                        <td className="font-mono2" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--ng-text)' }}>
                          {(log.fraud_probability * 100).toFixed(1)}%
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <ActionBadge action={log.action} />
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: 11, color: 'var(--ng-muted)', maxWidth: 360 }}>
                          {log.reason}
                        </td>
                        <td className="font-mono2" style={{ padding: '12px 20px', fontSize: 10, color: 'var(--ng-muted)', whiteSpace: 'nowrap' }}>
                          {log.model_used}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;