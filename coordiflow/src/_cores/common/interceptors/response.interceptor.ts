import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

class ApiResponse<T> {
  constructor(
    public data: T,
    public message: string = 'Success',
    public statusCode: number = 200,
  ) { }
}

class Meta {
  current_page: number;
  last_page: number;
  total: number;
}
class ApiResponse2<T> {
  constructor(
    public meta: Meta,
    public data: T,
    public message: string = 'Success',
    public statusCode: number = 200,
  ) { }
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const responseStatusCode = context
          .switchToHttp()
          .getResponse().statusCode;
        if (data) {
          if (data.count != undefined) {
            const current_page = data?.limit > 0 ? Math.ceil(data.skip / data.limit) + 1 : 1;
            const last_page = data?.count > 0 ? Math.ceil(data.count / data.limit) : 1;
            const total = data.count; // Replace 0 with the actual value of count
            return new ApiResponse2<T>({ total, last_page, current_page }, data.documents, 'Success', responseStatusCode);
          } else if(data.is_not_use_response_format){
            return data.data;
          } else {
            return new ApiResponse<T>(data, 'Success', responseStatusCode);
          }
        }
        return new ApiResponse<T>({ message: 'Data not found, no cache' } as any, 'Success', responseStatusCode);
      }),
      catchError(error => {
        return throwError(() => error);
      }),
    );
  }
}
