import React from 'react';

interface OrdersFilterBarProps {
  selectedStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onCreateOrderClick: () => void;
}

export const OrdersFilterBar: React.FC<OrdersFilterBarProps> = ({
  selectedStatusFilter,
  onSelectStatusFilter,
  searchQuery,
  onSearchQueryChange,
  onCreateOrderClick,
}) => {
  const filterOptions = ['ALL', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];

  return (
    <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
      
      {/* Status Filter Pills (Scrollable Row) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1">
        {filterOptions.map((st) => {
          const isActive = selectedStatusFilter === st;
          return (
            <button
              key={st}
              onClick={() => onSelectStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Search Input & Create Order CTA */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full md:max-w-lg md:ml-auto">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-2.5 sm:top-2 text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Filter customer or ID..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 sm:pl-9 pr-3 py-2 sm:py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 truncate"
          />
        </div>

        {/* Create Order Button */}
        <button
          onClick={onCreateOrderClick}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-sm hover:shadow active:scale-95 transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <span className="text-sm font-extrabold">+</span>
          <span className="hidden sm:inline">Create Order</span>
          <span className="sm:hidden">New</span>
        </button>

      </div>

    </div>
  );
};

