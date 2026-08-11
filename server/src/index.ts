import Fastify from "fastify";
import { connectDb } from "./lib/prisma";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
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

await fastify.register(fastifyRateLimit, {
  max: 500,
  timeWindow: "15 minutes",
  hook: "preHandler",
  keyGenerator: (request) => {
    if(request.user && (request.user as any).id){
      return `user:${(request.user as any).id}`
    }
    return `ip:${request.ip}`
  },
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    error: "Too Many Requests",
    message: `Rate limit exceeded. Try again in ${context.after}`,
    date: new Date().toISOString(),
    expiresIn: context.after
  })
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