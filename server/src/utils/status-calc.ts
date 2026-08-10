export type OrderStatusType = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export interface OrderStatusInput {
    status: string;
    totalAmount: bigint;
    totalPaid: bigint;
    dueDate: Date | string;
}

export function resolveOrderStatus(order: OrderStatusInput): OrderStatusType {
    if(order.totalPaid >= order.totalAmount) {
        return "PAID"
    }

    const isExpired = new Date(order.dueDate) < new Date();
    if(isExpired){
        return "OVERDUE"
    }

    if(order.totalPaid > 0n) {
        return "PARTIALLY_PAID"
    }

    return "PENDING"
}