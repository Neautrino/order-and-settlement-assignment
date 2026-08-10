import React from 'react';

export const ExpenseDonutChart: React.FC = () => {
  const categories = [
    { name: 'Marketing', percent: '35%', amount: '$13,496', color: 'bg-purple-600', strokeColor: '#9333ea' },
    { name: 'Development', percent: '28%', amount: '$10,797', color: 'bg-indigo-500', strokeColor: '#6366f1' },
    { name: 'Operations', percent: '20%', amount: '$7,712', color: 'bg-sky-400', strokeColor: '#38bdf8' },
    { name: 'Customer Support', percent: '10%', amount: '$3,856', color: 'bg-amber-400', strokeColor: '#fbbf24' },
    { name: 'Other', percent: '7%', amount: '$2,699', color: 'bg-slate-300', strokeColor: '#cbd5e1' },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Expense Breakdown</h3>
        <p className="text-[11px] text-slate-500 mb-4">Category allocation</p>

        {/* SVG Donut Ring with Center Total */}
        <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Donut Segment 1: Marketing 35% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#9333ea"
              strokeWidth="14"
              strokeDasharray="83.5 155"
              strokeDashoffset="0"
            />
            {/* Donut Segment 2: Development 28% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#6366f1"
              strokeWidth="14"
              strokeDasharray="66.8 172"
              strokeDashoffset="-83.5"
            />
            {/* Donut Segment 3: Operations 20% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#38bdf8"
              strokeWidth="14"
              strokeDasharray="47.7 191"
              strokeDashoffset="-150.3"
            />
            {/* Donut Segment 4: Customer Support 10% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#fbbf24"
              strokeWidth="14"
              strokeDasharray="23.8 215"
              strokeDashoffset="-198"
            />
            {/* Donut Segment 5: Other 7% */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#cbd5e1"
              strokeWidth="14"
              strokeDasharray="16.7 222"
              strokeDashoffset="-221.8"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[13px] font-extrabold text-slate-900">$38,560</span>
            <span className="text-[10px] font-medium text-slate-400">Total Expenses</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2 mt-5 text-xs">
          {categories.map((c) => (
            <div key={c.name} className="flex items-center justify-between hover:bg-slate-50 p-1 rounded-lg transition">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                {c.name}
              </span>
              <div className="flex items-center gap-3 font-semibold text-slate-900">
                <span className="text-slate-500 font-normal">{c.percent}</span>
                <span>{c.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
