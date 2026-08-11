import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createPaymentSchema, paymentOrderParamSchema } from "../validator/payment.validator";
import { authenticate } from "../lib/middleware";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS } from "../constants/http-status";
import { getCalculatedOrderBalance } from "../utils/payment-calc";
import { resolveOrderStatus } from "../utils/status-calc";
import { sendSuccess, sendError } from "../utils/api-response";

//conver BigInt to number for json response
(BigInt.prototype as any).toJSON = function() {
    return Number(this);
};

export async function paymentRoutes(app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    fastify.get("/calculate/:orderId", {
        config: {
            rateLimit: {
                max: 60,
                timeWindow: "1 minute"
            }
        },
        onRequest: [authenticate],
        schema: {params: paymentOrderParamSchema}
    }, async(request, reply) => {
        const {orderId} = request.params;

        const result = await getCalculatedOrderBalance(orderId, request.user.id, request.log)

        if(!result) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, "Order not found", "ORDER_NOT_FOUND");
        }

        return sendSuccess(reply, HTTP_STATUS.OK, {
            orderId: result.order.id,
            status: result.status,
            totalAmount: result.order.totalAmount,
            totalPaid: result.totalPaid,
            remainingAmount: result.remainingAmount,
        }, "Order balance calculated successfully");
    })

    fastify.post("/", {
        config: {
            rateLimit: {
                max: 10,
                timeWindow: "1 minute"
            }
        },
        onRequest: [authenticate],
        schema: { body: createPaymentSchema}
    }, async ( request, reply) => {
        const {orderId, amount, note} = request.body;
        const paymentAmount = BigInt(amount);

        const balance = await getCalculatedOrderBalance(orderId, request.user.id, request.log)

        if(!balance){
            return sendError(reply, HTTP_STATUS.NOT_FOUND, "Order not found", "ORDER_NOT_FOUND");
        }

        if(balance.status === "PAID") {
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Order is already fully paid", "ORDER_ALREADY_PAID");
        }

        if(paymentAmount > balance.remainingAmount){
            return sendError(reply, HTTP_STATUS.BAD_REQUEST, `Payment amount ${paymentAmount} exceeds remaining due amount ${balance.remainingAmount}`, "PAYMENT_EXCEEDS_BALANCE");
        }

        try {
            const result = await prisma.$transaction(async (tx) => {

                const lockedOrders = await tx.$queryRaw<Array<{
                    id: string;
                    totalAmount: bigint;
                    status: string;
                    dueDate: Date;
                }>>`
                    SELECT id, "totalAmount", status, "dueDate" FROM "Order"
                    WHERE id = ${orderId} AND "userId" = ${request.user.id}
                    FOR UPDATE
                `

                if(!lockedOrders || lockedOrders.length === 0 || !lockedOrders[0]) {
                    throw new Error("NOT_FOUND");
                }
                const order = lockedOrders[0];
                if (!order) throw new Error("NOT_FOUND");

                const payments = await tx.payment.findMany({
                    where: {orderId: order.id},
                    select: {amount: true}
                })

                const currentPaid = payments.reduce((sum, p) => sum + p.amount, 0n);
                const remainingAmount = order.totalAmount - currentPaid;

                if(order.status === "PAID"){
                    throw new Error("ALREADY_PAID")
                }

                if(paymentAmount > remainingAmount) {
                    throw new Error(`EXCEEDS_BALANCE:${remainingAmount}`);
                }

                const newTotalPaid = currentPaid + paymentAmount;
                const newStatus = resolveOrderStatus({
                    status: order.status,
                    totalAmount: order.totalAmount,
                    totalPaid: newTotalPaid,
                    dueDate: order.dueDate
                });

                const payment = await tx.payment.create({
                    data: {
                        orderId: order.id,
                        amount: paymentAmount,
                        note: note || "",
                    }, 
                    select: {
                        id: true,
                        orderId: true,
                        amount: true,
                        note: true,
                        paymentDate: true,
                    }
                })

                await tx.order.update({
                    where: {id: order.id},
                    data: {status: newStatus}
                })

                return {payment, newStatus};
            })

            return sendSuccess(reply, HTTP_STATUS.CREATED, {
                orderStatus: result.newStatus,
                payment: result.payment,
            }, "Payment recorded successfully");
        } catch (err: any) {
            if (err.message === "NOT_FOUND") {
                return sendError(reply, HTTP_STATUS.NOT_FOUND, "Order not found", "ORDER_NOT_FOUND");
            }
            if (err.message === "ALREADY_PAID") {
                return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Order is already fully paid", "ORDER_ALREADY_PAID");
            }
            if (err.message?.startsWith("EXCEEDS_BALANCE")) {
                const remaining = err.message.split(":")[1];
                return sendError(reply, HTTP_STATUS.BAD_REQUEST, `Payment amount (${paymentAmount}) exceeds remaining balance (${remaining})`, "PAYMENT_EXCEEDS_BALANCE");
            }
            throw err;
        }
    })
}