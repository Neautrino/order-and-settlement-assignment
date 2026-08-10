import React, { useState } from 'react';
import { Order, OrderItem } from '../../types/domain';
import { CreateOrderModal } from './CreateOrderModal';
import { EditOrderModal } from './EditOrderModal';
import { OrderDetailsDrawer } from './OrderDetailsDrawer';
import { RecordPaymentModal } from './RecordPaymentModal';

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
  const [activeTab, setActiveTab] = useState('Orders');
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals & Drawer State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const navItems = ['Orders', 'Overview', 'Transactions', 'Payments', 'Invoices', 'Reports', 'Settings'];

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const handleCreateOrder = (newOrderData: { customerName: string; dueDate: string; items: OrderItem[] }) => {
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
    showAlert(`Order ${newOrder.id} created successfully!`);
  };

  const handleUpdateOrder = (
    orderId: string,
    updatedData: { customerName?: string; dueDate?: string; items?: OrderItem[] }
  ) => {
    setOrders(
      orders.map((o) => {
        if (o.id !== orderId) return o;

        if (o.totalPaid > 0) {
          showAlert('Cannot update an order that has payments recorded', 'error');
          return o;
        }

        const newItems = updatedData.items || o.items;
        const totalAmount = newItems
          ? newItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
          : o.totalAmount;

        return {
          ...o,
          customerName: updatedData.customerName || o.customerName,
          dueDate: updatedData.dueDate || o.dueDate,
          items: newItems,
          totalAmount,
          remainingAmount: totalAmount - o.totalPaid,
        };
      })
    );

    showAlert(`Order ${orderId} updated successfully!`);
  };

  const handleDeleteOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.totalPaid > 0 || (targetOrder.payments && targetOrder.payments.length > 0)) {
      showAlert('Cannot delete an order that has payments recorded against it', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${orderId}?`)) {
      setOrders(orders.filter((o) => o.id !== orderId));
      showAlert(`Order ${orderId} deleted successfully.`);
    }
  };

  const handleRecordPayment = (orderId: string, paymentAmountCents: number, note: string) => {
    setOrders(
      orders.map((o) => {
        if (o.id !== orderId) return o;

        const newTotalPaid = o.totalPaid + paymentAmountCents;
        const newRemaining = o.totalAmount - newTotalPaid;
        const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

        const newPayment = {
          id: `pay_${Date.now()}`,
          orderId: o.id,
          amount: paymentAmountCents,
          note,
          paymentDate: new Date().toISOString().split('T')[0],
        };

        return {
          ...o,
          totalPaid: newTotalPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          payments: [...(o.payments || []), newPayment],
        };
      })
    );

    showAlert(`Recorded payment of $${(paymentAmountCents / 100).toFixed(2)} against ${orderId}`);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative selection:bg-slate-900 selection:text-white p-4 sm:p-8 overflow-x-hidden">
      
      {/* Decorative Sky Ambient Gradient Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-200 bg-linear-to-b from-sky-200/70 via-sky-100/40 to-transparent" />
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-225 h-125 bg-sky-300/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-50 -left-25 w-96 h-96 bg-purple-300/20 blur-[100px] rounded-full" />
        <div className="absolute top-75 -right-25 w-96 h-96 bg-emerald-200/30 blur-[100px] rounded-full" />
      </div>

      {/* Main Glassmorphism Dashboard Window */}
      <div className="relative z-10 max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/80 shadow-2xl rounded-3xl p-4 sm:p-6 space-y-6">
        
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

        {/* Dashboard Frame Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Integrated Left Sidebar */}
          <aside className="lg:col-span-3 bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between min-h-[600px]">
            <div>
              <div className="flex items-center justify-between px-3 py-2 mb-6 cursor-pointer" onClick={onNavigateHome}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-900 tracking-tight text-lg">DummyPay</span>
                </div>
                
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  App
                </span>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item;
                  return (
                    <button
                      key={item}
                      onClick={() => setActiveTab(item)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive 
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                      {item}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Profile & Sign Out Card */}
            <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{userEmail}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Active Account</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0"
                title="Sign Out"
              >
                Exit
              </button>
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Header Control Row with Create Order CTA */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order & Settlement Engine</h2>
                <p className="text-xs text-slate-500 mt-0.5">Click any row to inspect line items, payment logs & actions</p>
              </div>

              {/* Create Order Button */}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span className="text-sm">+</span>
                <span>Create Order</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
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

              {/* Search (Right Side) */}
              <div className="relative flex-1 max-w-sm sm:ml-auto">
                <span className="absolute left-3.5 top-2 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Filter by customer or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

            </div>

            {/* Ultra-Clean Orders Table with Status Aligned Middle */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5 whitespace-nowrap">Order ID</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Customer Name</th>
                      <th className="py-3.5 px-5 text-right whitespace-nowrap">Total Amount</th>
                      <th className="py-3.5 px-5 text-right whitespace-nowrap">Amount Paid</th>
                      <th className="py-3.5 px-5 text-center whitespace-nowrap">Status</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => setViewingOrder(order)}
                          className="hover:bg-slate-50/80 cursor-pointer transition group"
                        >
                          
                          <td className="py-4 px-5 font-mono font-bold text-slate-900 group-hover:text-indigo-600 transition whitespace-nowrap flex items-center gap-2">
                            <span>{order.id}</span>
                            <span className="text-[10px] font-normal text-slate-400 group-hover:translate-x-0.5 transition">→</span>
                          </td>

                          <td className="py-4 px-5 font-semibold text-slate-900 whitespace-nowrap">
                            {order.customerName}
                          </td>

                          <td className="py-4 px-5 text-right font-bold text-slate-900 whitespace-nowrap">
                            ${(order.totalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-4 px-5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                            ${(order.totalPaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-4 px-5 text-center whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>

                          <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                            {order.dueDate}
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No orders found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </main>
        </div>

      </div>

      {/* Modals & Right Slide-Over Drawer */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitOrder={handleCreateOrder}
      />

      <EditOrderModal
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onUpdateOrder={handleUpdateOrder}
      />

      <OrderDetailsDrawer
        order={viewingOrder}
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        onOpenEditModal={(ord) => setEditingOrder(ord)}
        onOpenPaymentModal={(ord) => setPaymentOrder(ord)}
        onDeleteOrder={handleDeleteOrder}
      />

      <RecordPaymentModal
        order={paymentOrder}
        isOpen={!!paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onRecordPayment={handleRecordPayment}
      />

    </div>
  );
};
