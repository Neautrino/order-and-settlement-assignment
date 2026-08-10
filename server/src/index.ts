import Fastify from "fastify";
import { connectDb } from "./lib/prisma";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import fastifyJwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth.routes";
import { orderRoutes } from "./routes/order.routes";
import { paymentRoutes } from "./routes/payment.routes";

const PORT = 3000

const fastify = Fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "jwt-secret-key",
  sign: {
    expiresIn: "24h"
  }
})

fastify.get('/', async (request, reply) => {
  return {
    success: true,
    message: 'Order and settlements server is running'
  }
})

fastify.register(authRoutes, {
  prefix: "/api/auth"
})

fastify.register(orderRoutes, {
  prefix: "/api/orders"
})

fastify.register(paymentRoutes, {
  prefix: "/api/payments"
})

await connectDb(fastify.log);

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})