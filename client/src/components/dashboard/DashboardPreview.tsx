import React, { useState, useRef, useEffect } from 'react';
import { StatCard } from './StatCard';
import { CashFlowChart } from './CashFlowChart';
import { ExpenseDonutChart } from './ExpenseDonutChart';
import { MetricCardData } from '../../types/domain';

interface DashboardPreviewProps {
  onActionClick?: (action: string) => void;
  onNavigateDashboard?: () => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ onActionClick, onNavigateDashboard }) => {
  const [dateRange, setDateRange] = useState('May 1 - May 31, 2024');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateOptions = [
    'May 1 - May 31, 2024',
    'Apr 1 - Apr 30, 2024',
    'Last 6 Months',
    'Year to Date',
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = ['Overview', 'Accounts', 'Transactions', 'Payments', 'Invoices', 'Reports', 'Settings'];

  const metrics: MetricCardData[] = [
    { title: 'Total Balance', amount: '$ 98,560.00', change: '12.5%', isPositive: true, type: 'balance' },
    { title: 'Total Revenue', amount: '$ 124,860.00', change: '8.2%', isPositive: true, type: 'revenue' },
    { title: 'Total Expenses', amount: '$ 38,560.00', change: '3.1%', isPositive: false, type: 'expenses' },
    { title: 'Net Profit', amount: '$ 86,300.00', change: '16.3%', isPositive: true, type: 'profit' },
  ];

  return (
    <section className="mt-12">
      <div className="bg-white/80 backdrop-blur-xl border border-white/80 shadow-2xl rounded-3xl p-3 sm:p-6 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 bg-slate-50/70 border border-slate-100 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 px-2 py-1 mb-3 lg:mb-6">
                <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 tracking-tight">DummyPay</span>
              </div>

              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                {navItems.map((item) => {
                  const isActive = item === 'Overview';
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {}}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap lg:w-full cursor-pointer ${
                        isActive 
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-xs active:scale-98'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                      {item}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="hidden lg:flex mt-8 pt-4 border-t border-slate-200/60 items-center justify-between px-2 cursor-pointer hover:bg-white/60 p-2 rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                  DP
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">DummyPay Demo</p>
                  <p className="text-[11px] text-slate-500">Demo Account</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Bar with Custom Sleek Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Order settlements, balances & real-time analytics</p>
              </div>

              {/* Custom Styled Date Range Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-white border border-slate-900 text-slate-800 font-semibold px-4 py-1.5 rounded-full shadow-sm hover:shadow transition flex items-center gap-2 text-xs cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{dateRange}</span>
                  <svg 
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 transition-all transform origin-top-right">
                    {dateOptions.map((option) => {
                      const isSelected = dateRange === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setDateRange(option);
                            setIsDropdownOpen(false);
                            if (onActionClick) onActionClick(`Date range changed to ${option}`);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between transition ${
                            isSelected 
                              ? 'bg-slate-900 text-white font-semibold' 
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m, idx) => (
                <StatCard key={m.title} {...m} index={idx} />
              ))}
            </div>

            {/* Charts Section matching screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <CashFlowChart />
              </div>
              <div className="lg:col-span-5">
                <ExpenseDonutChart />
              </div>
            </div>

          </main>
        </div>
      </div>
    </section>
  );
};


