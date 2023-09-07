import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../../api/token/token.service';
import { Token } from '@prisma/client';
import { getNumberOfMsInDesiredNumberOfDays } from '../utils/getNumberOfMsInDesiredNumberOfDays';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private tokenService: TokenService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtToken = this.extractTokenFromHeader(request);
    if (!jwtToken) {
      console.log('missing jwt token');
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verify(jwtToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      if (!payload?.tokenId || !payload?.userId) {
        console.log('missing correct payload');
        return false;
      }
      const token = await this.tokenService.findOne(payload.tokenId, {
        user: true,
      });
      if (!token?.id || !token?.user?.id) {
        console.log('missing token or user in database');
        return false;
      }
      if (!token.valid) {
        return false;
      }
      const tokenWithoutUserRelation = { ...token, user: undefined };
      request.user = token.user;
      if (!request.user.email) {
        if (
          new Date(
            new Date().getTime() +
              getNumberOfMsInDesiredNumberOfDays(
                this.configService.get<number>(
                  'NUMBER_OF_DAYS_TO_ACTIVATE_ACCOUNT'
                )
              )
          ).getTime() > new Date(request.user.createdAt).getTime()
        ) {
          throw new UnauthorizedException();
        }
      }
      request.currentToken = tokenWithoutUserRelation as Token;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    const { authorization } = request.headers;
    if (typeof authorization !== 'string') {
      return;
    }
    if (!authorization.includes(' ')) {
      return;
    }
    return authorization.split(' ').at(-1);
  }
}
