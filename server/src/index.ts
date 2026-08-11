import Fastify from "fastify";
import { connectDb } from "./lib/prisma";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import { authRoutes } from "./routes/auth.routes";
import { orderRoutes } from "./routes/order.routes";
import { paymentRoutes } from "./routes/payment.routes";
import { sendSuccess } from "./utils/api-response";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "jwt-secret-key",
  sign: {
    expiresIn: "24h",
  },
});

await fastify.register(fastifyRateLimit, {
  max: 500,
  timeWindow: "15 minutes",
  hook: "preHandler",
  keyGenerator: (request) => {
    if (request.user && (request.user as any).id) {
      return `user:${(request.user as any).id}`;
    }
    return `ip:${request.ip}`;
  },
  errorResponseBuilder: (request, context) => ({
    success: false,
    message: `Rate limit exceeded. Try again in ${context.after}`,
    error: {
      code: "TOO_MANY_REQUESTS",
      details: { expiresIn: context.after },
    },
  }),
});

await fastify.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

fastify.get("/", async (request, reply) => {
  return sendSuccess(
    reply,
    200,
    null,
    "Order and settlements server is running",
  );
});

fastify.register(authRoutes, {
  prefix: "/api/auth",
});

fastify.register(orderRoutes, {
  prefix: "/api/orders",
});

fastify.register(paymentRoutes, {
  prefix: "/api/payments",
});

await connectDb(fastify.log);

fastify.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
