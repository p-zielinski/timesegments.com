import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import setKeyInObjectAsUndefined from '../setKeyInObjectAsUndefined';

@Injectable()
export class RemoveSuccessKeyFromResponse implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) =>
          !!data && typeof data === 'object'
            ? { ...data, success: undefined }
            : data
        )
      );
  }
}
