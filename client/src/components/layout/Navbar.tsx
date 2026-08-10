import React from 'react';

interface NavbarProps {
  onActionClick: (actionName: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onActionClick, onOpenAuth }) => {
  return (
    <header className="flex items-center justify-between py-3.5 px-6 rounded-full bg-white/75 backdrop-blur-md border border-white/60 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onActionClick("Home")}>
        <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-md transform transition hover:scale-105">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">DummyPay</span>
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <button onClick={() => onActionClick("Product Navigation")} className="flex items-center gap-1 hover:text-slate-900 transition">
          Product
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <button onClick={() => onActionClick("Solutions Navigation")} className="hover:text-slate-900 transition">Solutions</button>
        <button onClick={() => onActionClick("Pricing Navigation")} className="hover:text-slate-900 transition">Pricing</button>
        <button onClick={() => onActionClick("Docs Navigation")} className="hover:text-slate-900 transition">Docs</button>
        <button onClick={() => onActionClick("Resources Navigation")} className="flex items-center gap-1 hover:text-slate-900 transition">
          Resources
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </nav>

      {/* Auth Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onOpenAuth('login')} 
          className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 transition cursor-pointer"
        >
          Sign In
        </button>
        <button 
          onClick={() => onOpenAuth('register')} 
          className="text-sm font-semibold bg-white text-slate-900 border border-slate-200/80 px-5 py-2.5 rounded-full shadow-sm hover:shadow hover:bg-slate-50 active:scale-95 transition cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </header>
  );
};
