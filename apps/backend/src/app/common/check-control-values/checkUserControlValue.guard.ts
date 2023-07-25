import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CheckUserControlValueGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const { user } = request;
      const bodyControlValue = request.body?.userControlValue;
      if (
        typeof bodyControlValue === 'string' &&
        user.controlValue === request.body.userControlValue
      ) {
        return true;
      }
    } catch (error) {
      Logger.error(error);
    }
    throw new HttpException(
      { userControlValue: 'invalid' },
      HttpStatus.CONFLICT
    );
  }
}
