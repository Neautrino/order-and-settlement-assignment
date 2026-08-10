import React from 'react';
import { Order } from '../../types/domain';

interface OrderDetailPaneProps {
  order: Order | null;
  onClose: () => void;
  onOpenEditModal: (order: Order) => void;
  onOpenPaymentModal: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderDetailPane: React.FC<OrderDetailPaneProps> = ({
  order,
  onClose,
  onOpenEditModal,
  onOpenPaymentModal,
  onDeleteOrder,
}) => {
  if (!order) {
    return (
      <div className="h-full bg-slate-50/50 border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-slate-700">No Order Selected</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Click any order row on the left to view line items, payment history, and actions.
        </p>
      </div>
    );
  }

  const hasPayments = order.totalPaid > 0 || (order.payments && order.payments.length > 0);
  const paidPercent = order.totalAmount > 0 ? Math.min(100, Math.round((order.totalPaid / order.totalAmount) * 100)) : 0;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">PARTIAL</span>;
      case 'OVERDUE':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">OVERDUE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">PENDING</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between h-full animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Top Bar: Order ID, Status, and Deselect Button */}
      <div className="space-y-4 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-slate-900 text-white px-3 py-1 rounded-xl shadow-xs">
              {order.id}
            </span>
            {getStatusBadge(order.status)}
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="Deselect order"
          >
            <span>Close</span>
            <span className="text-sm">✕</span>
          </button>
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{order.customerName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Created on {order.createdAt} • Due {order.dueDate}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        
        {/* Financial Settlement Card */}
        <div className="bg-slate-50/90 border border-slate-200/70 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Settlement Progress</span>
            <span className="font-extrabold text-slate-900">{paidPercent}% Paid</span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                paidPercent === 100 ? 'bg-emerald-500' : paidPercent > 0 ? 'bg-amber-500' : 'bg-slate-400'
              }`}
              style={{ width: `${paidPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
              <p className="text-xs font-black text-slate-900 mt-0.5">
                ${(order.totalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Paid</p>
              <p className="text-xs font-black text-emerald-600 mt-0.5">
                ${(order.totalPaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Due</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">
                ${(order.remainingAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>



        {/* Itemized Line Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Line Items</h4>
            <span className="text-[10px] text-slate-400 font-semibold">{order.items?.length || 0} items</span>
          </div>

          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.itemName}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">${(item.unitPrice / 100).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${((item.quantity * item.unitPrice) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                      No line items recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History Records */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Payment History</h4>
            <span className="text-[10px] text-slate-400 font-semibold">{order.payments?.length || 0} records</span>
          </div>

          {order.payments && order.payments.length > 0 ? (
            <div className="space-y-2">
              {order.payments.map((p) => (
                <div key={p.id} className="bg-slate-50/80 border border-slate-100 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">${(p.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{p.note || 'No reference note'} • {p.paymentDate}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    SETTLED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
              No payments recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* Action Controls Toolbar at Bottom */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        
        {/* Record Payment Button */}
        {order.remainingAmount > 0 && (
          <button
            onClick={() => onOpenPaymentModal(order)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md hover:shadow-lg active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>💳</span>
            <span>Record Payment</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Edit Order Button */}
          <button
            onClick={() => onOpenEditModal(order)}
            disabled={hasPayments}
            className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              hasPayments
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs cursor-pointer'
            }`}
            title={hasPayments ? 'Cannot edit order with existing payments' : 'Edit order items'}
          >
            <span>✏️</span>
            <span>Edit Order</span>
          </button>

          {/* Delete Order Button */}
          <button
            onClick={() => onDeleteOrder(order.id)}
            disabled={hasPayments}
            className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              hasPayments
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 shadow-xs cursor-pointer'
            }`}
            title={hasPayments ? 'Cannot delete order with existing payments' : 'Delete order'}
          >
            <span>🗑️</span>
            <span>Delete Order</span>
          </button>
        </div>

      </div>

    </div>
  );
};
