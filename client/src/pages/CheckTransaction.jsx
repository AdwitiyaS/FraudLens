import React, { useState } from 'react';
import { fetchShapExplanation } from '../api/apiClient';
import PredictionForm from '../components/PredictionForm';
import RiskGauge from '../components/RiskGauge';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import JsonDebugPanel from '../components/JsonDebugPanel';
import EmptyState from '../components/EmptyState';
import { ShieldCheck, Zap } from 'lucide-react';

const CheckTransaction = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleManualCheck = async (features) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShapExplanation(features);
      setResult(data);
    } catch (err) {
      setError('The AI service is currently unavailable. Ensure the Flask backend is operational.');
    } finally {
      setLoading(false);
    }
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
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Manual check</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            Verify specific transaction parameters against our AI model
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 800, margin: '0 auto' }}>
          
          {/* Main Form Panel */}
          <div className="ng-card" style={{ padding: 24 }}>
            <PredictionForm onSubmit={handleManualCheck} loading={loading} />
          </div>

          {/* Results Display Area */}
          {error && (
            <EmptyState 
               title="Prediction Service Error" 
               message={error} 
               icon="error"
            />
          )}

          {!result && !loading && !error && (
            <div className="ng-card" style={{ padding: 40, borderStyle: 'dashed', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--ng-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                   <Zap size={20} color="var(--ng-muted)" />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)', marginBottom: 8 }}>Awaiting Parameters</h3>
                <p style={{ fontSize: 11, color: 'var(--ng-muted)', maxWidth: 280 }}>Enter transaction data above to trigger a real-time risk assessment.</p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div className="ng-card" style={{ height: 250, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />
               <div className="ng-card" style={{ height: 120, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />
            </div>
          )}

          {result && !loading && (
            <div style={{ animation: 'ng-fadeIn 0.4s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Top Level Summary Card */}
              <div className="ng-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
                <div>
                   <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ng-text)', marginBottom: 8 }}>Analysis Complete</h2>
                   <p style={{ fontSize: 11, color: 'var(--ng-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                     This transaction was processed through our neural classifier. The probability score was derived from the features provided alongside dataset-wide feature distributions.
                   </p>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                     <div style={{ background: 'var(--ng-surface)', padding: 12, borderRadius: 6, border: '1px solid var(--ng-border)' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ng-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Inference Engine</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ng-text)' }}>{result.engine || "Standard-Forest"}</div>
                     </div>
                     <div style={{ background: 'var(--ng-surface)', padding: 12, borderRadius: 6, border: '1px solid var(--ng-border)' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ng-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Confidence Score</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ng-text)' }}>High</div>
                     </div>
                   </div>
                </div>

                <RiskGauge probability={result.fraudProbability} />
              </div>

              {/* Explainability Section */}
              <div className="ng-card">
                 <div className="ng-card-header">
                    <div className="ng-card-title">SHAP Explainer</div>
                 </div>
                 <ExplainabilityPanel 
                   shapValues={result.shapValues} 
                   fraudProbability={result.fraudProbability}
                 />
              </div>

              {/* Technical Debug Section */}
              <JsonDebugPanel data={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckTransaction;
