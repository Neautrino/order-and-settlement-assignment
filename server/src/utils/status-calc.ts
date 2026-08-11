import { isDueDateExpiredUTC } from "./date-utils";

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

    const isExpired = isDueDateExpiredUTC(order.dueDate);
    if(isExpired){
        return "OVERDUE"
    }

    if(order.totalPaid > 0n) {
        return "PARTIALLY_PAID"
    }

    return "PENDING"
}