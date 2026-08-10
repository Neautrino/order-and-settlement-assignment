export type OrderStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface OrderItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number; // In paise/cents
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
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  note?: string;
  paymentDate: string;
}

export interface MetricCardData {
  title: string;
  amount: string;
  change: string;
  isPositive: boolean;
  type: 'balance' | 'revenue' | 'expenses' | 'profit';
}
