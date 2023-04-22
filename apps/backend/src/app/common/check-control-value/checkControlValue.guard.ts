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
export class CheckControlValueGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const { user } = request.user;
      const bodyControlValue = request.body?.controlValue;
      if (
        typeof bodyControlValue === 'string' &&
        user.controlValue === request.body.controlValue
      ) {
        return true;
      }
    } catch (error) {
      Logger.error(error);
    }
    throw new HttpException({ controlValue: 'invalid' }, HttpStatus.CONFLICT);
  }
}
