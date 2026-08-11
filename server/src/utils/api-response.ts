export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        code: string;
        details?: any;
    };
    meta?: Record<string, any>
}

export function sendSuccess<T> (
    reply: any,
    statusCode: number,
    data?: T,
    message?: string,
    meta?: Record<string, any>
) {
    return reply.status(statusCode).send({
        success: true,
        ...(message && {message}),
        ...(data !== undefined && {data}),
        ...(meta && {meta})
    });
}

export function sendError<T> (
    reply: any,
    statusCode: number,
    message: string,
    errorCode?: string,
    details?: any
) {
    return reply.status(statusCode).send({
        success: false,
        message,
        error: {
            code: errorCode || getErrorCodeFromStatus(statusCode),
            ...(details && {details}),
        }
    });
}


function getErrorCodeFromStatus(statusCode: number): string {
    switch ( statusCode) {
        case 400: return "BAD_REQUEST";
        case 401: return "UNAUTHORIZED";
        case 403: return "FORBIDDEN";
        case 404: return "NOT_FOUND";
        case 429: return "TOO_MANY_REQUESTS";
        default: return "INTERNAL_SERVER_ERROR";
    }
}