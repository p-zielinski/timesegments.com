import {CallHandler, ExecutionContext, Injectable, NestInterceptor,} from '@nestjs/common';
import {map, Observable} from 'rxjs';
import removeKeyInObject from '../removeKeyInObject';

// We want to remove `success` key from response, as this is an internal designation.
// We want to make sure we never send any password, so we delete password keys.
@Injectable()
export class RemoveUnwantedKeysFromResponse implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) =>
          !!data && data instanceof Object
            ? { ...removeKeyInObject(data, 'password'), success: undefined }
            : data
        )
      );
  }
}
