import React from 'react';
import { Order } from '../../types/domain';

interface DashboardMetricsProps {
  orders: Order[];
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ orders }) => {
  const totalOrders = orders.length;
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPaid, 0);
  const totalDue = orders.reduce((sum, o) => sum + o.remainingAmount, 0);
  const overdueCount = orders.filter((o) => o.status === 'OVERDUE').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Metric 1: Total Orders */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Total Orders</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalOrders}</p>
          <p className="text-[11px] text-slate-400 mt-1">Multi-tenant orders</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          📦
        </div>
      </div>

      {/* Metric 2: Settled Revenue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Total Paid / Settled</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            ${(totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Processed payments</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          💳
        </div>
      </div>

      {/* Metric 3: Pending Balance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Remaining Balance</p>
          <p className="text-2xl font-extrabold text-indigo-900 mt-1">
            ${(totalDue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Outstanding dues</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          ⏳
        </div>
      </div>

      {/* Metric 4: Overdue Orders */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Overdue Orders</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{overdueCount}</p>
          <p className="text-[11px] text-rose-500 font-medium mt-1">Past due date</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
          ⚠️
        </div>
      </div>

    </div>
  );
};
