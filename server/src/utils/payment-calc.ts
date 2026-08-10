import { prisma } from "../lib/prisma";
import { resolveOrderStatus } from "./status-calc";
import type { FastifyBaseLogger } from "fastify";

export async function getCalculatedOrderBalance(
  orderId: string, 
  userId: string,
  logger?: FastifyBaseLogger
) {

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payments: true }
  })

  if (!order) {
    return null;
  }

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0n)
  const remainingAmount = order.totalAmount - totalPaid

  const realTimeStatus = resolveOrderStatus({
    status: order.status,
    totalAmount: order.totalAmount,
    totalPaid,
    dueDate: order.dueDate
  })

  if(realTimeStatus !== order.status && realTimeStatus === "OVERDUE") {
    prisma.order.update({
      where: {id: order.id},
      data: {status: "OVERDUE"}
    }).catch(err => {
      if(logger) {
        logger.error({err}, "Failed background status sync");
      } else {
        console.error("Failed background status sync", err)
      }
    })
  }

  return {
    order,
    totalAmount: order.totalAmount,
    totalPaid,
    remainingAmount,
    status: realTimeStatus,
  };
}
