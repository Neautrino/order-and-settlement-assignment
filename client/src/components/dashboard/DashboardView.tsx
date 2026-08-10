import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '../../types/domain';
import { CreateOrderModal } from './CreateOrderModal';
import { EditOrderModal } from './EditOrderModal';
import { OrderDetailPane } from './OrderDetailPane';
import { RecordPaymentModal } from './RecordPaymentModal';
import {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  recordPayment,
} from '../../services/order.service';
import { formatCurrency } from '../../utils/currency';

interface DashboardViewProps {
  userEmail: string;
  onLogout: () => void;
  onNavigateHome: () => void;
}

const initialOrders: Order[] = [
  {
    id: 'order_001',
    customerName: 'Acme Corporation',
    status: 'PAID',
    totalAmount: 1250000, // $12,500.00
    totalPaid: 1250000,
    remainingAmount: 0,
    dueDate: '2026-08-15',
    createdAt: '2026-08-01',
    items: [
      { id: 'item_1', itemName: 'Enterprise Cloud License (Annual)', quantity: 1, unitPrice: 1000000 },
      { id: 'item_2', itemName: 'Premium Support Add-on', quantity: 1, unitPrice: 250000 },
    ],
    payments: [
      { id: 'pay_1', orderId: 'order_001', amount: 1250000, note: 'Full Wire Transfer #9921', paymentDate: '2026-08-05' },
    ],
  },
  {
    id: 'order_002',
    customerName: 'CloudScale Technologies',
    status: 'PARTIALLY_PAID',
    totalAmount: 850000, // $8,500.00
    totalPaid: 350000,   // $3,500.00
    remainingAmount: 500000,
    dueDate: '2026-08-25',
    createdAt: '2026-08-03',
    items: [
      { id: 'item_3', itemName: 'Database Clustering Node', quantity: 2, unitPrice: 300000 },
      { id: 'item_4', itemName: 'Storage Allocation 10TB', quantity: 1, unitPrice: 250000 },
    ],
    payments: [
      { id: 'pay_2', orderId: 'order_002', amount: 350000, note: 'Initial 40% Deposit', paymentDate: '2026-08-06' },
    ],
  },
  {
    id: 'order_003',
    customerName: 'GlobalTech Solutions',
    status: 'OVERDUE',
    totalAmount: 420000, // $4,200.00
    totalPaid: 0,
    remainingAmount: 420000,
    dueDate: '2026-07-28',
    createdAt: '2026-07-10',
    items: [
      { id: 'item_5', itemName: 'Security Audit & Compliance Test', quantity: 1, unitPrice: 420000 },
    ],
    payments: [],
  },
  {
    id: 'order_004',
    customerName: 'Nexus Dynamics',
    status: 'PENDING',
    totalAmount: 680000, // $6,800.00
    totalPaid: 0,
    remainingAmount: 680000,
    dueDate: '2026-08-30',
    createdAt: '2026-08-08',
    items: [
      { id: 'item_6', itemName: 'Custom API Gateway Integration', quantity: 1, unitPrice: 680000 },
    ],
    payments: [],
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  userEmail,
  onLogout,
  onNavigateHome,
}) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Active Selected Order Workspace State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(orders[0]); // Default to first order
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const loadOrdersFromApi = async (selectOrderId?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);

      const targetId = selectOrderId || viewingOrder?.id || (data.length > 0 ? data[0].id : null);
      if (targetId) {
        try {
          const detail = await fetchOrderById(targetId);
          setViewingOrder(detail);
        } catch {
          const found = data.find((o) => o.id === targetId);
          if (found) setViewingOrder(found);
        }
      } else {
        setViewingOrder(null);
      }
    } catch (err: any) {
      console.warn('Backend API connection falling back to client state:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersFromApi();
  }, []);

  const handleSelectOrderRow = async (order: Order) => {
    setViewingOrder(order);
    try {
      const fullDetail = await fetchOrderById(order.id);
      setViewingOrder((current) => (current?.id === order.id ? fullDetail : current));
    } catch {
      // Fallback to existing order object if single fetch unavailable
    }
  };

  const handleCreateOrderSubmit = async (newOrderData: { customerName: string; dueDate: string; items: OrderItem[] }) => {
    try {
      const created = await createOrder({
        customerName: newOrderData.customerName,
        dueDate: newOrderData.dueDate,
        items: newOrderData.items.map((i) => ({
          itemName: i.itemName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });

      showAlert(`Order #${created.id} created successfully!`);
      await loadOrdersFromApi(created.id);
    } catch (err: any) {
      // Fallback to local state creation if offline / demo mode
      const totalAmount = newOrderData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const nextIdNum = orders.length + 1;
      const formattedId = `order_${String(nextIdNum).padStart(3, '0')}`;

      const newOrder: Order = {
        id: formattedId,
        customerName: newOrderData.customerName,
        status: 'PENDING',
        totalAmount,
        totalPaid: 0,
        remainingAmount: totalAmount,
        dueDate: newOrderData.dueDate,
        createdAt: new Date().toISOString().split('T')[0],
        items: newOrderData.items.map((it, idx) => ({ ...it, id: `item_${Date.now()}_${idx}` })),
        payments: [],
      };

      setOrders([newOrder, ...orders]);
      setViewingOrder(newOrder);
      showAlert(`Order ${newOrder.id} created successfully!`);
    }
  };

  const handleUpdateOrderSubmit = async (
    orderId: string,
    updatedData: { customerName?: string; dueDate?: string; items?: OrderItem[] }
  ) => {
    try {
      const updated = await updateOrder(orderId, {
        customerName: updatedData.customerName,
        dueDate: updatedData.dueDate,
        items: updatedData.items?.map((i) => ({
          itemName: i.itemName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });

      showAlert(`Order #${orderId} updated successfully!`);
      await loadOrdersFromApi(updated.id);
    } catch (err: any) {
      showAlert(err.message || 'Cannot update order', 'error');

      // Local fallback logic
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (o.id !== orderId) return o;
          if (o.totalPaid > 0) return o;

          const newItems = updatedData.items || o.items;
          const totalAmount = newItems
            ? newItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
            : o.totalAmount;

          const updatedObj = {
            ...o,
            customerName: updatedData.customerName || o.customerName,
            dueDate: updatedData.dueDate || o.dueDate,
            items: newItems,
            totalAmount,
            remainingAmount: totalAmount - o.totalPaid,
          };
          setViewingOrder(updatedObj);
          return updatedObj;
        })
      );
    }
  };

  const handleDeleteOrderSubmit = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.totalPaid > 0 || (targetOrder.payments && targetOrder.payments.length > 0)) {
      showAlert('Cannot delete an order that has payments recorded against it', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${orderId}?`)) {
      try {
        await deleteOrder(orderId);
        showAlert(`Order ${orderId} deleted successfully.`);
        await loadOrdersFromApi();
      } catch (err: any) {
        showAlert(err.message || 'Failed to delete order', 'error');

        // Local fallback logic
        const remaining = orders.filter((o) => o.id !== orderId);
        setOrders(remaining);
        setViewingOrder(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  const handleRecordPaymentSubmit = async (orderId: string, paymentAmountCents: number, note: string) => {
    try {
      await recordPayment({
        orderId,
        amount: paymentAmountCents,
        note,
      });

      showAlert(`Recorded payment of ${formatCurrency(paymentAmountCents)} against ${orderId}`);
      await loadOrdersFromApi(orderId);
    } catch (err: any) {
      showAlert(err.message || 'Failed to record payment', 'error');

      // Local fallback logic
      setOrders((prevOrders) => {
        return prevOrders.map((o) => {
          if (o.id !== orderId) return o;

          const newTotalPaid = o.totalPaid + paymentAmountCents;
          const newRemaining = Math.max(0, o.totalAmount - newTotalPaid);
          const newStatus: Order['status'] = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

          const newPayment = {
            id: `pay_${Date.now()}`,
            orderId: o.id,
            amount: paymentAmountCents,
            note,
            paymentDate: new Date().toISOString().split('T')[0],
          };

          const updated: Order = {
            ...o,
            totalPaid: newTotalPaid,
            remainingAmount: newRemaining,
            status: newStatus,
            payments: [...(o.payments || []), newPayment],
          };

          setViewingOrder(updated);
          return updated;
        });
      });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'ALL' || o.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">PARTIAL</span>;
      case 'OVERDUE':
        return <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">OVERDUE</span>;
      default:
        return <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide">PENDING</span>;
    }
  };

  const getDisplayOrderId = (orderId: string) => {
    if (orderId.startsWith('order_')) return orderId;
    const index = orders.findIndex((o) => o.id === orderId);
    const num = index >= 0 ? index + 1 : 1;
    return `order_${String(num).padStart(3, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative selection:bg-slate-900 selection:text-white p-4 sm:p-8 overflow-x-hidden">
      
      {/* Decorative Sky Ambient Gradient Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-200 bg-linear-to-b from-sky-200/70 via-sky-100/40 to-transparent" />
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-225 h-125 bg-sky-300/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-50 -left-25 w-96 h-96 bg-purple-300/20 blur-[100px] rounded-full" />
        <div className="absolute top-75 -right-25 w-96 h-96 bg-emerald-200/30 blur-[100px] rounded-full" />
      </div>

      {/* Main Glassmorphism Dashboard Container */}
      <div className="relative z-10 max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-white/80 shadow-2xl rounded-3xl p-5 sm:p-7 space-y-6">
        
        {/* Toast Alert Banner */}
        {alertMsg && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md transition animate-in fade-in ${
            alertMsg.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-700' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span>{alertMsg.type === 'error' ? '⚠️' : '✅'} {alertMsg.text}</span>
            <button onClick={() => setAlertMsg(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Top Header Row with Logo (Left), Title (Center), User Profile (Top Right) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Logo & Workspace Title */}
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2.5 cursor-pointer group" 
              onClick={onNavigateHome}
              title="Go to landing page"
            >
              <div className="w-10 h-10 bg-slate-900 group-hover:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md transition">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-xl">DummyPay</span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  App
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Order & Settlement Engine</h2>
            </div>
          </div>

          {/* Top Right User Profile Card */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-1.5 flex items-center gap-3 shadow-xs">
              <div className="w-7 h-7 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-900 truncate max-w-35 sm:max-w-45">
                {userEmail}
              </span>
              <button
                onClick={onLogout}
                className="text-[11px] font-bold text-rose-600 hover:bg-rose-100/70 px-2 py-0.5 rounded-lg transition cursor-pointer shrink-0 ml-1"
                title="Sign Out"
              >
                Exit
              </button>
            </div>
          </div>

        </header>

        {/* Integrated Single Control Bar: Filters (Left) + Search (Center) + Create Order CTA (Far Right) */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Status Filter Pills (Left Side) */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'].map((st) => {
              const isActive = selectedStatusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          {/* Search Input & Create Order CTA (Right Side Row) */}
          <div className="flex items-center gap-3 flex-1 max-w-lg md:ml-auto">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Filter by customer or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Create Order Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow active:scale-95 transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span className="text-sm">+</span>
              <span>Create Order</span>
            </button>

          </div>

        </div>

        {/* Full Container Width Workspace (Left: Orders Table | Right: Order Details Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Master Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs relative">
              
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-3.5 whitespace-nowrap">Order ID</th>
                      <th className="py-3.5 px-3.5 text-right whitespace-nowrap">Total</th>
                      <th className="py-3.5 px-3.5 text-right whitespace-nowrap">Paid</th>
                      <th className="py-3.5 px-3.5 text-center whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const isSelected = viewingOrder?.id === order.id;
                        const displayId = getDisplayOrderId(order.id);
                        return (
                          <tr
                            key={order.id}
                            onClick={() => handleSelectOrderRow(order)}
                            className={`cursor-pointer transition group ${
                              isSelected
                                ? 'bg-indigo-50/80 text-indigo-950 font-bold border-l-4 border-indigo-600'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            
                            <td className="py-3.5 px-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 group-hover:text-indigo-600">
                                <span>{displayId}</span>
                                {isSelected && <span className="text-[10px] text-indigo-600">●</span>}
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium truncate max-w-32.5">
                                {order.customerName}
                              </p>
                            </td>

                            <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                              {formatCurrency(order.totalAmount)}
                            </td>

                            <td className="py-3.5 px-3.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                              {formatCurrency(order.totalPaid)}
                            </td>

                            <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
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
            </div>
          </div>

          {/* Right Column (Permanent Order Detail Workspace) */}
          <div className="lg:col-span-7 min-h-130">
            <OrderDetailPane
              order={viewingOrder}
              displayId={viewingOrder ? getDisplayOrderId(viewingOrder.id) : undefined}
              onClose={() => setViewingOrder(null)}
              onOpenEditModal={(ord) => setEditingOrder(ord)}
              onOpenPaymentModal={(ord) => setPaymentOrder(ord)}
              onDeleteOrder={handleDeleteOrderSubmit}
            />
          </div>

        </div>

      </div>

      {/* Action Modals */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitOrder={handleCreateOrderSubmit}
      />

      <EditOrderModal
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onUpdateOrder={handleUpdateOrderSubmit}
      />

      <RecordPaymentModal
        order={paymentOrder}
        isOpen={!!paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onRecordPayment={handleRecordPaymentSubmit}
      />

    </div>
  );
};
