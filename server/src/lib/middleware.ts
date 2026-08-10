import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "../constants/http-status";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try{
        await request.jwtVerify();
    } catch (err) {
        return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
            error: "Unauthorized",
            message: "Invalid or missing token"
        })
    }
}