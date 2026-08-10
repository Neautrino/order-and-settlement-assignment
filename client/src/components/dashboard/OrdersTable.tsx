import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/domain';

interface OrdersTableProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onOrderClick }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">PARTIALLY PAID</span>;
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">PENDING</span>;
      case 'OVERDUE':
        return <span className="bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">OVERDUE</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Orders & Settlements</h3>
            <p className="text-[11px] text-slate-500">Live feed matching PostgreSQL DB domain models</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-2.5 px-2.5 whitespace-nowrap">Order ID</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Customer</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Total Amount</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Paid</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Due Balance</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Due Date</th>
                <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => onOrderClick && onOrderClick(order)}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                >
                  <td className="py-3 px-2.5 font-mono font-medium text-slate-600 whitespace-nowrap">{order.id}</td>
                  <td className="py-3 px-2.5 font-semibold text-slate-900 whitespace-nowrap">{order.customerName}</td>
                  <td className="py-3 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                    ${(order.totalAmount / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-2.5 text-emerald-600 font-semibold whitespace-nowrap">
                    ${(order.totalPaid / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-2.5 text-slate-700 font-medium whitespace-nowrap">
                    ${(order.remainingAmount / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-2.5 text-slate-500 whitespace-nowrap">{order.dueDate}</td>
                  <td className="py-3 px-2.5 text-center whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
