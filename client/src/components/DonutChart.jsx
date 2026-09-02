import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#ff3b5c', '#00c87a'];

const DonutChart = ({ fraudCount = 0, legitCount = 0 }) => {
  const total = fraudCount + legitCount || 1;
  const pct = ((fraudCount / total) * 100).toFixed(1);
  const data = [
    { name: 'Fraud', value: fraudCount || 1 },
    { name: 'Legit', value: legitCount || 1 },
  ];

  return (
    <div className="ng-card">
      <div className="ng-card-header">
        <div className="ng-card-title">Classification Breakdown</div>
        <span className="ng-badge ng-badge-info">CURRENT SESSION</span>
      </div>
      <div style={{ position: 'relative', height: 160 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius="72%"
              outerRadius="95%"
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="ng-donut-center">
          <div className="ng-donut-pct">{pct}%</div>
          <div className="ng-donut-lbl">FRAUD RATE</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--ng-red)', flexShrink: 0 }} />
          <span style={{ color: 'var(--ng-muted)', flex: 1, marginLeft: 7 }}>Fraud</span>
          <span className="font-mono2" style={{ color: 'var(--ng-red)', fontWeight: 500 }}>
            {fraudCount.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--ng-green)', flexShrink: 0 }} />
          <span style={{ color: 'var(--ng-muted)', flex: 1, marginLeft: 7 }}>Legitimate</span>
          <span className="font-mono2" style={{ color: 'var(--ng-green)', fontWeight: 500 }}>
            {legitCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
