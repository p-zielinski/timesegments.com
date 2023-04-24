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
      const payload = await this.jwtService.verifyAsync(jwtToken, {
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
        console.log('missing token lub user in database');
        return false;
      }
      if (
        token.expiresAt &&
        token.expiresAt?.getTime() < new Date().getTime()
      ) {
        this.tokenService.deleteOne(token.id); //don't wait
        return false;
      }
      const tokenWithoutUserRelation = { ...token, user: undefined };
      request['user'] = token.user;
      request['currentToken'] = tokenWithoutUserRelation as Token;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    console.log(request.headers);
    const { jwt_token } = request.headers;
    return typeof jwt_token === 'string' ? jwt_token : undefined;
  }
}
