import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function registerGlobalErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    console.error(
      'Global Error Handler:',
      {
        error,
        method: request.method,
        url: request.url,
        body: request.body,
        params: request.params,
        query: request.query,
      }
    );
    const statusCode = (error as any).statusCode || 500;
    const responseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: error.message || 'Internal Server Error',
      is_err: true,
    };
    reply.status(statusCode).send(responseBody);
  });
}