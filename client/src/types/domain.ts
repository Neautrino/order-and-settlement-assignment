export type OrderStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  meta?: Record<string, any>;
}

export interface OrderItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number; // In cents
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  note?: string;
  paymentDate: string;
}

export interface Order {
  id: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  dueDate: string;
  createdAt: string;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface MetricCardData {
  title: string;
  amount: string;
  change: string;
  isPositive: boolean;
  type: 'balance' | 'revenue' | 'expenses' | 'profit';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  pagination: PaginationMeta;
}


