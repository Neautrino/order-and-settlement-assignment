import React from 'react';

export const CashFlowChart: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep'];
  
  // Heights in %
  const bars = [
    { in: 55, out: 30 },
    { in: 85, out: 40 },
    { in: 40, out: 20 },
    { in: 95, out: 45 },
    { in: 75, out: 35 },
    { in: 90, out: 50 },
    { in: 100, out: 40 },
    { in: 70, out: 30 },
  ];

  // Normalized trendline points
  const points = [
    { left: '6.25%', top: '55%' },
    { left: '18.75%', top: '35%' },
    { left: '31.25%', top: '70%' },
    { left: '43.75%', top: '25%' },
    { left: '56.25%', top: '45%' },
    { left: '68.75%', top: '38%' },
    { left: '81.25%', top: '30%' },
    { left: '93.75%', top: '48%' },
  ];

  const svgPathD = "M 6.25 55 L 18.75 35 L 31.25 70 L 43.75 25 L 56.25 45 L 68.75 38 L 81.25 30 L 93.75 48";

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between animate-fade-in-up">
      {/* Header with fixed non-wrapping legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cash Flow Overview</h3>
          <p className="text-[11px] text-slate-500">Monthly inflows, outflows & net cashflow</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 whitespace-nowrap shrink-0">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" /> Cash in</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-300 shrink-0" /> Cash Out</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0" /> Net Cash Flow</span>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="relative flex items-stretch h-56 pt-2">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between text-[10px] font-medium text-slate-400 pr-3 border-r border-slate-100 select-none shrink-0">
          <span>$100K</span>
          <span>$75K</span>
          <span>$50K</span>
          <span>$25K</span>
          <span>$0</span>
          <span>-$25K</span>
        </div>

        {/* Chart Column Bars Area */}
        <div className="flex-1 relative flex flex-col justify-between pl-2 overflow-hidden">
          
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-2">
            <div className="border-b border-dashed border-slate-100 h-0" />
            <div className="border-b border-dashed border-slate-100 h-0" />
            <div className="border-b border-dashed border-slate-100 h-0" />
            <div className="border-b border-dashed border-slate-100 h-0" />
            <div className="border-b border-slate-300 h-0" /> {/* Zero Line */}
            <div className="border-b border-dashed border-slate-100 h-0" />
          </div>

          {/* Bar Columns */}
          <div className="relative z-10 flex items-end justify-between h-44 pt-4">
            {months.map((month, idx) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div 
                    className="w-2.5 sm:w-3 bg-indigo-600 rounded-t-sm transition-colors duration-300 group-hover:bg-indigo-700 shadow-sm animate-bar-grow" 
                    style={{ height: `${bars[idx].in}%`, animationDelay: `${idx * 0.07 + 0.1}s` }}
                  />
                  <div 
                    className="w-2.5 sm:w-3 bg-purple-300 rounded-t-sm transition-colors duration-300 group-hover:bg-purple-400 animate-bar-grow" 
                    style={{ height: `${bars[idx].out}%`, animationDelay: `${idx * 0.07 + 0.15}s` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-900 transition">{month}</span>
              </div>
            ))}
          </div>

          {/* SVG Line Overlay for Trend Line (grows from left to right) */}
          <div className="absolute inset-0 h-44 pointer-events-none z-20 animate-chart-grow-right" style={{ animationDelay: '0.3s' }}>
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={svgPathD}
                fill="none"
                stroke="#0f172a"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* HTML Perfectly Round Crisp Circles */}
            {points.map((pt, idx) => (
              <div
                key={idx}
                className="absolute w-2.5 h-2.5 bg-slate-900 rounded-full border-2 border-white shadow-sm animate-dot-pop"
                style={{ left: pt.left, top: pt.top, animationDelay: `${idx * 0.1 + 0.4}s` }}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

