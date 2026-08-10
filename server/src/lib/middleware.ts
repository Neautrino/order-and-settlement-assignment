import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "../constants/http-status";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {

    const authHeader = request.headers.authorization;
    if(!authHeader) {
        return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
            error: "Unauthorized",
            message: "Authorization header is missing"
        })
    }

    if(!authHeader.startsWith("Bearer ")){
        return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
            error: "Unauthorized",
            message: "Authorization header must start with Bearer"
        })
    }

    try{
        await request.jwtVerify();

        if(!request.user || !request.user.id) {
            return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
                error: "Unauthorized",
                message: "Invalid token payload structure"
            })
        }
    } catch (err:any) {

        if (err.code === "FAST_JWT_EXPIRED" || err.message?.includes("expired")){
            return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
                error: "Unauthorized",
                message: "Token has expired. Please log in again"
            })
        }

        return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
            error: "Unauthorized",
            message: "Invalid or corrupted authentication token"
        })
    }
}