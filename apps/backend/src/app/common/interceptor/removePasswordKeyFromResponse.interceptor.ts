import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import setKeyInObjectAsUndefined from '../setKeyInObjectAsUndefined';

@Injectable()
export class RemovePasswordKeyFromResponse implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((data) => setKeyInObjectAsUndefined(data, 'password')));
  }
}
