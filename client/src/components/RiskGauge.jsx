import React from 'react';

const RiskGauge = ({ probability = 0 }) => {
  const percentage = Math.round(probability * 100);
  
  // Determine color and label based on risk
  let colorClass = 'bg-emerald-500';
  let textClass = 'text-emerald-400';
  let shadowClass = 'shadow-emerald-500/20';
  let label = 'Low Risk';

  if (percentage >= 70) {
    colorClass = 'bg-rose-500';
    textClass = 'text-rose-400';
    shadowClass = 'shadow-rose-500/20';
    label = 'Critical High Risk';
  } else if (percentage >= 30) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-400';
    shadowClass = 'shadow-amber-500/20';
    label = 'Elevated Suspicion';
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Progress Circle Backdrop */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-[var(--ng-text)]/5"
          />
          {/* Active Progress */}
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - probability)}
            strokeLinecap="round"
            className={`${textClass} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Inner Content */}
        <div className="text-center z-10 transition-transform hover:scale-105">
          <div className={`text-5xl font-black tracking-tighter ${textClass}`}>
            {percentage}%
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--ng-muted)] font-bold mt-1">
            FRAUD PROBABILITY
          </div>
        </div>
      </div>

      {/* Label Badge */}
      <div className={`mt-6 px-6 py-2 rounded-full border border-white/10 ${shadowClass} shadow-lg backdrop-blur-sm`}>
        <span className={`text-sm font-bold uppercase tracking-widest ${textClass}`}>
          {label}
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
