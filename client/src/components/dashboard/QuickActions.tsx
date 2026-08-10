import React from 'react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Actions</h3>
        <p className="text-[11px] text-slate-500 mb-4">Execute backend order & payment workflows</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onActionClick("Create Order modal (POST /api/orders)")}
            className="p-3 bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-900">Create Order</span>
          </button>

          <button
            onClick={() => onActionClick("Record Payment modal (POST /api/payments)")}
            className="p-3 bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900">Process Payment</span>
          </button>

          <button
            onClick={() => onActionClick("Calculate Balance API (GET /api/payments/calculate/:id)")}
            className="p-3 bg-slate-50 hover:bg-purple-50/60 border border-slate-100 hover:border-purple-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-900">Calc Balance</span>
          </button>

          <button
            onClick={() => onActionClick("Export Financial Reports")}
            className="p-3 bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-amber-900">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
