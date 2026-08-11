import Fastify, { type FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyJwt from "@fastify/jwt";
import { authRoutes } from "../../src/routes/auth.routes";
import { orderRoutes } from "../../src/routes/order.routes";
import { paymentRoutes } from "../../src/routes/payment.routes";
import { prisma } from "../../src/lib/prisma";

export async function buildTestApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
  }).withTypeProvider<ZodTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifyJwt, {
    secret: "test-jwt-secret",
    sign: {
      expiresIn: "24h",
    },
  });

  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(orderRoutes, { prefix: "/api/orders" });
  await fastify.register(paymentRoutes, { prefix: "/api/payments" });

  await fastify.ready();
  return fastify;
}

export async function cleanDatabase() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
}
