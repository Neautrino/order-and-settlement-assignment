import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '../../types/domain';
import { DashboardHeader } from './DashboardHeader';
import { OrdersFilterBar } from './OrdersFilterBar';
import { OrdersMasterTable } from './OrdersMasterTable';
import { OrderDetailPane } from './OrderDetailPane';
import { CreateOrderModal } from './CreateOrderModal';
import { EditOrderModal } from './EditOrderModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { DeleteOrderModal } from './DeleteOrderModal';
import { Toast } from '../ui/Toast';
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  userEmail,
  onLogout,
  onNavigateHome,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Active Selected Order Workspace State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
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

  const handleDeleteOrderSubmit = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.totalPaid > 0 || (targetOrder.payments && targetOrder.payments.length > 0)) {
      showAlert('Cannot delete an order that has payments recorded against it', 'error');
      return;
    }

    setDeletingOrder(targetOrder);
  };

  const handleConfirmDelete = async (orderId: string) => {
    const displayId = deletingOrder ? getDisplayOrderId(deletingOrder.id) : orderId;
    try {
      await deleteOrder(orderId);
      showAlert(`Order ${displayId} deleted successfully.`);
      await loadOrdersFromApi();
    } catch (err: any) {
      showAlert(err.message || 'Failed to delete order', 'error');

      // Local fallback logic
      const remaining = orders.filter((o) => o.id !== orderId);
      setOrders(remaining);
      setViewingOrder(remaining.length > 0 ? remaining[0] : null);
    } finally {
      setDeletingOrder(null);
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

  const getDisplayOrderId = (orderId: string) => {
    if (orderId.startsWith('order_')) return orderId;
    const index = orders.findIndex((o) => o.id === orderId);
    const num = index >= 0 ? index + 1 : 1;
    return `order_${String(num).padStart(3, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative selection:bg-slate-900 selection:text-white p-4 sm:p-8 overflow-x-hidden">
      
      {/* Toast Notification (Floating Bottom Right) */}
      <Toast
        message={alertMsg?.text || null}
        type={alertMsg?.type}
        onClose={() => setAlertMsg(null)}
      />

      {/* Decorative Sky Ambient Gradient Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-200 bg-linear-to-b from-sky-200/70 via-sky-100/40 to-transparent" />
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-225 h-125 bg-sky-300/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-50 -left-25 w-96 h-96 bg-purple-300/20 blur-[100px] rounded-full" />
        <div className="absolute top-75 -right-25 w-96 h-96 bg-emerald-200/30 blur-[100px] rounded-full" />
      </div>

      {/* Main Glassmorphism Dashboard Container */}
      <div className="relative z-10 max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-white/80 shadow-2xl rounded-3xl p-5 sm:p-7 space-y-6">
        
        {/* Top Header Sub-Component */}
        <DashboardHeader
          userEmail={userEmail}
          onLogout={onLogout}
          onNavigateHome={onNavigateHome}
        />

        {/* Search & Status Filters Control Bar Sub-Component */}
        <OrdersFilterBar
          selectedStatusFilter={selectedStatusFilter}
          onSelectStatusFilter={setSelectedStatusFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onCreateOrderClick={() => setIsCreateOpen(true)}
        />

        {/* Workspace Layout (Left: Orders Master Table | Right: Order Details Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Master Column Table Sub-Component */}
          <div className="lg:col-span-5">
            <OrdersMasterTable
              orders={filteredOrders}
              viewingOrderId={viewingOrder?.id}
              isLoading={isLoading}
              onSelectOrder={handleSelectOrderRow}
              getDisplayOrderId={getDisplayOrderId}
            />
          </div>

          {/* Right Column Order Detail Pane Sub-Component */}
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

      <DeleteOrderModal
        order={deletingOrder}
        displayId={deletingOrder ? getDisplayOrderId(deletingOrder.id) : undefined}
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirmDelete={handleConfirmDelete}
      />

    </div>
  );
};
