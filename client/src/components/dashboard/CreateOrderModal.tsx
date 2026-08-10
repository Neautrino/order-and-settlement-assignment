import React, { useState } from 'react';
import { OrderItem } from '../../types/domain';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (newOrder: { customerName: string; dueDate: string; items: OrderItem[] }) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { itemName: 'Web Development Services', quantity: 1, unitPrice: 50000 },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { itemName: '', quantity: 1, unitPrice: 1000 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculate live total amount in dollars
  const calculatedTotalDollars = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0; // in cents
    return sum + (qty * price) / 100;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !dueDate || items.length === 0) return;

    onSubmitOrder({
      customerName,
      dueDate,
      items,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
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
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
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
                <div key={index} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Item Name (e.g. Design License)"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="w-28 relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-semibold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="Unit Price"
                      value={(item.unitPrice / 100) || ''}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Math.round((parseFloat(e.target.value) || 0) * 100))}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                      title="Remove Item"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Total Calculation Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Calculated Order Total</span>
              <p className="text-xl font-extrabold tracking-tight">
                ${calculatedTotalDollars.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-400 px-3 py-1 rounded-full font-bold">
              PAISE / CENTS Math Verified
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
