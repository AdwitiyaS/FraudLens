import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const PredictionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    time: '1',
    card1: '0'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = "Valid numeric amount is required";
    if (!formData.time || isNaN(formData.time)) newErrors.time = "Numeric time offset is required";
    if (!formData.card1 || isNaN(formData.card1)) newErrors.card1 = "Numeric card1 component required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        amount: parseFloat(formData.amount),
        time: parseFloat(formData.time),
        card1: parseFloat(formData.card1)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="form-title">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <label 
            htmlFor="amount-input"
            className="text-[10px] font-bold uppercase tracking-widest text-[var(--ng-muted)] flex items-center gap-2"
          >
             Transaction Amount ($)
          </label>
          <input
            id="amount-input"
            type="text"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 99.99"
            aria-invalid={errors.amount ? "true" : "false"}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            className={`w-full bg-white/[0.03] border ${errors.amount ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-[var(--ng-text)] focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all`}
          />
          {errors.amount && <p id="amount-error" className="text-[10px] text-rose-400 font-medium">{errors.amount}</p>}
        </div>

        {/* Time Input */}
        <div className="space-y-2">
          <label 
            htmlFor="time-input"
            className="text-[10px] font-bold uppercase tracking-widest text-[var(--ng-muted)] flex items-center gap-2"
          >
             Time Offset (Seconds)
          </label>
          <input
            id="time-input"
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            placeholder="Seconds since epoch start"
            aria-invalid={errors.time ? "true" : "false"}
            aria-describedby={errors.time ? "time-error" : undefined}
            className={`w-full bg-white/[0.03] border ${errors.time ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-[var(--ng-text)] focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all`}
          />
          {errors.time && <p id="time-error" className="text-[10px] text-rose-400 font-medium">{errors.time}</p>}
        </div>

        {/* card1 Input */}
        <div className="space-y-2">
          <label 
            htmlFor="card1-input"
            className="text-[10px] font-bold uppercase tracking-widest text-[var(--ng-muted)] flex items-center gap-2"
          >
             Payment Card Factor (card1)
          </label>
          <input
            id="card1-input"
            type="text"
            name="card1"
            value={formData.card1}
            onChange={handleChange}
            placeholder="Numerical card ID"
            aria-invalid={errors.card1 ? "true" : "false"}
            aria-describedby={errors.card1 ? "card1-error" : undefined}
            className={`w-full bg-white/[0.03] border ${errors.card1 ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-[var(--ng-text)] focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all`}
          />
          {errors.card1 && <p id="card1-error" className="text-[10px] text-rose-400 font-medium">{errors.card1}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full relative group bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98] overflow-hidden focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Calculator size={18} className="text-cyan-200" aria-hidden="true" />
            <span>Generate Risk Prediction</span>
          </>
        )}
        
        {/* Subtle Shine Effect */}
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
      </button>
    </form>
  );
};

export default PredictionForm;
