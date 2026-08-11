import React, { useState } from 'react';
import { loginUser, registerUser } from '../../services/auth.service';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onBackToHome: () => void;
  onAuthSuccess: (userEmail: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'register',
  onBackToHome,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Smooth mode transition handler
  const switchMode = (newMode: 'login' | 'register') => {
    if (mode === newMode || isTransitioning) return;
    setIsTransitioning(true);
    setErrorMsg(null);

    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const res = await registerUser(email, password);
        onAuthSuccess(res.user.email);
      } else {
        const res = await loginUser(email, password);
        onAuthSuccess(res.user.email);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative flex flex-col justify-between p-6 lg:p-12 selection:bg-slate-900 selection:text-white overflow-x-hidden">
      
      {/* Decorative Sky & Ambient Layer Matching Landing Page */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-200 bg-linear-to-b from-sky-200/70 via-sky-100/40 to-transparent" />
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-225 h-125 bg-sky-300/30 blur-[120px] rounded-full" />
        <div className="absolute top-50 -left-25 w-96 h-96 bg-purple-300/20 blur-[100px] rounded-full" />
        <div className="absolute top-75 -right-25 w-96 h-96 bg-emerald-200/30 blur-[100px] rounded-full" />
      </div>

      {/* Top Bar Navigation */}
      <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/80 shadow-sm transition group cursor-pointer"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DummyPay</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-4">
        
        {/* Left Side: Headline & Floating SaaS Dashboard Widget Preview */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 pr-0 lg:pr-6">
          
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Financial clarity today <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-slate-900 via-slate-800 to-indigo-900">
                growth tomorrow
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              DummyPay is the all-in-one platform for modern businesses to manage orders, process payments, and scale with confidence.
            </p>
          </div>

          {/* Floating Glassmorphism SaaS Widget Preview (Hidden on small mobile screens) */}
          <div className="hidden sm:block bg-white/80 backdrop-blur-xl border border-white/90 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-5 max-w-md">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  DP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Live Settlement Feed</h4>
                  <p className="text-[11px] text-slate-400">PostgreSQL Transaction Lock</p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Row-Locked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500">Total Revenue</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">$ 124,860.00</p>
                <span className="text-[10px] font-semibold text-emerald-600">↑ 8.2% vs last month</span>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500">Settlement Status</span>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">PAID</p>
                <span className="text-[10px] font-medium text-slate-400">ORD-999C (Acme Inc)</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Real-Time Cash Flow</span>
                <span className="text-indigo-600 font-bold">$98,560.00</span>
              </div>
              <div className="h-9 w-full">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M 0 20 Q 25 5, 50 15 T 100 5"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

          </div>

          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700 pt-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Automated Order Settlements</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-Time Status & Expiry Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Row-Locked Concurrency Safety</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Multi-Tenant JWT Isolation</span>
            </div>
          </div>

        </div>

        {/* Right Side: Floating Card Form */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-20">
            
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                  mode === 'login' 
                    ? 'bg-white text-slate-900 shadow-md scale-100' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                  mode === 'register' 
                    ? 'bg-white text-slate-900 shadow-md scale-100' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                Register
              </button>
            </div>

            {/* Smooth Fading Form Container */}
            <div className={`transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}>
              
              {/* Header inside Card */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {mode === 'register' ? 'Create an Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'register' 
                    ? 'Get started with DummyPay for free in under 2 minutes' 
                    : 'Enter your credentials to access your order dashboard'}
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium flex items-center gap-2">
                  <span>⚠️</span> {errorMsg}
                </div>
              )}

              {/* Form Fields: Email, Password, Confirm Password */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert("Password reset feature active.")}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        /* Eye Off Icon */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.88 9.88a3 3 0 104.24 4.24m2.47-2.47A10.05 10.05 0 0123 11s-4 8-11 8a10.05 10.05 0 01-2.125-.225M3 3l18 18" />
                        </svg>
                      ) : (
                        /* Eye Open Icon */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="transition-all duration-300">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          /* Eye Off Icon */
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.88 9.88a3 3 0 104.24 4.24m2.47-2.47A10.05 10.05 0 0123 11s-4 8-11 8a10.05 10.05 0 01-2.125-.225M3 3l18 18" />
                          </svg>
                        ) : (
                          /* Eye Open Icon */
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:bg-slate-800 active:scale-98 transition flex items-center justify-center gap-2 mt-6 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'register' ? 'Create Account' : 'Sign In to Dashboard'}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switch Link */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                {mode === 'register' ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-slate-900 hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-bold text-slate-900 hover:underline cursor-pointer"
                    >
                      Register free
                    </button>
                  </p>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Footer Trusted Logos Bar */}
      <div className="relative z-10 max-w-7xl mx-auto w-full border-t border-slate-200/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <p>Trusted by financial teams securing cloud-native systems</p>

        <div className="flex items-center gap-6 text-slate-700">
          <span className="flex items-center gap-1 font-bold">☁ Salesforce</span>
          <span className="flex items-center gap-1 font-bold"># Slack</span>
          <span className="flex items-center gap-1 font-bold">N Notion</span>
          <span className="flex items-center gap-1 font-bold">S Stripe</span>
          <span className="flex items-center gap-1 font-bold">Z Zendesk</span>
        </div>
      </div>

    </div>
  );
};
