import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ComparisonCard = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  // Formatting data for Recharts
  const chartData = data.map(item => ({
    name: item.isFraud ? 'Fraud' : 'Legit',
    avg: Math.round(item.avgAmount),
    max: Math.round(item.maxAmount),
    count: item.count,
    isFraud: item.isFraud
  }));

  const COLORS = ['#10b981', '#f43f5e']; // Legit (Green), Fraud (Red)

  return (
    <div className="glass-panel p-6 border-white/5 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-[var(--ng-text)] uppercase tracking-wider">Average Transaction Value</h3>
          <p className="text-[10px] text-[var(--ng-muted)] uppercase tracking-widest mt-1">Legitimate vs. Fraudulent Behavioral Comparison</p>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ng-border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--ng-muted)', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--ng-muted)', fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{ background: 'var(--ng-surface)', border: '1px solid var(--ng-border)', borderRadius: '12px', fontSize: '11px', color: 'var(--ng-text)' }}
              itemStyle={{ fontWeight: 'bold', color: 'var(--ng-text)' }}
              labelStyle={{ color: 'var(--ng-muted)', marginBottom: '4px', fontWeight: 'bold' }}
              cursor={{ fill: 'var(--ng-hover-bg)' }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Average Value']}
            />
            <Bar dataKey="avg" name="Average Value" radius={[4, 4, 0, 0]} barSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isFraud ? '#f43f5e' : '#10b981'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.map((item, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
             <div className="text-[9px] font-bold text-[var(--ng-muted)] uppercase tracking-widest mb-1">{item.name} Max</div>
             <div className={`text-sm font-bold ${item.isFraud ? 'text-rose-400' : 'text-emerald-400'}`}>
               ${item.max.toLocaleString()}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonCard;
