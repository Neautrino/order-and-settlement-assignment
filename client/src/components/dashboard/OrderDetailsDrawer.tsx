import React from 'react';
import { Order } from '../../types/domain';

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEditModal: (order: Order) => void;
  onOpenPaymentModal: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onOpenEditModal,
  onOpenPaymentModal,
  onDeleteOrder,
}) => {
  if (!isOpen || !order) return null;

  const paidPercentage = Math.min(
    100,
    Math.round((order.totalPaid / order.totalAmount) * 100) || 0
  );

  const hasPayments = order.totalPaid > 0 || (order.payments && order.payments.length > 0);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">✓ PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">⏳ PARTIALLY PAID</span>;
      case 'OVERDUE':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">⚠️ OVERDUE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">⏱ PENDING</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-right duration-300">
          
          <div className="space-y-6">
            
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-md">
                  ORD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Customer: <strong className="text-slate-800">{order.customerName}</strong></p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Amount</span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    ${(order.totalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase">Amount Paid</span>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    ${(order.totalPaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-indigo-900 uppercase">Remaining Due</span>
                  <p className="text-base font-extrabold text-indigo-900 mt-0.5">
                    ${(order.remainingAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Settlement Progress</span>
                  <span>{paidPercentage}% Paid</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${paidPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium">Due Date:</span>{' '}
                <strong className="text-slate-800">{order.dueDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Created On:</span>{' '}
                <strong className="text-slate-800">{order.createdAt || 'Recent'}</strong>
              </div>
            </div>

            {/* Line Items Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Line Items ({order.items?.length || 0})</h4>
              
              <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3.5">Item Name</th>
                      <th className="py-2.5 px-3.5 text-center">Qty</th>
                      <th className="py-2.5 px-3.5 text-right">Unit Price</th>
                      <th className="py-2.5 px-3.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => {
                        const subtotal = (item.quantity * item.unitPrice) / 100;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3.5 font-semibold text-slate-900">{item.itemName}</td>
                            <td className="py-2.5 px-3.5 text-center font-medium">{item.quantity}</td>
                            <td className="py-2.5 px-3.5 text-right font-medium">
                              ${(item.unitPrice / 100).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">
                              ${subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          No line items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History Log */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Records ({order.payments?.length || 0})</h4>
              
              {order.payments && order.payments.length > 0 ? (
                <div className="space-y-2">
                  {order.payments.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-bold text-slate-900">${(p.amount / 100).toFixed(2)} Paid</p>
                          {p.note && <p className="text-[11px] text-slate-500 italic">Note: "{p.note}"</p>}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{p.paymentDate || 'Recent'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                  No payment records logged yet.
                </div>
              )}
            </div>

          </div>

          {/* Drawer Actions Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
            
            {/* Payment & Edit Actions Row */}
            <div className="grid grid-cols-2 gap-3">
              {order.status !== 'PAID' ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPaymentModal(order);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>💳 Record Payment</span>
                </button>
              ) : (
                <div className="py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-extrabold text-center border border-emerald-200">
                  ✓ Order Fully Paid
                </div>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenEditModal(order);
                }}
                disabled={hasPayments}
                className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  hasPayments
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer'
                }`}
                title={hasPayments ? 'Cannot edit orders with recorded payments' : 'Edit order items'}
              >
                <span>✏️ Edit Order</span>
              </button>
            </div>

            {/* Delete Action Button */}
            <button
              onClick={() => {
                onClose();
                onDeleteOrder(order.id);
              }}
              disabled={hasPayments}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                hasPayments
                  ? 'bg-slate-50 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
              }`}
            >
              <span>🗑️ Delete Order</span>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
