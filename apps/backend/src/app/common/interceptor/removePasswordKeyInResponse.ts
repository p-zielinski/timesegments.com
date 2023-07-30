import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import removeKeyInObject from '../removeKeyInObject';

@Injectable()
export class RemovePasswordKeyFromResponse implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((data) => removeKeyInObject(data, 'password')));
  }
}
