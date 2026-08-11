import React, { useState } from 'react';
import { Order } from '../../types/domain';
import { formatCurrency } from '../../utils/currency';

interface OrderDetailPaneProps {
  order: Order | null;
  displayId?: string;
  onClose: () => void;
  onOpenEditModal: (order: Order) => void;
  onOpenPaymentModal: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderDetailPane: React.FC<OrderDetailPaneProps> = ({
  order,
  displayId,
  onClose,
  onOpenEditModal,
  onOpenPaymentModal,
  onDeleteOrder,
}) => {
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(true);

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

  const formattedDisplayId = displayId || order.id;
  const hasPayments = order.totalPaid > 0 || (order.payments && order.payments.length > 0);
  const paidPercent = order.totalAmount > 0 ? Math.min(100, Math.round((order.totalPaid / order.totalAmount) * 100)) : 0;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shrink-0 transition-colors duration-700">PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shrink-0 transition-colors duration-700">PARTIAL</span>;
      case 'OVERDUE':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shrink-0 transition-colors duration-700">OVERDUE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shrink-0 transition-colors duration-700">PENDING</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between h-full">
      
      {/* Top Bar: Order ID, Status, and Deselect Button */}
      <div className="space-y-4 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-xl shadow-xs shrink-0 transition-all duration-300">
              {formattedDisplayId}
            </span>
            {getStatusBadge(order.status)}
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Deselect order"
          >
            <span>Close</span>
            <span className="text-sm">✕</span>
          </button>
        </div>

        <div key={order.id} className="min-w-0 animate-in fade-in duration-700">
          <h3 className="text-xl font-black text-slate-900 tracking-tight truncate transition-all duration-700" title={order.customerName}>
            {order.customerName}
          </h3>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5 select-all break-all truncate transition-all duration-700" title={order.id}>
            <span className="font-semibold text-slate-400/80">ID:</span> {order.id}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1 truncate transition-all duration-700">
            Created on {order.createdAt?.split('T')[0]} • Due {order.dueDate?.split('T')[0]}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        
        {/* Financial Settlement Card with Smooth Width Transition */}
        <div className="bg-slate-50/90 border border-slate-200/70 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Settlement Progress</span>
            <span className="font-extrabold text-slate-900 transition-all duration-500">{paidPercent}% Paid</span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                paidPercent === 100 ? 'bg-emerald-500' : paidPercent > 0 ? 'bg-amber-500' : 'bg-slate-400'
              }`}
              style={{ width: `${paidPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
              <p className="text-xs font-black text-slate-900 mt-0.5 truncate transition-all duration-700">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Paid</p>
              <p className="text-xs font-black text-emerald-600 mt-0.5 truncate transition-all duration-700">
                {formatCurrency(order.totalPaid)}
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Due</p>
              <p className="text-xs font-black text-slate-800 mt-0.5 truncate transition-all duration-700">
                {formatCurrency(order.remainingAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Line Items Table with Top-to-Bottom Unfolding Animation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Line Items</h4>
            <span className="text-[10px] text-slate-400 font-semibold">{order.items?.length || 0} items</span>
          </div>

          <div
            key={`items-${order.id}`}
            className="bg-slate-50/50 rounded-2xl border border-slate-100 shadow-xs animate-unfold-down"
          >
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
                    <tr key={item.id} className="hover:bg-white transition-colors duration-200">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-37.5 sm:max-w-50 truncate" title={item.itemName}>
                        {item.itemName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(item.quantity * item.unitPrice)}
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

        {/* Collapsible Payment History Accordion with Smooth Fade Transition */}
        <div key={`payments-${order.id}`} className="space-y-2 animate-in fade-in duration-300">
          
          {/* Accordion Toggle Header */}
          <button
            type="button"
            onClick={() => setIsPaymentsOpen(!isPaymentsOpen)}
            className="w-full flex items-center justify-between text-left group cursor-pointer py-1 focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider group-hover:text-slate-900">
                Payment History
              </h4>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/60">
                {order.payments?.length || 0} records
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-700 font-bold transition">
              <span>{isPaymentsOpen ? 'Hide' : 'Show'}</span>
              <span className={`text-[10px] transform transition-transform duration-200 ${isPaymentsOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
          </button>

          {/* Accordion Content with Smooth Height & Opacity Transition */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isPaymentsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
          >
            <div className="overflow-hidden space-y-2">
              {order.payments && order.payments.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {order.payments.map((p) => {
                    const formattedNote = p.note ? p.note : 'No reference note';
                    const formattedDate = p.paymentDate?.split('T')[0] || '';
                    return (
                      <div 
                        key={p.id} 
                        className="bg-slate-50/80 border border-slate-100 p-3 rounded-2xl flex items-center justify-between text-xs gap-3 hover:bg-slate-100/60 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                          <p 
                            className="text-[10px] text-slate-400 font-medium truncate max-w-50 sm:max-w-75" 
                            title={`${formattedNote} • ${formattedDate}`}
                          >
                            {formattedNote} • {formattedDate}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                          SETTLED
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                  No payments recorded yet.
                </div>
              )}
            </div>
          </div>

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
