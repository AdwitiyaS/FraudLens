import React from 'react';
import { ShieldCheck } from 'lucide-react';

const BrandMark = () => (
  <div className="flex items-center gap-3 px-6 py-5">
    <div className="w-9 h-9 bg-gradient-to-br from-[var(--ng-accent)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
      <ShieldCheck size={18} className="text-[var(--ng-text)]" />
    </div>
    <div>
      <h1 className="text-base font-extrabold tracking-widest uppercase text-[var(--ng-text)] leading-none">
        NeuralGuard
      </h1>
      <span className="text-[9px] uppercase tracking-[0.25em] text-[var(--ng-accent)] font-semibold opacity-80">
        AI Fraud Intel
      </span>
    </div>
  </div>
);

export default BrandMark;
