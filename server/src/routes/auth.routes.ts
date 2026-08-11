import type { FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { loginSchema, registerSchema } from "../validator/auth.validator";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS } from "../constants/http-status";
import { authenticate } from "../lib/middleware";
import { sendError, sendSuccess } from "../utils/api-response";

export async function authRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.post("/register", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "15 minutes"
      }
    },
    schema: {
        body: registerSchema,
    },
  }, async(request, reply) => {
    const {email, password} = request.body;

    const existingUser = await prisma.user.findUnique({where: {email}});
    if (existingUser) {
      return sendError(reply, HTTP_STATUS.BAD_REQUEST, "User already exists with this email", "USER_ALREADY_EXISTS")
    } 

    const hashedPassword = await Bun.password.hash(password);

    const user = await prisma.user.create({
        data: {email, password: hashedPassword},
        select: {id: true, email: true, createdAt: true},
    })

    const token = app.jwt.sign({
        id: user.id, email: user.email
    })

    return sendSuccess(reply, HTTP_STATUS.CREATED, {user, token}, "User registered successfully");
  });

  fastify.post("/login", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "15 minutes"
      }
    },
    schema: { 
        body: loginSchema
    }
  }, async (request, reply) => {
      const {email, password} = request.body;

      const user = await prisma.user.findUnique({ where: {email}});
      if (!user) {
          return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid email or password", "INVALID_CREDENTIALS")
      }

      const isPasswordvalid = await Bun.password.verify(password, user.password)
      if(!isPasswordvalid) {
          return sendError(reply, HTTP_STATUS.UNAUTHORIZED, "Invalid email or password", "INVALID_CREDENTIALS")
      }

      const token = app.jwt.sign({ id: user.id, email: user.email });

      return sendSuccess(reply, HTTP_STATUS.OK, { user: { id: user.id, email: user.email }, token }, "Login successful");
  })

  fastify.get( "/me", {
    onRequest: [authenticate],
  }, async(request, reply) => {
    return sendSuccess(reply, HTTP_STATUS.OK, {user: request.user}, "User fetched successfully");
  })
}