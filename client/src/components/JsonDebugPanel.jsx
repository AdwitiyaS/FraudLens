import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal } from 'lucide-react';

const JsonDebugPanel = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <div className="mt-8 border border-white/5 rounded-xl overflow-hidden bg-black/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 flex items-center justify-between text-[var(--ng-muted)] hover:text-[var(--ng-muted)] transition-colors bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">Raw Model Response (Debug)</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <div className="p-5 font-mono text-[11px] leading-relaxed text-cyan-500/80 overflow-x-auto max-h-[400px] custom-scrollbar selection:bg-cyan-500/20">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default JsonDebugPanel;
