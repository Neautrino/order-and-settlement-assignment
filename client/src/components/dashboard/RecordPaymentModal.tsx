import React, { useState, useEffect } from 'react';
import { Order } from '../../types/domain';
import { centsToDollars, dollarsToCents, formatCurrency } from '../../utils/currency';

interface RecordPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (orderId: string, paymentAmountCents: number, note: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onRecordPayment,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const remainingDollars = centsToDollars(order.remainingAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const paymentDollars = parseFloat(amountInput);
    if (isNaN(paymentDollars) || paymentDollars <= 0) {
      setErrorMsg('Please enter a valid payment amount');
      return;
    }

    const paymentCents = dollarsToCents(paymentDollars);

    if (paymentCents > order.remainingAmount) {
      setErrorMsg(`Payment amount (${formatCurrency(paymentCents)}) exceeds remaining balance (${formatCurrency(order.remainingAmount)})`);
      return;
    }

    onRecordPayment(order.id, paymentCents, note);
    onClose();
  };

  const setFullAmount = () => {
    setAmountInput(remainingDollars.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overscroll-contain">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Record Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">Matching POST /api/payments rules</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Order Info Badge */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400">Order #{order.id}</span>
            <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-indigo-900">Remaining Balance</span>
            <p className="text-base font-extrabold text-indigo-900">{formatCurrency(order.remainingAmount)}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Payment Amount ($)</label>
              <button
                type="button"
                onClick={setFullAmount}
                className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Pay Full Balance ({formatCurrency(order.remainingAmount)})
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingDollars}
                required
                placeholder="0.00"
                value={amountInput}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Note / Reference (Optional)</label>
            <input
              type="text"
              placeholder="Wire Transfer Ref #88219"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              Confirm Payment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
