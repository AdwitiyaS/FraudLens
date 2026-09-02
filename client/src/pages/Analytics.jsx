import { fetchAnalytics, fetchModelStats } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import MetricGrid from '../components/MetricGrid';
import ComparisonCard from '../components/ComparisonCard';
import LineChartCard from '../components/LineChartCard';
import EmptyState from '../components/EmptyState';
import { BarChart3, Info, Cpu } from 'lucide-react';

const Analytics = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.userId || 'anonymous';

  const { data: analytics, loading, error, refetch } = useFetch(() => fetchAnalytics(userId), [userId]);
  const { data: modelStats } = useFetch(() => fetchModelStats(userId), [userId]);

  const activeStructure = modelStats?.activeStructure === 'XGB_SVM' ? 'Enterprise (XGB+SVM)' : 'Standard (RF+IF)';

  if (error) {
    return (
      <EmptyState 
        title="Analytics Offline" 
        message="The statistical aggregation engine is currently unavailable. Ensure the backend services are synchronized." 
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
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Analytics hub</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            Multi-dimensional behavioral analysis and insights
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ng-badge ng-badge-live" style={{ color: 'var(--ng-accent)', borderColor: 'rgba(0,229,255,.2)', background: 'rgba(0,229,255,.08)' }}>
            {activeStructure}
          </div>
          <div className="ng-badge ng-badge-info">Latest 24h Aggregation</div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        {loading && !analytics ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
               {[...Array(4)].map((_, i) => <div key={i} className="ng-card" style={{ height: 100, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               <div className="ng-card" style={{ height: 380, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />
               <div className="ng-card" style={{ height: 380, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'ng-fadeIn 0.4s ease' }}>
             {/* Summary Grid */}
             <MetricGrid stats={analytics} />
  
             {/* Visualization Section */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
                <LineChartCard data={analytics.amountDistribution} />
                <ComparisonCard data={analytics.avgByClass} />
             </div>
  
             {/* Methodology Insight */}
             <div style={{
                padding: 24, borderRadius: 10, background: 'linear-gradient(135deg, rgba(0,229,255,0.05), transparent)',
                border: '1px solid rgba(0,229,255,0.1)'
             }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ng-text)', marginBottom: 8 }}>Aggregation Methodology</h4>
                <p style={{ fontSize: 11, color: 'var(--ng-muted)', lineHeight: 1.6, maxWidth: 800 }}>
                  The metrics displayed above are derived from an ensemble of historical Kaggle datasets and live inference streams. 
                  Distributions are calculated using binned MongoDB aggregations to detect significant deviations in high-amount transaction buckets, 
                  where AI model precision is historically most sensitive.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
