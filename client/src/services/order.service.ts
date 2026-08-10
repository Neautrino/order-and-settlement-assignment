import { Order } from '../types/domain';
import { apiClient } from './api.client';

export async function fetchOrders(): Promise<Order[]> {
  return apiClient<Order[]>('/api/orders');
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await apiClient<{ message: string; order: Order }>(`/api/orders/${id}`);
  return res.order;
}

export async function createOrder(payload: {
  customerName: string;
  dueDate: string;
  items: Array<{ itemName: string; quantity: number; unitPrice: number }>;
}): Promise<Order> {
  const res = await apiClient<{ message: string; order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.order;
}

export async function updateOrder(
  id: string,
  payload: {
    customerName?: string;
    dueDate?: string;
    items?: Array<{ itemName: string; quantity: number; unitPrice: number }>;
  }
): Promise<Order> {
  const res = await apiClient<{ message: string; order: Order }>(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.order;
}

export async function deleteOrder(id: string): Promise<void> {
  await apiClient<{ message: string }>(`/api/orders/${id}`, {
    method: 'DELETE',
  });
}

export async function recordPayment(payload: {
  orderId: string;
  amount: number;
  note?: string;
}): Promise<{ payment: any; orderStatus: string }> {
  return apiClient<{ message: string; orderStatus: string; payment: any }>('/api/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
