import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@splinetool/viewer@1.12.81/build/spline-viewer.js"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@splinetool/viewer@1.12.81/build/spline-viewer.js';
      document.head.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full fixed inset-0 z-50 bg-[#020617] text-white font-['Inter'] overflow-hidden">
      {/* Left side: Hero */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-16 relative overflow-hidden bg-[#020617]">
        <div className="absolute inset-0 z-0 translate-x-[35%]">
          <spline-viewer url="https://prod.spline.design/kBalJIBRP2lou3NE/scene.splinecode" style={{ width: '100%', height: '100%' }}></spline-viewer>
        </div>

        <div className="animate-[fadeUp_0.7s_ease_forwards] flex items-center gap-3 z-20">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase tracking-widest">NeuralGuard</span>
        </div>

        <div className="z-20 space-y-6 flex flex-col justify-center flex-1 pr-20">
          <div className="animate-[fadeUp_0.7s_0.15s_ease_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">V2.4 Live Intelligence</span>
            </div>
          </div>

          <h1 className="animate-[fadeUp_0.7s_0.3s_ease_forwards] opacity-0 text-7xl font-black text-white leading-[1.1] tracking-tighter" style={{ animationFillMode: 'forwards' }}>
            Secure the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500">Neural Flow.</span>
          </h1>

          <p className="animate-[fadeUp_0.7s_0.45s_ease_forwards] opacity-0 text-slate-400 text-lg leading-relaxed max-w-md" style={{ animationFillMode: 'forwards' }}>
            Advanced fraud detection utilizing <span className="text-white">Isolation Forests</span> and <span className="text-white">SHAP</span> to analyze 284k+ transactions with 99.9% precision.
          </p>

          <div className="animate-[fadeUp_0.7s_0.6s_ease_forwards] opacity-0 flex gap-12 pt-8" style={{ animationFillMode: 'forwards' }}>
            <div>
              <p className="text-3xl font-bold text-white tracking-tighter">99.96%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white tracking-tighter">0.17%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Detection Rate</p>
            </div>
          </div>
        </div>

        <div className="z-20 border-t border-slate-800/40 pt-8 overflow-hidden">
          <div className="flex animate-[ticker_25s_linear_infinite] w-max text-[9px] uppercase tracking-[0.3em] text-slate-400/60 gap-12">
            <span>● Random Forest</span><span>● Isolation Forest</span><span>● SHAP</span><span>● MongoDB Atlas</span><span>● Real-Time</span>
            <span>● Random Forest</span><span>● Isolation Forest</span><span>● SHAP</span><span>● MongoDB Atlas</span><span>● Real-Time</span>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-[45%] relative border-l border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <spline-viewer url="https://prod.spline.design/h9Aq2IwvqBgXbswQ/scene.splinecode" style={{ width: '100%', height: '100%' }}></spline-viewer>
        </div>
        <div className="absolute inset-0 z-10 bg-[#020617]/60"></div>

        <div className="absolute inset-0 z-20 flex items-center justify-center px-10">
          <div className="w-full max-w-sm">
            <div className="bg-slate-900/75 backdrop-blur-[16px] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-5 text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder-slate-700"
                    placeholder="Agent Name" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-5 text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder-slate-700"
                    placeholder="name@research.ai" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 px-5 text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                    placeholder="••••••••" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-white text-black font-black py-4 rounded-2xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-cyan-50'}`}
                >
                  {isLoading ? 'Processing...' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 font-bold hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Signup;
