import React, { useState, useEffect } from 'react';
import { Order } from '../../types/domain';
import { centsToDollars, dollarsToCents, formatCurrency } from '../../utils/currency';
import { calculateOrderBalance } from '../../services/order.service';
import { SwipeButton } from '../ui/SwipeButton';

interface RecordPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (orderId: string, paymentAmountCents: number, note: string) => void;
}

interface CalculatedBalance {
  orderId: string;
  status: string;
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedData, setCalculatedData] = useState<CalculatedBalance | null>(null);

  // Call calculate API on modal open & manage body scroll lock
  useEffect(() => {
    if (isOpen && order) {
      document.body.style.overflow = 'hidden';
      setErrorMsg(null);
      setNote('');
      setCalculatedData(null);
      setIsCalculating(true);

      calculateOrderBalance(order.id)
        .then((data) => {
          setCalculatedData(data);
          const dollars = centsToDollars(data.remainingAmount);
          setAmountInput(dollars > 0 ? dollars.toFixed(2) : '0.00');
        })
        .catch(() => {
          const dollars = centsToDollars(order.remainingAmount);
          setAmountInput(dollars > 0 ? dollars.toFixed(2) : '0.00');
        })
        .finally(() => setIsCalculating(false));
    } else {
      document.body.style.overflow = '';
      setAmountInput('');
      setNote('');
      setErrorMsg(null);
      setIsSubmitting(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const totalAmountCents = calculatedData?.totalAmount ?? order.totalAmount;
  const totalPaidCents = calculatedData?.totalPaid ?? order.totalPaid;
  const remainingCents = calculatedData?.remainingAmount ?? order.remainingAmount;
  const remainingDollars = centsToDollars(remainingCents);


  const handleSwipeSubmit = () => {
    setErrorMsg(null);
    const dollars = parseFloat(amountInput);
    if (isNaN(dollars) || dollars <= 0) {
      setErrorMsg('Please enter a valid payment amount');
      return;
    }
    const cents = dollarsToCents(dollars);
    if (cents > remainingCents) {
      setErrorMsg(`Payment amount (${formatCurrency(cents)}) exceeds remaining balance (${formatCurrency(remainingCents)})`);
      return;
    }
    setIsSubmitting(true);
    try {
      onRecordPayment(order.id, cents, note);
      setTimeout(() => onClose(), 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit payment');
      setIsSubmitting(false);
    }
  };

  const isAmountInvalid = () => {
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) return true;
    return dollarsToCents(val) > remainingCents;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overscroll-contain">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Record Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">{order.customerName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Order Balance Summary — matches the dark banner from Create/Edit modals */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl">
          {isCalculating ? (
            <div className="flex items-center justify-center gap-2 py-1">
              <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-slate-400 font-medium">Calculating balance...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Remaining Balance</span>
                <p className="text-lg font-black text-white">{formatCurrency(remainingCents)}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[11px] text-slate-400">
                  Total: <span className="text-slate-200 font-semibold">{formatCurrency(totalAmountCents)}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Paid: <span className="text-emerald-400 font-semibold">{formatCurrency(totalPaidCents)}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingDollars}
                required
                disabled={isSubmitting || remainingCents <= 0}
                placeholder="0.00"
                value={amountInput}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onChange={(e) => { setErrorMsg(null); setAmountInput(e.target.value); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60"
              />
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Note / Reference (Optional)</label>
            <input
              type="text"
              disabled={isSubmitting}
              placeholder="Wire Transfer Ref #88219"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Swipe to Pay + Cancel */}
        <div className="space-y-3 pt-2">
          <SwipeButton
            onSwipeComplete={handleSwipeSubmit}
            disabled={isAmountInvalid() || remainingCents <= 0}
            isLoading={isSubmitting}
            resetKey={amountInput}
            label={
              remainingCents <= 0
                ? 'Order Already Fully Paid'
                : amountInput && !isNaN(parseFloat(amountInput)) && parseFloat(amountInput) > 0
                ? `Swipe to Pay ${formatCurrency(dollarsToCents(parseFloat(amountInput)))}`
                : 'Swipe to Confirm Payment'
            }
            successLabel="Payment Confirmed ✓"
          />

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
