import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, fetchPaginatedTransactions } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';

import KpiCard from '../components/KpiCard';
import TickerBar from '../components/TickerBar';
import VolumeChart from '../components/VolumeChart';
import RealTimeFeed from '../components/RealTimeFeed';
import DonutChart from '../components/DonutChart';
import GaugeChart from '../components/GaugeChart';
import DashboardFooter from '../components/DashboardFooter';

const Dashboard = () => {
  const [mode, setMode] = useState('exec');
  const [clock, setClock] = useState('');

  // Clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(n.toUTCString().split(' ').slice(4, 5)[0] + ' UTC');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useFetch(fetchStats, []);

  // Fetch recent transactions for the table
  const fetchFrauds = useCallback(() => fetchPaginatedTransactions({ limit: 8, filter: 'fraud' }), []);
  const { data: fraudData } = useFetch(fetchFrauds, []);

  // Poll stats
  useEffect(() => {
    const id = setInterval(refetchStats, 5000);
    return () => clearInterval(id);
  }, [refetchStats]);

  const total = stats?.totalTransactions || 0;
  const fraudCount = stats?.fraudsDetected || 0;
  const legitCount = stats?.legitimateCount || (total - fraudCount);
  const risk = stats?.globalRiskScore || 0;
  const fraudTxns = fraudData?.transactions || [];

  const headerSub = total > 0
    ? `${total.toLocaleString()} transactions · ${risk}% risk · $${(fraudCount * 4372).toLocaleString()} protected`
    : 'Loading live data...';

  return (
    <div className="font-syne" style={{ margin: '-2rem', background: 'var(--ng-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--ng-border)',
        background: 'var(--ng-surface)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Main Dashboard</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            {headerSub}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ng-status-badge">
            <div className="ng-status-dot" />ML Engine Online
          </div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)' }}>{clock}</div>
          <div className="ng-mode-toggle">
            <button
              className={`ng-mode-btn ${mode === 'exec' ? 'active' : ''}`}
              onClick={() => setMode('exec')}
            >Executive</button>
            <button
              className={`ng-mode-btn ${mode === 'research' ? 'active' : ''}`}
              onClick={() => setMode('research')}
            >Research</button>
          </div>
        </div>
      </div>

      {/* ── TICKER ── */}
      <TickerBar />

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>

        {/* ── KPI ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 18 }}>
          <KpiCard
            label="Transactions Analyzed"
            value={total > 0 ? total.toLocaleString() : '—'}
            sub={`${(stats?.totalKaggle || 0).toLocaleString()} Kaggle + ${stats?.totalLive || 0} live`}
            accent="cyan"
          />
          <KpiCard
            label="Fraud Detected"
            value={fraudCount > 0 ? fraudCount.toLocaleString() : '—'}
            sub={`Kaggle: ${stats?.fraudKaggle || 0} · Live: ${stats?.fraudLive || 0}`}
            accent="red"
          />
          <KpiCard
            label="Legitimate"
            value={legitCount > 0 ? legitCount.toLocaleString() : '—'}
            sub="Auto-cleared"
            accent="green"
          />
          <KpiCard
            label="Global Risk Score"
            value={risk > 0 ? `${risk}%` : '—'}
            sub="RF · threshold 0.35"
            accent="amber"
          />
        </div>

        {/* ── EXECUTIVE MODE ── */}
        {mode === 'exec' && (
          <>
            {/* Mid row: chart + feed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 18, minWidth: 0 }}>
              <VolumeChart />
              <RealTimeFeed />
            </div>

            {/* Bottom row: table + donut + gauge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 16, minWidth: 0 }}>
              {/* High-Risk Table */}
              <div className="ng-card">
                <div className="ng-card-header">
                  <div className="ng-card-title">Recent High-Risk Transactions</div>
                  <Link to="/alerts" style={{ fontSize: 10, color: 'var(--ng-accent)', textDecoration: 'none' }}>
                    View all →
                  </Link>
                </div>
                <table className="ng-table">
                  <thead>
                    <tr>
                      <th>TX ID</th>
                      <th>Amount</th>
                      <th>Prob.</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudTxns.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--ng-muted)' }}>
                          {stats ? 'No fraud data' : 'Loading...'}
                        </td>
                      </tr>
                    ) : (
                      fraudTxns.slice(0, 8).map((tx, i) => {
                        const amt = parseFloat(tx.amount || 0).toFixed(2);
                        const prob = Math.round((tx.fraudProbability || 0.95) * 100);
                        const txId = tx.time ? `TX-${Math.round(tx.time)}` : `TX-${1000 + i}`;
                        const riskLvl = prob >= 80 ? 'high' : prob >= 50 ? 'med' : 'low';
                        return (
                          <tr key={tx.id || i}>
                            <td>{txId}</td>
                            <td>${amt}</td>
                            <td>{prob}%</td>
                            <td><span className={`risk-pill risk-${riskLvl}`}>{riskLvl.toUpperCase()}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <DonutChart fraudCount={fraudCount} legitCount={legitCount} />
              <GaugeChart />
            </div>
          </>
        )}

        {/* ── RESEARCH MODE ── */}
        {mode === 'research' && (
          <>
            {/* Intelligence Summary */}
            <div className="ng-card" style={{ marginBottom: 18 }}>
              <div className="ng-card-header">
                <div className="ng-card-title">Intelligence Summary</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ng-muted)', lineHeight: 1.8 }}>
                NeuralGuard is running at <strong style={{ color: '#00c87a' }}>99.96% accuracy</strong>.
                Out of <strong style={{ color: '#00e5ff' }}>{total.toLocaleString()}</strong> transactions analysed,
                <strong style={{ color: '#ff3b5c' }}> {fraudCount} fraud cases</strong> were detected ({risk}% risk rate).
                <br /><br />
                Estimated losses prevented: <strong style={{ color: '#ffb830' }}>
                  ${(fraudCount * 4372).toLocaleString()}
                </strong> (avg fraud transaction = $4,372).
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Model Metrics */}
              <div className="ng-card">
                <div className="ng-card-header">
                  <div className="ng-card-title">Model metrics</div>
                </div>
                {[
                  { label: 'ROC-AUC Score', val: '95.29%', pct: 95.29 },
                  { label: 'Accuracy', val: '99.96%', pct: 99.96 },
                  { label: 'Precision', val: '94.05%', pct: 94.05 },
                  { label: 'Recall', val: '80.61%', pct: 80.61 },
                  { label: 'F1 Score', val: '86.81%', pct: 86.81 },
                ].map(m => (
                  <div key={m.label} className="ng-metric-row">
                    <span className="ng-metric-label">{m.label}</span>
                    <div className="ng-metric-bar-wrap">
                      <div className="ng-metric-bar" style={{ width: `${m.pct}%` }} />
                    </div>
                    <span className="ng-metric-val">{m.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <Link to="/model-stats" style={{ fontSize: 11, color: 'var(--ng-accent)', textDecoration: 'none' }}>
                    Full model report →
                  </Link>
                </div>
              </div>

              {/* Architecture */}
              <div className="ng-card">
                <div className="ng-card-header">
                  <div className="ng-card-title">Model architecture</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { title: 'Engine Alpha: RF + Isolation Forest', desc: '100 estimators · threshold=0.35 · 202 features (<200k rows)' },
                    { title: 'Engine Beta: XGBoost + One-Class SVM', desc: 'gradient boosting · threshold=0.9996 · Top 80 features (>200k rows)' },
                    { title: 'SHAP TreeExplainer', desc: 'Dynamic per-transaction feature attribution' },
                  ].map(a => (
                    <div key={a.title} style={{
                      background: 'var(--ng-surface)', borderRadius: 7, padding: 12,
                      border: '1px solid var(--ng-border)',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ng-text)', marginBottom: 3 }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ng-muted)' }}>{a.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <Link to="/check" style={{ fontSize: 11, color: 'var(--ng-accent)', textDecoration: 'none' }}>
                    SHAP explainer →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
