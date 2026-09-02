import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, ShieldCheck, ShieldAlert } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, actionType }) => {
  const [notes, setNotes] = useState('');
  const closeButtonRef = useRef(null);
  
  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Accessibility: Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFraud = actionType === 'FRAUD';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="glass-panel w-full max-w-md p-8 relative shadow-2xl shadow-black outline-none border-white/10">
        <button 
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-4 right-4 text-[var(--ng-muted)] hover:text-[var(--ng-text)] transition-colors p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isFraud ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
            {isFraud ? <ShieldAlert size={32} aria-hidden="true" /> : <ShieldCheck size={32} aria-hidden="true" />}
          </div>
          <h2 id="modal-title" className="text-xl font-extrabold text-[var(--ng-text)]">
            {isFraud ? 'Confirm Fraudulent Activity' : 'Mark as False Positive'}
          </h2>
          <p className="text-sm text-[var(--ng-muted)] mt-2 leading-relaxed">
            {isFraud 
              ? 'This action will escalate the transaction and mark it as confirmed fraud in the system.' 
              : 'This action will dismiss the alert and return the transaction to the legitimate ledger.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--ng-muted)] flex items-center gap-2">
              <MessageSquare size={12} aria-hidden="true" /> Analyst Investigation Notes
            </label>
            <textarea
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide evidence or reasoning for this resolution..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--ng-text)] h-32 focus:outline-none focus:border-cyan-500/50 resize-none transition-all placeholder:text-[var(--ng-muted)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-[var(--ng-border)] bg-[var(--ng-surface)] text-sm font-bold text-[var(--ng-muted)] hover:text-[var(--ng-text)] hover:bg-[var(--ng-hover-bg)] transition-all focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(notes);
                setNotes('');
              }}
              className={`w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] focus-visible:ring-2 ${isFraud ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 focus-visible:ring-rose-500' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 focus-visible:ring-emerald-500'}`}
            >
              Finalize Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
