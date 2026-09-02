import React from 'react';
import { fetchModelStats } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import EmptyState from '../components/EmptyState';
import { Cpu, CheckCircle2, AlertCircle, BarChart, Info, Layers } from 'lucide-react';

const PerformanceTile = ({ label, value, description, colorClass }) => (
  <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-5 blur-[40px] -mr-12 -mt-12 rounded-full pointer-events-none group-hover:opacity-10 transition-opacity`} />
    <div className="text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-3xl font-black mb-2 ${colorClass.replace('bg-', 'text-')}`}>
      {(value * 100).toFixed(2)}%
    </div>
    <p className="text-[11px] text-[var(--ng-muted)] leading-relaxed">{description}</p>
  </div>
);

const ModelStats = () => {
  const { data: stats, loading, error, refetch } = useFetch(fetchModelStats, null);

  if (error) {
    return (
      <EmptyState 
        title="Model Engine Offline" 
        message="Could not retrieve neural metrics. Ensure the ML service is operational." 
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
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Model performance</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            Technical audit of the fraud detection classifier
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {stats && (
            <div className="ng-badge ng-badge-info">
              Architecture: {stats.modelName}
            </div>
          )}
          <div className="ng-status-badge">
             <div className="ng-status-dot" />Inference Core V2.4
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        {loading && !stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
             {[...Array(4)].map((_, i) => <div key={i} className="ng-card" style={{ height: 120, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'ng-fadeIn 0.4s ease' }}>
            {/* Metrics Gallery */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <PerformanceTile 
                label="Overall Accuracy" 
                value={stats.metrics.accuracy} 
                description="Correct predictions (Fraud + Legit)."
                colorClass="bg-cyan-500"
              />
              <PerformanceTile 
                label="Precision Score" 
                value={stats.metrics.precision} 
                description="Reliability of fraud flags (fewer FP)."
                colorClass="bg-emerald-500"
              />
              <PerformanceTile 
                label="Recall Score" 
                value={stats.metrics.recall} 
                description="Ability to catch fraud (fewer FN)."
                colorClass="bg-amber-500"
              />
              <PerformanceTile 
                label="F1 Calibration" 
                value={stats.metrics.f1} 
                description="Harmonic mean of precision and recall."
                colorClass="bg-rose-500"
              />
            </div>
  
            {/* Model Comparison Table */}
            <div className="ng-card">
              <div className="ng-card-header">
                <div className="ng-card-title">Model Comparison Audit</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--ng-border)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--ng-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Model Engine</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ng-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Accuracy</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ng-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Precision</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ng-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Recall</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ng-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>F1 Score</th>
                      <th style={{ padding: '12px 16px', color: 'var(--ng-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.allModels.map((model, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--ng-border)', background: model.isActive ? 'rgba(6, 182, 212, 0.03)' : 'transparent' }}>
                        <td style={{ padding: '16px', color: 'var(--ng-text)', fontWeight: 600 }}>{model.name}</td>
                        <td style={{ padding: '16px', fontNumbers: 'var(--ng-font-mono)' }}>{(model.accuracy * 100).toFixed(2)}%</td>
                        <td style={{ padding: '16px', fontNumbers: 'var(--ng-font-mono)' }}>{(model.precision * 100).toFixed(2)}%</td>
                        <td style={{ padding: '16px', fontNumbers: 'var(--ng-font-mono)' }}>{(model.recall * 100).toFixed(2)}%</td>
                        <td style={{ padding: '16px', fontNumbers: 'var(--ng-font-mono)' }}>{(model.f1 * 100).toFixed(2)}%</td>
                        <td style={{ padding: '16px' }}>
                          {model.isActive ? (
                            <span className="ng-badge ng-badge-success" style={{ fontSize: 9 }}>ACTIVE</span>
                          ) : (
                            <span className="ng-badge ng-badge-info" style={{ fontSize: 9, opacity: 0.6 }}>STANDBY</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ng-accent)', opacity: 0.3 }} />
                  <span style={{ fontSize: 10, color: 'var(--ng-muted)' }}>Real-time production metrics</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info size={12} className="text-cyan-500" />
                  <span style={{ fontSize: 10, color: 'var(--ng-muted)' }}>Metrics derived from latest cross-validation</span>
                </div>
              </div>
            </div>
  
            {/* Training Origin Card */}
            <div className="ng-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,122,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ng-green)' }}>
                     ✓
                  </div>
                  <div>
                     <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--ng-text)' }}>Validation Set Confirmed</h4>
                     <p style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 2 }}>Dataset Origin: {stats.trainedOn}</p>
                  </div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ng-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Inference Threshold</div>
                  <div className="font-mono2" style={{ fontSize: 16, fontWeight: 800, color: 'var(--ng-text)' }}>{(stats.metrics.threshold * 100).toFixed(1)}%</div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelStats;
