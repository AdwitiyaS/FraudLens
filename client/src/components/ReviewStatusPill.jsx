import React from 'react';

const ReviewStatusPill = ({ reviewed, label }) => {
  if (!reviewed) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
        Pending Review
      </span>
    );
  }

  const isFraud = label === 'FRAUD' || label === 'Confirmed Fraud';
  
  if (isFraud) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
        Confirmed Fraud
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
      False Positive
    </span>
  );
};

export default ReviewStatusPill;
