import React from 'react';
import ReviewStatusPill from './ReviewStatusPill';
import { DollarSign, Clock, Hash, AlertTriangle, FileText } from 'lucide-react';

const CaseCard = ({ caseData, onReview }) => {
  const { id, amount, time, reviewed, reviewLabel, notes } = caseData;
  
  // Use card1 or similar from raw as a mock 'Risk Evidence' indicators
  const riskFactor = caseData.card1 ? (caseData.card1).toFixed(4) : "2.4011";

  return (
    <div className={`glass-panel p-6 border-white/5 relative overflow-hidden group transition-all duration-500 ${reviewed ? 'opacity-70 grayscale-[0.2]' : 'hover:border-cyan-500/30'}`}>
      {/* Decorative gradient background */}
      {!reviewed && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] -mr-16 -mt-16 rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
      )}

      {/* Header with ID and Status */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
            <Hash size={16} className="text-[var(--ng-muted)]" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-widest mb-0.5">Reference ID</div>
            <div className="text-xs font-mono text-[var(--ng-text)] font-bold truncate max-w-[120px] md:max-w-none">{id}</div>
          </div>
        </div>
        <ReviewStatusPill reviewed={reviewed} label={reviewLabel} />
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-widest">
            <DollarSign size={10} /> Amount
          </div>
          <div className="text-sm font-extrabold text-[var(--ng-text)]">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-widest">
            <Clock size={10} /> Time Offset
          </div>
          <div className="text-sm font-bold text-[var(--ng-muted)]">{time.toLocaleString()} s</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-widest">
            <AlertTriangle size={10} /> Risk Factor
          </div>
          <div className="text-sm font-bold text-rose-400">{riskFactor}</div>
        </div>
      </div>

      {/* Existing Notes Section (if reviewed) */}
      {reviewed && notes && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-widest">
            <FileText size={10} /> Resolution Notes
          </div>
          <p className="text-xs text-[var(--ng-muted)] italic leading-relaxed">"{notes}"</p>
        </div>
      )}

      {/* Action Buttons */}
      {!reviewed ? (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
          <button
            onClick={() => onReview(id, 'FRAUD')}
            className="py-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 text-[11px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20 active:scale-[0.98]"
          >
            Confirm Fraud
          </button>
          <button
            onClick={() => onReview(id, 'LEGITIMATE')}
            className="py-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20 active:scale-[0.98]"
          >
            False Positive
          </button>
        </div>
      ) : (
        <div className="text-center py-2.5 rounded-lg border border-white/5 bg-white/[0.01] text-[10px] font-bold text-[var(--ng-muted)] uppercase tracking-[0.2em]">
           Case Investigation Finalized
        </div>
      )}
    </div>
  );
};

export default CaseCard;
