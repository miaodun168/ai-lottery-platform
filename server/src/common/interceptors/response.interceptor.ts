import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { ApiResponse } from '../dto/api-response.dto'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<ApiResponse> {
    return next.handle().pipe(map(data => ApiResponse.ok(data)))
  }
}
