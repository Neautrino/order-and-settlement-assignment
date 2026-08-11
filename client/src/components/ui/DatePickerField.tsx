import React, { useState, useEffect, useRef } from 'react';

interface DatePickerFieldProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (dateStr: string) => void;
  minDate?: string; // Format: YYYY-MM-DD (e.g. tomorrowStr)
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  minDate,
  disabled = false,
  placeholder = 'Select due date...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse today's system date for highlighting current system date
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth(); // 0-indexed
  const todayDay = now.getDate();
  const todayStr = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;

  // Parse currently selected date if available
  let selectedDateObj: Date | null = null;
  if (value) {
    const parts = value.split('-').map(Number);
    if (parts.length === 3) {
      selectedDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  // Viewport month & year state for calendar navigation
  const [viewYear, setViewYear] = useState<number>(selectedDateObj ? selectedDateObj.getFullYear() : todayYear);
  const [viewMonth, setViewMonth] = useState<number>(selectedDateObj ? selectedDateObj.getMonth() : todayMonth);

  // Sync view when value changes from outside
  useEffect(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [value]);

  // Close calendar popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days grid (Monday first)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // Convert Sun=0 to Mon=0 (0: Mon, 1: Tue, ..., 6: Sun)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;

  const daysGrid: ({ day: number; monthOffset: number; dateStr: string } | null)[] = [];

  // Trailing days from previous month
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const pMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const pYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    daysGrid.push({ day: dayNum, monthOffset: -1, dateStr });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ day: d, monthOffset: 0, dateStr });
  }

  // Leading days from next month to complete grid
  const remainingCells = (7 - (daysGrid.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    const nMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    daysGrid.push({ day: n, monthOffset: 1, dateStr });
  }

  const handleSelectDate = (dateStr: string, isPastDisabled: boolean) => {
    if (isPastDisabled || disabled) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Helper formatting for display input button
  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-').map(Number);
    if (parts.length !== 3) return dStr;
    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
    return dObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div ref={containerRef} className="relative w-full">
      
      {/* Display Field Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs flex items-center justify-between transition cursor-pointer select-none ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-slate-300 focus-within:ring-2 focus-within:ring-slate-900'
        } ${className}`}
      >
        <span className={value ? 'font-bold text-slate-900' : 'text-slate-400'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        
        <div className="flex items-center gap-1 text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Custom Popup Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs transition cursor-pointer"
              title="Previous Month"
            >
              ‹
            </button>
            
            <div className="font-extrabold text-slate-900 text-xs tracking-tight">
              {monthNames[viewMonth]} {viewYear}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs transition cursor-pointer"
              title="Next Month"
            >
              ›
            </button>
          </div>

          {/* Weekday Labels (Mo - Su) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((w) => (
              <span key={w} className="text-[10px] font-bold text-slate-400 uppercase">
                {w}
              </span>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((item, idx) => {
              if (!item) return <div key={idx} />;

              const isToday = item.dateStr === todayStr;
              const isSelected = item.dateStr === value;
              const isPastDisabled = !!minDate && item.dateStr < minDate;
              const isOtherMonth = item.monthOffset !== 0;

              let dayStyle = 'text-slate-800 hover:bg-slate-100 font-semibold cursor-pointer';

              if (isSelected) {
                dayStyle = 'bg-slate-900 text-white font-extrabold shadow-sm';
              } else if (isToday && isPastDisabled) {
                // Highlight today visually with light blue box, but disable picking
                dayStyle = 'bg-indigo-50 border border-indigo-200 text-indigo-400 font-bold cursor-not-allowed select-none';
              } else if (isPastDisabled) {
                dayStyle = 'text-slate-300 bg-slate-50/30 cursor-not-allowed font-normal';
              } else if (isToday) {
                dayStyle = 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-300 hover:bg-indigo-100 cursor-pointer';
              } else if (isOtherMonth) {
                dayStyle = 'text-slate-400 hover:bg-slate-50 font-normal';
              }

              return (
                <button
                  type="button"
                  key={idx}
                  disabled={isPastDisabled}
                  onClick={() => handleSelectDate(item.dateStr, isPastDisabled)}
                  className={`h-7 rounded-lg text-xs flex items-center justify-center transition relative ${dayStyle}`}
                  title={isToday ? 'Today (Current Date)' : undefined}
                >
                  <span>{item.day}</span>
                </button>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
