import React, { useState } from 'react';
import { Droplet, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (userEmail: string, userName: string) => void;
  farmName: string;
}

export default function Login({ onLogin, farmName }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to prefill administrative credentials
  const handlePrefill = () => {
    setEmail('admin@aeroirrigate.com');
    setPassword('admin123');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your registered email and secure password.');
      return;
    }

    // Basic email pattern validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    // Simulate database lookup/validation with a short visual delay
    setTimeout(() => {
      // Allow general email/password combo, or match specific default admin credentials
      if (email.toLowerCase() === 'admin@aeroirrigate.com' && password !== 'admin123') {
        setError('Incorrect password for this administrator account.');
        setLoading(false);
        return;
      }

      if (password.length < 5) {
        setError('For security, passwords must be at least 5 characters long.');
        setLoading(false);
        return;
      }

      // Generate a user name from the email
      const generatedName = email.split('@')[0]
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      onLogin(email, generatedName);
      setLoading(false);
    }, 750);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-350 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-emerald-100/30 dark:border-slate-850/60 shadow-xl rounded-[32px] p-8 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 mb-3 animate-bounce" style={{ animationDuration: '3s' }}>
            <Droplet className="w-8 h-8" />
          </div>
          <h1 className="font-display font-black text-2xl text-slate-800 dark:text-white tracking-tight">
            AeroIrrigate Local
          </h1>
          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-1">
            Smart Crop Irrigation Portal
          </p>
          <div className="mt-3 px-3 py-1 bg-emerald-50 dark:bg-slate-800/60 rounded-full border border-emerald-100/30">
            <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
              Connecting to: <strong className="text-slate-750 dark:text-slate-300">{farmName}</strong>
            </span>
          </div>
        </div>

        {/* Credentials Prefill Helper Notice Card */}
        <div className="mb-6 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-gray-150 dark:border-slate-800 flex items-start gap-3">
          <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Admin Mode Demo
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-normal">
              Click below to prefill administrative credentials or use any secure profile email of your choice.
            </p>
            <button
              type="button"
              onClick={handlePrefill}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350 underline mt-1.5 transition-colors cursor-pointer"
            >
              Auto-fill admin credentials
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
            <span className="font-medium leading-tight">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">
              Operator Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="email"
                placeholder="operator@farm.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                Operator Security Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Session Remember Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-350 select-none">
                Keep session logged in
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 dark:disabled:bg-slate-850 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying Credentials...
              </span>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Footer Branding */}
      <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono mt-6">
        AeroIrrigate System Core 1.2 — Secure Agri-IoT Framework
      </p>
    </div>
  );
}
