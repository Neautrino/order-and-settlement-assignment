import { Order, PaginatedOrdersResponse, PaginationMeta } from '../types/domain';
import { apiClient } from './api.client';

export async function fetchOrders(
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<PaginatedOrdersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status && status !== 'ALL') {
    params.append('status', status);
  }
  const res = await apiClient<Order[]>(`/api/orders?${params.toString()}`);
  return {
    data: res.data || [],
    pagination: res.meta as PaginationMeta,
  };
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await apiClient<Order>(`/api/orders/${id}`);
  return res.data!;
}

export async function createOrder(payload: {
  customerName: string;
  dueDate: string;
  items: Array<{ itemName: string; quantity: number; unitPrice: number }>;
}): Promise<Order> {
  const res = await apiClient<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

export async function updateOrder(
  id: string,
  payload: {
    customerName?: string;
    dueDate?: string;
    items?: Array<{ itemName: string; quantity: number; unitPrice: number }>;
  }
): Promise<Order> {
  const res = await apiClient<Order>(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

export async function deleteOrder(id: string): Promise<void> {
  await apiClient<null>(`/api/orders/${id}`, {
    method: 'DELETE',
  });
}

export async function recordPayment(payload: {
  orderId: string;
  amount: number;
  note?: string;
}): Promise<{ payment: any; orderStatus: string }> {
  const res = await apiClient<{ payment: any; orderStatus: string }>('/api/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

export async function calculateOrderBalance(orderId: string): Promise<{
  orderId: string;
  status: string;
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
}> {
  const res = await apiClient<{
    orderId: string;
    status: string;
    totalAmount: number;
    totalPaid: number;
    remainingAmount: number;
  }>(`/api/payments/calculate/${orderId}`);
  return res.data!;
}

