import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "../lib/middleware";
import { orderParamsSchema, orderSchema } from "../validator/order.validator";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS } from "../constants/http-status";
import { resolveOrderStatus } from "../utils/status-calc";

//conver BigInt to number for json response
(BigInt.prototype as any).toJSON = function() {
    return Number(this);
};

export async function orderRoutes(app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    fastify.post( "/", {
        onRequest: [authenticate],
        schema: {body: orderSchema},
    }, async (request, reply ) => {
        const { customerName, dueDate, items } = request.body;

        const totalAmount = items.reduce((sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPrice), 0n);

        const order = await prisma.order.create({
            data: {
                userId: request.user.id,
                customerName,
                dueDate: new Date(dueDate),
                totalAmount,
                items: {
                    createMany: {
                        data: items.map((item) => ({
                            itemName: item.itemName,
                            quantity: item.quantity,
                            unitPrice: BigInt(item.unitPrice),
                        })),
                    }
                },
            },
            select: {
                id: true,
                customerName: true,
                status: true,
                totalAmount: true,
                dueDate: true,
                createdAt: true
            }
        })

        return reply.status(HTTP_STATUS.CREATED).send({
            message: "Order created successfully",
            order,
        })
    })

    fastify.get("/", {
        onRequest: [authenticate],
    }, async (request, reply) => {
        const orders = await prisma.order.findMany({
            where: {userId: request.user.id},
            include: { 
                payments: {
                    select : {
                        amount: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        })

        const statusChangedIds: string[] = [];

        const formattedOrders = orders.map((order) => {
            const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0n);
            const realTimeStatus = resolveOrderStatus({
                status: order.status,
                totalAmount: order.totalAmount,
                totalPaid,
                dueDate: order.dueDate
            })

            if(realTimeStatus !== order.status && realTimeStatus === "OVERDUE") {
                statusChangedIds.push(order.id);
            }

            return {
                id: order.id,
                customerName: order.customerName,
                status: realTimeStatus,
                totalAmount: order.totalAmount,
                totalPaid,
                remainingAmount: order.totalAmount - totalPaid,
                dueDate: order.dueDate,
                createdAt: order.createdAt,
            };
        })

        if(statusChangedIds.length > 0) {
            prisma.order.updateMany({
                where: {id: {
                    in: statusChangedIds
                }},
                data: { status: "OVERDUE" }
            }).catch(err => request.log.error(err, "Failed background status sync"))
        }
        
        return reply.status(HTTP_STATUS.OK).send(formattedOrders)
    })

    fastify.get("/:id", {
        onRequest: [authenticate],
        schema: { params: orderParamsSchema}
    }, async( request, reply) => {
        const order = await prisma.order.findFirst({
            where: {
                id: request.params.id,
                userId: request.user.id
            },
            include: { 
                items: true,
                payments:  {
                    select: {amount: true}
                }
            },
        })

        if (!order) {
            return reply.status(HTTP_STATUS.NOT_FOUND).send({ message: "Order not found"})
        }

        const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0n);
        const realTimeStatus = resolveOrderStatus({
            status: order.status,
            totalAmount: order.totalAmount,
            totalPaid,
            dueDate: order.dueDate
        })

        if(realTimeStatus !== order.status && realTimeStatus==="OVERDUE"){
            prisma.order.update({
                where: {id: order.id},
                data: {status: "OVERDUE"}
            }).catch(err => request.log.error(err, "Failed background status sync"))
        }

        return reply.status(HTTP_STATUS.OK).send({
            message: "Order fetched successfully",
            order: {
                id: order.id,
                customerName: order.customerName,
                status: realTimeStatus,
                totalAmount: order.totalAmount,
                totalPaid,
                remainingAmount: order.totalAmount - totalPaid,
                dueDate: order.dueDate,
                items: order.items,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            },
        })
    })

    fastify.delete("/:id", {
        onRequest: [authenticate],
        schema: { params: orderParamsSchema}
    }, async ( request, reply) => {
        const {id} = request.params;
        const order = await prisma.order.findFirst({
            where: {
                id: id,
                userId: request.user.id
            },
            include: {payments: true}
        })

        if (!order){
            return reply.status(HTTP_STATUS.NOT_FOUND).send({
                message: "Order not found"
            })
        }

        if(order.payments.length > 0){
            return reply.status(HTTP_STATUS.BAD_REQUEST).send({
                message: "Cannot delete an order that has payments recorded against it"
            })
        }
        
        await prisma.order.delete({ where: {id}})

        return reply.status(HTTP_STATUS.OK).send({message: "Order deleted successfully"})
    })
}