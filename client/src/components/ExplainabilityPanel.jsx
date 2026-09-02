import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

const ExplainabilityPanel = ({ shapValues = [], fraudProbability = 0 }) => {
  if (!shapValues || shapValues.length === 0) return null;

  // Sorting features by absolute SHAP value impact
  const sortedValues = [...shapValues].sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
  
  // High impact drivers
  const positiveDrivers = sortedValues.filter(v => v.shapValue > 0).slice(0, 2);
  const negativeDrivers = sortedValues.filter(v => v.shapValue < 0).slice(0, 2);

  const getReadableLabel = (feature) => {
    const mapping = {
      'Amount': 'Transaction Amount',
      'Time': 'Transaction Timing',
      'card1': 'Payment Card Factor (card1)',
    };
    return mapping[feature] || `Component ${feature}`;
  };

  const getReasoning = (v) => {
    const label = getReadableLabel(v.feature);
    if (v.shapValue > 0) {
      if (v.feature === 'Amount') return `${label} is unusually high for typical non-fraudulent patterns.`;
      if (v.feature === 'Time') return `${label} deviates from the established baseline activity for this dataset.`;
      return `${label} shows patterns historically associated with anomalous behavior.`;
    } else {
      return `${label} aligns with the characteristics of legitimate transactions.`;
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2 mb-2">
        <Info size={16} className="text-cyan-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ng-text)] opacity-90">AI Explainability Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Escalators */}
        <div className="glass-panel p-5 border-rose-500/20 bg-rose-500/[0.02]">
          <div className="flex items-center gap-2 mb-4 text-rose-400">
            <TrendingUp size={16} />
            <span className="text-sm font-bold">Key Risk Escalators</span>
          </div>
          <div className="space-y-4">
            {positiveDrivers.length > 0 ? (
              positiveDrivers.map((v, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--ng-text)] opacity-80">{getReadableLabel(v.feature)}</span>
                  <p className="text-[11px] leading-relaxed text-[var(--ng-muted)]">{getReasoning(v)}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--ng-muted)] italic">No significant risk escalators identified.</p>
            )}
          </div>
        </div>

        {/* Confidence Drivers */}
        <div className="glass-panel p-5 border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <TrendingDown size={16} />
            <span className="text-sm font-bold">Safe Patterns Identified</span>
          </div>
          <div className="space-y-4">
            {negativeDrivers.length > 0 ? (
              negativeDrivers.map((v, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--ng-text)] opacity-80">{getReadableLabel(v.feature)}</span>
                  <p className="text-[11px] leading-relaxed text-[var(--ng-muted)]">{getReasoning(v)}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--ng-muted)] italic">No significant safety markers identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Conclusion */}
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
        <p className="text-xs leading-relaxed text-[var(--ng-muted)]">
          The AI model evaluated this transaction across 30 distinct feature vectors. 
          The final probability of <span className="text-[var(--ng-text)] font-bold">{Math.round(fraudProbability * 100)}%</span> is primarily driven by 
          the intersection of <span className="text-[var(--ng-text)]">{getReadableLabel(sortedValues[0]?.feature)}</span> and <span className="text-[var(--ng-text)]">{getReadableLabel(sortedValues[1]?.feature)}</span>.
        </p>
      </div>
    </div>
  );
};

export default ExplainabilityPanel;
