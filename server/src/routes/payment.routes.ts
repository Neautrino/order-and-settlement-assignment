import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createPaymentSchema, paymentOrderParamSchema } from "../validator/payment.validator";
import { authenticate } from "../lib/middleware";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS } from "../constants/http-status";
import { getCalculatedOrderBalance } from "../utils/payment-calc";

//conver BigInt to number for json response
(BigInt.prototype as any).toJSON = function() {
    return Number(this);
};

export async function paymentRoutes(app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    fastify.get("/calculate/:orderId", {
        onRequest: [authenticate],
        schema: {params: paymentOrderParamSchema}
    }, async(request, reply) => {
        const {orderId} = request.params;

        const result = await getCalculatedOrderBalance(orderId, request.user.id)

        if(!result) {
            return reply.status(HTTP_STATUS.NOT_FOUND).send({
                message: "Order not found"
            })
        }

        return reply.status(HTTP_STATUS.OK).send({
            orderId: result.order.id,
            status: result.status,
            totalAmount: result.order.totalAmount,
            totalPaid: result.totalPaid,
            remainingAmount: result.remainingAmount,
        })
    })

    fastify.post("/", {
        onRequest: [authenticate],
        schema: { body: createPaymentSchema}
    }, async ( request, reply) => {
        const {orderId, amount, note} = request.body;
        const paymentAmount = BigInt(amount);

        const balance = await getCalculatedOrderBalance(orderId, request.user.id)

        if(!balance){
            return reply.status(HTTP_STATUS.NOT_FOUND).send({
                message: "Order not found"
            })
        }

        if(balance.status === "PAID") {
            return reply.status(HTTP_STATUS.BAD_REQUEST).send({
                message: "Order is already fully paid"
            })
        }

        if(paymentAmount > balance.remainingAmount){
            return reply.status(HTTP_STATUS.BAD_REQUEST).send({
                message: `Payment amount ${paymentAmount} exceeds remaining due amount ${balance.remainingAmount}`
            })
        }

        const newTotalPaid = balance.totalPaid + paymentAmount
        const newStatus = newTotalPaid === balance.totalAmount ? "PAID" : "PARTIALLY_PAID"

        const payment = await prisma.$transaction(async (tx) => {
            const p = await tx.payment.create({
                data: {
                    orderId: balance.order.id,
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
                where: {id: balance.order.id},
                data: {status: newStatus}
            })

            return p;
        })

        return reply.status(HTTP_STATUS.CREATED).send({
            message: "Payment recorded successfully",
            orderStatus: newStatus,
            payment,
        })
    })
}