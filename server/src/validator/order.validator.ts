import { z } from "zod"

export const orderItemSchema = z.object({
    itemName: z.string().min(1, "Item name is required"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    unitPrice: z.number().int().positive("Unit price must be positive"),
})

export const orderSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    dueDate: z.coerce.date({ error: "Invalid ISO due date format"}).refine((date) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const targetDate = new Date(date);
        targetDate.setHours(0,0,0,0)
        return targetDate > today;
    }, { message: "Due date cannot be today or in the past"}),
    items: z.array(orderItemSchema).min(1, "Order must contain at least 1 item"),
})

export const orderQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
})

export const orderParamsSchema = z.object({
    id: z.uuid("Invalid order ID"),
})

export const updateOrderSchema = orderSchema.partial();

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderParamsSchema = z.infer<typeof orderParamsSchema>;
export type updateOrderSchema = z.infer<typeof updateOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;