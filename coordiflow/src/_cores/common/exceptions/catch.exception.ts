import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { appSettings } from 'src/_cores/config/appsettings';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    console.log('🚀 ~ AllExceptionsFilter ~ exception:', exception);
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    // console.log('exception', exception);

    // check if the exception is not an instance of HttpException
    if (!(exception instanceof HttpException)) {
      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: exception.toString(),
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    } else {
      const status = exception?.getStatus();

      let message = exception.getResponse()['message'];
      if (Array.isArray(message) || typeof exception.getResponse() === 'string') {
        message = exception.getResponse();
      }
      const errorResponse = {
        statusCode: status,
        timestamp: new Date(appSettings.timeZoneMongoDB.getCurrentTime()),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: message,
      };
      httpAdapter.reply(ctx.getResponse(), errorResponse, status);
    }
  }
}
