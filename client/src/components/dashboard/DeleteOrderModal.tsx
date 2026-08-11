import React, { useEffect } from 'react';
import { Order } from '../../types/domain';
import { formatCurrency } from '../../utils/currency';

interface DeleteOrderModalProps {
  order: Order | null;
  displayId?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (orderId: string) => void;
}

export const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({
  order,
  displayId,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  // Prevent background page from scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const formattedId = displayId || order.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overscroll-contain">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
              🗑️
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Delete Order Confirmation</h3>
              <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Order Info Card Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-xl shadow-xs">
              {formattedId}
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Name</span>
            <p className="text-sm font-bold text-slate-900 truncate mt-0.5" title={order.customerName}>
              {order.customerName}
            </p>
          </div>
        </div>

        {/* Warning Text */}
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Are you sure you want to delete order <strong className="text-slate-900 font-mono">{formattedId}</strong> for <strong className="text-slate-900">{order.customerName}</strong> totaling <strong className="text-slate-900">{formatCurrency(order.totalAmount)}</strong>?
        </p>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmDelete(order.id);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Confirm Delete</span>
          </button>
        </div>

      </div>
    </div>
  );
};
