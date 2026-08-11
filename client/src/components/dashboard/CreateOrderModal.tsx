import React, { useState, useEffect } from 'react';
import { OrderItem } from '../../types/domain';
import { formatCurrency, dollarsToCents } from '../../utils/currency';
import { DatePickerField } from '../ui/DatePickerField';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (orderData: {
    customerName: string;
    dueDate: string;
    items: OrderItem[];
  }) => void;
}

interface FormItem {
  itemName: string;
  quantity: string | number;
  unitPrice: string | number;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<FormItem[]>([
    { itemName: '', quantity: '1', unitPrice: '10.00' },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // System dates for minimum date constraint
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Reset form fields when modal opens & prevent background page scrolling
  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setDueDate('');
      setErrorMsg(null);
      setItems([{ itemName: '', quantity: '1', unitPrice: '10.00' }]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { itemName: '', quantity: '1', unitPrice: '10.00' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculate live total amount in cents dynamically
  const calculatedTotalCents = items.reduce((sum, item) => {
    const qty = Math.max(0, parseInt(String(item.quantity)) || 0);
    const priceDollars = parseFloat(String(item.unitPrice)) || 0;
    const priceCents = dollarsToCents(priceDollars);
    return sum + qty * priceCents;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter a customer name');
      return;
    }

    if (!dueDate) {
      setErrorMsg('Please select a valid future due date');
      return;
    }

    // Frontend due date validation: Must be strictly in the future (tomorrow or later)
    if (dueDate <= todayStr) {
      setDueDate('');
      setErrorMsg('Due date must be in the future (tomorrow or later)');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Please add at least one item');
      return;
    }

    const formattedItems: OrderItem[] = items.map((item) => ({
      itemName: item.itemName.trim(),
      quantity: Math.max(1, parseInt(String(item.quantity)) || 1),
      unitPrice: dollarsToCents(parseFloat(String(item.unitPrice)) || 0),
    }));

    onSubmitOrder({
      customerName: customerName.trim(),
      dueDate,
      items: formattedItems,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overscroll-contain">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create New Order</h3>
            <p className="text-xs text-slate-500 mt-0.5">Matching backend POST /api/orders payload</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                placeholder="Acme Corporation"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
              <DatePickerField
                value={dueDate}
                minDate={tomorrowStr}
                placeholder="Select due date..."
                onChange={(newDate) => {
                  if (newDate <= todayStr) {
                    setDueDate('');
                    setErrorMsg('Due date must be in the future (tomorrow or later)');
                  } else {
                    setDueDate(newDate);
                    setErrorMsg(null);
                  }
                }}
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-900">Order Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative">
                  <div className="flex-1 w-full">
                    <label className="block sm:hidden text-[10px] font-bold text-slate-500 mb-1">Item Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Item Name (e.g. Design License)"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:w-20">
                      <label className="block sm:hidden text-[10px] font-bold text-slate-500 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        value={item.quantity}
                        onWheel={(e) => (e.target as HTMLElement).blur()}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="flex-1 sm:w-28 relative">
                      <label className="block sm:hidden text-[10px] font-bold text-slate-500 mb-1">Unit Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onWheel={(e) => (e.target as HTMLElement).blur()}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer self-end sm:self-center shrink-0"
                        title="Remove Item"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Total Calculation Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Calculated Order Total</span>
              <p className="text-lg font-black text-white">{formatCurrency(calculatedTotalCents)}</p>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-400 px-3 py-1 rounded-full font-bold">
              Verified
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              Create Order
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
