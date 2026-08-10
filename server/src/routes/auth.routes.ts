import type { FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { loginSchema, registerSchema } from "../validator/auth.validator";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS } from "../constants/http-status";
import { authenticate } from "../lib/middleware";

export async function authRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.post("/register", {
    schema: {
        body: registerSchema,
    },
  }, async(request, reply) => {
    const {email, password} = request.body;

    const existingUser = await prisma.user.findUnique({where: {email}});
    if (existingUser) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({message: "User already exists with this email"})
    } 

    const hashedPassword = await Bun.password.hash(password);

    const user = await prisma.user.create({
        data: {email, password: hashedPassword},
        select: {id: true, email: true, createdAt: true},
    })

    const token = app.jwt.sign({
        id: user.id, email: user.email
    })

    return reply.status(HTTP_STATUS.CREATED).send({message: "User registered successfully", token, user});
  });

  fastify.post("/login", {
    schema: { 
        body: loginSchema
    }
  }, async (request, reply) => {
      const {email, password} = request.body;

      const user = await prisma.user.findUnique({ where: {email}});
      if (!user) {
          return reply.status(HTTP_STATUS.UNAUTHORIZED).send({ error: "Invalid email or password"});
      }

      const isPasswordvalid = await Bun.password.verify(password, user.password)
      if(!isPasswordvalid) {
          return reply.status(HTTP_STATUS.UNAUTHORIZED).send({ error: "Invalid email or password"});
      }

      const token = app.jwt.sign({ id: user.id, email: user.email });

      return reply.status(HTTP_STATUS.OK).send({
          message: "Login successful",
          user: {id: user.id, email: user.email},
          token
      })
  })

  fastify.get( "/me", {
    onRequest: [authenticate],
  }, async(request, reply) => {
    return reply.status(HTTP_STATUS.OK).send({ user: request.user })
  })
}