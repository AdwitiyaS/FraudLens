import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const VOL_DATA = [420,380,310,280,350,480,620,740,810,760,690,720,750,800,820,790,710,680,730,810,870,790,650,510];
const FRAUD_RATE = [3.1,2.8,2.2,1.9,4.1,6.2,5.8,4.3,3.7,3.2,2.9,3.1,3.4,3.8,4.2,5.1,6.8,7.2,5.4,4.1,3.6,3.2,2.8,2.4];

const chartData = HOURS.map((h, i) => ({
  hour: h,
  volume: VOL_DATA[i],
  fraudRate: FRAUD_RATE[i],
}));

const VolumeChart = () => (
  <div className="ng-card" style={{ minHeight: 300 }}>
    <div className="ng-card-header">
      <div className="ng-card-title">Transaction Volume & Fraud Rate — 24h</div>
      <span className="ng-badge ng-badge-live">● LIVE</span>
    </div>
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
          <XAxis
            dataKey="hour"
            tick={{ fill: 'var(--ng-muted)', fontSize: 8 }}
            axisLine={{ stroke: 'var(--ng-border)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'var(--ng-muted)', fontSize: 8 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'var(--ng-red)', fontSize: 8 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--ng-surface)',
              border: '1px solid var(--ng-border)',
              borderRadius: 6,
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--ng-text)',
            }}
            itemStyle={{ color: 'var(--ng-text)', fontWeight: 'bold' }}
            labelStyle={{ color: 'var(--ng-muted)', marginBottom: 4 }}
          />
          <Bar
            yAxisId="left"
            dataKey="volume"
            fill="var(--ng-accent)"
            fillOpacity={0.3}
            stroke="var(--ng-accent)"
            strokeOpacity={0.6}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            dataKey="fraudRate"
            stroke="var(--ng-red)"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            dot={{ r: 2, fill: 'var(--ng-red)' }}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--ng-muted)' }}>
        <span style={{ width: 10, height: 2, background: 'var(--ng-accent)', display: 'inline-block', borderRadius: 1 }} />
        Transaction Volume
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--ng-muted)' }}>
        <span style={{ width: 10, height: 2, background: 'var(--ng-red)', display: 'inline-block', borderRadius: 1 }} />
        Fraud Rate %
      </span>
    </div>
  </div>
);

export default VolumeChart;
