import React from 'react';
import { Order } from '../../types/domain';
import { formatCurrency } from '../../utils/currency';

interface OrdersMasterTableProps {
  orders: Order[];
  viewingOrderId?: string;
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelectOrder: (order: Order) => void;
  getDisplayOrderId: (orderId: string) => string;
}

export const OrdersMasterTable: React.FC<OrdersMasterTableProps> = ({
  orders,
  viewingOrderId,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onSelectOrder,
  getDisplayOrderId,
}) => {
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">
            PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">
            PARTIAL
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">
            OVERDUE
          </span>
        );
      default:
        return (
          <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs relative flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-2.5 sm:px-3.5 whitespace-nowrap">Order / Customer</th>
              <th className="py-3 px-2.5 sm:px-3.5 text-right whitespace-nowrap">Total</th>
              <th className="py-3 px-2.5 sm:px-3.5 text-right whitespace-nowrap hidden sm:table-cell">Paid</th>
              <th className="py-3 px-2.5 sm:px-3.5 text-center whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {orders.length > 0 ? (
              orders.map((order) => {
                const isSelected = viewingOrderId === order.id;
                const displayId = getDisplayOrderId(order.id);
                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className={`cursor-pointer transition group ${
                      isSelected
                        ? 'bg-indigo-50/80 text-indigo-950 font-bold border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-2.5 sm:px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 group-hover:text-indigo-600">
                        <span>{displayId}</span>
                        {isSelected && <span className="text-[10px] text-indigo-600">●</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate max-w-28 sm:max-w-36">
                        {order.customerName}
                      </p>
                    </td>

                    <td className="py-3 px-2.5 sm:px-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="py-3 px-2.5 sm:px-3.5 text-right font-semibold text-emerald-600 whitespace-nowrap hidden sm:table-cell">
                      {formatCurrency(order.totalPaid)}
                    </td>

                    <td className="py-3 px-2.5 sm:px-3.5 text-center whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No orders found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200/60 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load More Orders</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};


