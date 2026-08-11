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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
      
      {/* Logo & Workspace Title */}
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={onNavigateHome}
          title="Go to landing page"
        >
          <div className="w-10 h-10 bg-slate-900 group-hover:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md transition">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight text-xl">DummyPay</span>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
              App
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="hidden sm:block">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Order & Settlement Engine</h2>
        </div>
      </div>

      {/* Top Right User Profile Card */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-1.5 flex items-center gap-3 shadow-xs">
          <div className="w-7 h-7 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-slate-900 truncate max-w-35 sm:max-w-45">
            {userEmail}
          </span>
          <button
            onClick={onLogout}
            className="text-[11px] font-bold text-rose-600 hover:bg-rose-100/70 px-2 py-0.5 rounded-lg transition cursor-pointer shrink-0 ml-1"
            title="Sign Out"
          >
            Exit
          </button>
        </div>
      </div>

    </header>
  );
};
