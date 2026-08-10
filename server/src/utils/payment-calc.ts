import { prisma } from "../lib/prisma";

export function isOrderOverdue(dueDate: Date | string, status?: string): boolean {
  if (status === "OVERDUE") {
    return true;
  }
  return new Date(dueDate) < new Date();
}

export async function getCalculatedOrderBalance(orderId: string, userId: string) {

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payments: true }
  })

  if (!order) {
    return null;
  }

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0n)
  const remainingAmount = order.totalAmount - totalPaid

  const overdue = isOrderOverdue(order.dueDate, order.status);
  const effectiveStatus = overdue && order.status !== "PAID" ? "OVERDUE" : order.status;

  if (order.status !== effectiveStatus) {
    await prisma.order.update({
      where: { id: orderId, userId },
      data: { status: effectiveStatus }
    });
  }

  return {
    order,
    totalAmount: order.totalAmount,
    totalPaid,
    remainingAmount,
    status: order.status,
  };
}
