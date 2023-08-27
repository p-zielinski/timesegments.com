import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ControlValue } from '@test1/shared';

@Injectable()
export class OnlyUnclaimedAccounts implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const typesOfControlValuesToCheck = this.reflector.get<ControlValue[]>(
      'typesOfControlValuesToCheck',
      context.getHandler()
    );
    if (!typesOfControlValuesToCheck) {
      throw new HttpException(
        { error: `Types of control values to check were not defined` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const request = context.switchToHttp().getRequest();
    request.importantControlValues = typesOfControlValuesToCheck;
    const { user } = request;
    if (!user) {
      throw new HttpException(
        { error: `User was not defined` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    if (user.email) {
      throw new HttpException(
        { error: `This endpoint is only for unclaimed users` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return true;
  }
}
