import React, { useState } from 'react';

interface NavbarProps {
  onActionClick: (actionName: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onActionClick, onOpenAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (actionName: string) => {
    onActionClick(actionName);
    setIsMobileMenuOpen(false);
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    onOpenAuth(mode);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative z-30">
      <div className="flex items-center justify-between py-3.5 px-4 sm:px-6 rounded-full bg-white/75 backdrop-blur-md border border-white/60 shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => handleNavClick("Home")}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-md transform transition hover:scale-105">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">DummyPay</span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
          <button onClick={() => handleNavClick("Product Navigation")} className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer active:scale-95">
            Product
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={() => handleNavClick("Solutions Navigation")} className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer active:scale-95">Solutions</button>
          <button onClick={() => handleNavClick("Pricing Navigation")} className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer active:scale-95">Pricing</button>
          <button onClick={() => handleNavClick("Docs Navigation")} className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer active:scale-95">Docs</button>
          <button onClick={() => handleNavClick("Resources Navigation")} className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer active:scale-95">
            Resources
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </nav>

        {/* Auth Actions & Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <button 
              onClick={() => handleAuthClick('login')} 
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-full hover:bg-slate-100/80 transition-all cursor-pointer active:scale-95"
            >
              Sign In
            </button>
            <button 
              onClick={() => handleAuthClick('register')} 
              className="text-xs sm:text-sm font-bold bg-slate-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100/80 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">
            <button onClick={() => handleNavClick("Product Navigation")} className="text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer">Product</button>
            <button onClick={() => handleNavClick("Solutions Navigation")} className="text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer">Solutions</button>
            <button onClick={() => handleNavClick("Pricing Navigation")} className="text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer">Pricing</button>
            <button onClick={() => handleNavClick("Docs Navigation")} className="text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer">Docs</button>
            <button onClick={() => handleNavClick("Resources Navigation")} className="text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer">Resources</button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button 
              onClick={() => handleAuthClick('login')} 
              className="w-full text-center text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => handleAuthClick('register')} 
              className="w-full text-center text-xs font-bold bg-slate-900 text-white py-2.5 rounded-xl shadow-sm hover:bg-slate-800 transition cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

