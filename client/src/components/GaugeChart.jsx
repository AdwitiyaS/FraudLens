import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const gaugeData = [
  { value: 95.29 },
  { value: 4.71 },
];

const GaugeChart = () => (
  <div className="ng-card">
    <div className="ng-card-header">
      <div className="ng-card-title">Model Performance</div>
      <span className="ng-badge ng-badge-info">Random Forest</span>
    </div>

    {/* Gauge */}
    <div style={{ position: 'relative', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%" cy="100%"
            startAngle={180} endAngle={0}
            innerRadius="78%" outerRadius="95%"
            dataKey="value"
            stroke="none"
          >
            <Cell fill="var(--ng-amber)" />
            <Cell fill="var(--ng-dim)" fillOpacity={0.5} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div style={{ textAlign: 'center' }}>
      <div className="font-mono2" style={{ fontSize: 32, fontWeight: 800, color: 'var(--ng-amber)', lineHeight: 1 }}>
        0.9529
      </div>
      <div style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 4, fontWeight: 600, letterSpacing: '0.5px' }}>
        ROC-AUC Score · 5-fold CV
      </div>
    </div>

    {/* Stat boxes */}
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <div className="ng-stat-box">
        <div className="ng-stat-val">94.1%</div>
        <div className="ng-stat-lbl">Precision</div>
      </div>
      <div className="ng-stat-box">
        <div className="ng-stat-val">80.6%</div>
        <div className="ng-stat-lbl">Recall</div>
      </div>
      <div className="ng-stat-box">
        <div className="ng-stat-val">0.35</div>
        <div className="ng-stat-lbl">Threshold</div>
      </div>
    </div>

    <Link to="/model-stats" className="ng-scan-btn">
      Full model report →
    </Link>
  </div>
);

export default GaugeChart;
