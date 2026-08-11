import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "../lib/middleware";
import { orderParamsSchema, orderQuerySchema, orderSchema, updateOrderSchema } from "../validator/order.validator";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS } from "../constants/http-status";
import { resolveOrderStatus } from "../utils/status-calc";
import { sendSuccess, sendError } from "../utils/api-response";
import { toUTCMidnight, getUTCTodayMidnight } from "../utils/date-utils";

//conver BigInt to number for json response
(BigInt.prototype as any).toJSON = function() {
    return Number(this);
};

export async function orderRoutes(app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    fastify.post( "/", {
        config: {
            rateLimit: {
                max: 30,
                timeWindow: "1 minute"
            }
        },
        onRequest: [authenticate],
        schema: {body: orderSchema},
    }, async (request, reply ) => {
        const { customerName, dueDate, items } = request.body;

        const totalAmount = items.reduce((sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPrice), 0n);

        const order = await prisma.order.create({
            data: {
                userId: request.user.id,
                customerName,
                dueDate: toUTCMidnight(dueDate),
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

        return sendSuccess(reply, HTTP_STATUS.CREATED, order, "Order created successfully");
    })

    
    fastify.get("/", {
        config: {
            rateLimit: {
                max: 60,
                timeWindow: "1 minute"
            }
        },
        onRequest: [authenticate],
        schema: { querystring: orderQuerySchema }
    }, async (request, reply) => {

        const { page, limit, status } = request.query;
        const skip = (page - 1) * limit;
        
        const whereClause: { userId: string; status?: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"} = {
            userId: request.user.id
        };

        if(status) {
            whereClause.status = status;
        }

        // Reconcile overdue status in database BEFORE status filtering and pagination
        const todayMidnight = getUTCTodayMidnight();
        await prisma.order.updateMany({
            where: {
                userId: request.user.id,
                status: { in: ["PENDING", "PARTIALLY_PAID"] },
                dueDate: { lt: todayMidnight }
            },
            data: { status: "OVERDUE" }
        });

        const [totalOrders, orders] = await Promise.all([
            prisma.order.count({
                where: whereClause
            }), 

            prisma.order.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: { 
                    items: true,
                    payments: {
                        select: {
                            id: true,
                            amount: true,
                            note: true,
                            paymentDate: true,
                        },
                        orderBy: { paymentDate: "desc" }
                    }
                },
                orderBy: { createdAt: "asc" },
            })
        ]);

        const formattedOrders = orders.map((order) => {
            const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0n);
            const realTimeStatus = resolveOrderStatus({
                status: order.status,
                totalAmount: order.totalAmount,
                totalPaid,
                dueDate: order.dueDate
            });

            return {
                id: order.id,
                customerName: order.customerName,
                status: realTimeStatus,
                totalAmount: order.totalAmount,
                totalPaid,
                remainingAmount: order.totalAmount - totalPaid,
                dueDate: order.dueDate,
                items: order.items,
                payments: order.payments,
                createdAt: order.createdAt,
            };
        });

        const totalPages = Math.ceil(totalOrders / limit)
        const hasMore = page < totalPages
        
        return sendSuccess(
            reply,
            HTTP_STATUS.OK,
            formattedOrders,
            "Orders fetched successfully",
            {
                page,
                limit,
                totalOrders,
                totalPages,
                hasMore
            }
        )
    })

    fastify.get("/:id", {
        config: {
            rateLimit: {
                max: 60,
                timeWindow: "1 minute"
            }
        },
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
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        note: true,
                        paymentDate: true,
                    },
                    orderBy: { paymentDate: "desc" }
                }
            },
        })

        if (!order) {
            return sendError(reply, HTTP_STATUS.NOT_FOUND, "Order not found", "ORDER_NOT_FOUND");
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

        return sendSuccess(reply, HTTP_STATUS.OK, {
            id: order.id,
            customerName: order.customerName,
            status: realTimeStatus,
            totalAmount: order.totalAmount,
            totalPaid,
            remainingAmount: order.totalAmount - totalPaid,
            dueDate: order.dueDate,
            items: order.items,
            payments: order.payments,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        }, "Order fetched successfully")
    })

    fastify.patch("/:id", {
        config: {
            rateLimit: {
                max: 30,
                timeWindow: "1 minute"
            }
        },
        onRequest: [authenticate],
        schema: {
            params: orderParamsSchema,
            body: updateOrderSchema,
        }
    }, async (request, reply) => {
        const {id } = request.params;
        const {customerName, dueDate, items} = request.body;

        try {
            const updatedOrder = await prisma.$transaction(async (tx) => {
                const lockedOrders = await tx.$queryRaw<
                    Array<{id: string}>>`
                        SELECT id FROM "Order"
                        WHERE id = ${id} AND "userId" = ${request.user.id}
                        FOR UPDATE
                    `

                if(!lockedOrders || lockedOrders.length === 0 || !lockedOrders[0]){
                    throw new Error("NOT_FOUND");
                }

                const payments = await tx.payment.findMany({
                    where: {orderId: id},
                    select: { id: true}
                })

                if(payments.length > 0){
                    throw new Error("HAS_PAYMENTS")
                }

                if(items && items.length > 0) {
                    const totalAmount = items.reduce((sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPrice), 0n)

                    await tx.orderItem.deleteMany({
                        where: {orderId: id}
                    })

                    return tx.order.update({
                        where: {id},
                        data: {
                            ...(customerName && {customerName}),
                            ...(dueDate && {dueDate: toUTCMidnight(dueDate)}),
                            totalAmount,
                            items: {
                                createMany: {
                                    data: items.map((item) => ({
                                        itemName: item.itemName,
                                        quantity: item.quantity,
                                        unitPrice: BigInt(item.unitPrice)
                                    }))
                                }
                            }
                        },
                        select: {
                            id: true,
                            customerName: true,
                            status: true,
                            totalAmount: true,
                            dueDate: true,
                            items: true,
                            updatedAt: true
                        }
                    })
                }

                return tx.order.update({
                    where: {id},
                    data: {
                        ...(customerName && {customerName}),
                        ...(dueDate && { dueDate: toUTCMidnight(dueDate)}),
                    },
                    select: {
                        id: true,
                        customerName: true,
                        status: true,
                        totalAmount: true,
                        dueDate: true,
                        items: true,
                        updatedAt: true,
                    }
                })
            })

            return sendSuccess(reply, HTTP_STATUS.OK, updatedOrder, "Order updated successfully");
        } catch (err: any) {
            if (err.message === "NOT_FOUND") {
                return sendError(reply, HTTP_STATUS.NOT_FOUND, "Order not found", "ORDER_NOT_FOUND");
            }
            if (err.message === "HAS_PAYMENTS") {
                return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Cannot update an order that has payments recorded against it", "ORDER_HAS_PAYMENTS");
            }

            throw err;
        }        
    })

    fastify.delete("/:id", {
        config: {
            rateLimit: {
                max: 30,
                timeWindow: "1 minute"
            }
        },
        onRequest: [authenticate],
        schema: { params: orderParamsSchema}
    }, async ( request, reply) => {
        const {id} = request.params;

        try{
            await prisma.$transaction(async (tx) => {
                const lockedOrders = await tx.$queryRaw<Array<{id: string}>>`
                    SELECT id FROM "Order" WHERE id = ${id} AND "userId" = ${request.user.id} FOR UPDATE
                `;

                if(!lockedOrders || lockedOrders.length === 0 || !lockedOrders[0]){
                    throw new Error("NOT_FOUND");
                }

                const payments = await tx.payment.findMany({
                    where: { orderId: id},
                    select: { id: true}
                })

                if (payments.length > 0) {
                    throw new Error("HAS_PAYMENTS");
                }

                await tx.order.delete({
                    where: {id}
                })
            })

            return sendSuccess(reply, HTTP_STATUS.OK, null, "Order deleted successfully");
        } catch (err: any) {
            if(err.message === "NOT_FOUND") {
                return sendError(reply, HTTP_STATUS.NOT_FOUND, "Order not found", "ORDER_NOT_FOUND");
            }
            if (err.message === "HAS_PAYMENTS") {
                return sendError(reply, HTTP_STATUS.BAD_REQUEST, "Cannot delete an order that has payments recorded against it", "ORDER_HAS_PAYMENTS");
            }

            throw err;
        }
    })
}