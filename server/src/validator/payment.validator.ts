import { z } from "zod"

export const createPaymentSchema = z.object({
    orderId: z.uuid("Invalid order Id format"),
    amount: z.number().int().positive("Payment amount must be a positive integer in paise"),
    note: z.string().optional()
})

export const paymentOrderParamSchema = z.object({
    orderId: z.uuid("Invalid order Id format")
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type paymentOrderParamInput = z.infer<typeof paymentOrderParamSchema>;