import { z } from "zod"

export const orderItemSchema = z.object({
    itemName: z.string().min(1, "Item name is required"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    unitPrice: z.number().int().positive("Unit price must be positive"),
})

export const orderSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    dueDate: z.coerce.date({ error: "Invalid ISO due date format"}),
    items: z.array(orderItemSchema).min(1, "Order must contain at least 1 item"),
})

export const orderParamsSchema = z.object({
    id: z.uuid("Invalid order ID"),
})

export const updateOrderSchema = orderSchema.partial();

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderParamsSchema = z.infer<typeof orderParamsSchema>;
export type updateOrderSchema = z.infer<typeof updateOrderSchema>;