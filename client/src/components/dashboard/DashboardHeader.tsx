import React from 'react';

interface DashboardHeaderProps {
  userEmail: string;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userEmail,
  onLogout,
  onNavigateHome,
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
      
      {/* Left: Brand Logo & Back to Landing */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-md transform transition hover:scale-105">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DummyPay</span>
        </div>

        <span className="hidden sm:inline-block w-px h-5 bg-slate-200" />
        
        <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
          Order & Settlement Management
        </span>
      </div>

      {/* Right: User Avatar & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline-block text-xs font-medium text-slate-700">
            {userEmail}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3.5 py-1.5 rounded-full border border-slate-200/60 transition cursor-pointer"
        >
          Sign Out
        </button>
      </div>

    </header>
  );
};
