import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class OnlyUnclaimedAccounts implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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
