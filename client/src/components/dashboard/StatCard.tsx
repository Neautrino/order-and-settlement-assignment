import React from 'react';
import { MetricCardData } from '../../types/domain';

interface StatCardProps extends MetricCardData {
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, amount, change, isPositive, type, onClick }) => {
  // 10 data points per sparkline matching screenshot
  const sparklineData = {
    balance: [
      { x: 5, y: 22 }, { x: 15, y: 14 }, { x: 25, y: 16 }, { x: 35, y: 14 }, 
      { x: 45, y: 22 }, { x: 55, y: 21 }, { x: 65, y: 20 }, { x: 75, y: 10 }, 
      { x: 85, y: 18 }, { x: 95, y: 8 }
    ],
    revenue: [
      { x: 5, y: 22 }, { x: 15, y: 12 }, { x: 25, y: 15 }, { x: 35, y: 10 }, 
      { x: 45, y: 18 }, { x: 55, y: 20 }, { x: 65, y: 10 }, { x: 75, y: 18 }, 
      { x: 85, y: 12 }, { x: 95, y: 16 }
    ],
    expenses: [
      { x: 5, y: 22 }, { x: 15, y: 14 }, { x: 25, y: 15 }, { x: 35, y: 10 }, 
      { x: 45, y: 16 }, { x: 55, y: 22 }, { x: 65, y: 14 }, { x: 75, y: 24 }, 
      { x: 85, y: 18 }, { x: 95, y: 10 }
    ],
    profit: [
      { x: 5, y: 22 }, { x: 15, y: 10 }, { x: 25, y: 18 }, { x: 35, y: 18 }, 
      { x: 45, y: 10 }, { x: 55, y: 20 }, { x: 65, y: 12 }, { x: 75, y: 22 }, 
      { x: 85, y: 14 }, { x: 95, y: 6 }
    ],
  };

  const points = sparklineData[type] || sparklineData.balance;

  // Path string for stroke
  const strokePathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Closed path string for area fill
  const areaPathD = `${strokePathD} L 95 30 L 5 30 Z`;

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-36 cursor-pointer active:scale-98"
    >
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">{amount}</p>
        
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            isPositive ? 'text-emerald-600 bg-emerald-50/80' : 'text-rose-600 bg-rose-50/80'
          }`}>
            {isPositive ? `↑ ${change}` : `↓ ${change}`}
            <span className="text-slate-400 font-normal">vs last month</span>
          </span>
        </div>
      </div>

      {/* Sparkline matching screenshot (purple multi-point line + dots + area fill) */}
      <div className="w-full h-9 mt-1 overflow-hidden">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Translucent Area Fill */}
          <path d={areaPathD} fill={`url(#grad-${type})`} />

          {/* Purple Line */}
          <path
            d={strokePathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Dots on data points */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="1.8"
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
