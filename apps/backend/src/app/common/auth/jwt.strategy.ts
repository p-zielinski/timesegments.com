import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User, Token } from '@prisma/client';
import { TokenService } from '../../api/token/token.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private tokenService: TokenService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('jwt_token'),
      ignoreExpiration: false,
      secretOrKey: configService.get<number>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    userId?: string;
    tokenId?: string;
    expiresAt?: string;
  }): Promise<{ user: User; currentToken: Token } | false> {
    if (!payload?.tokenId || !payload?.userId) {
      return false;
    }
    const token = await this.tokenService.findOne(payload.tokenId, {
      user: true,
    });
    if (!token?.id || !token?.user?.id) {
      return false;
    }
    if (token.expiresAt && token.expiresAt?.getTime() < new Date().getTime()) {
      this.tokenService.deleteOne(token.id); //don't wait
      return false;
    }
    const tokenWithoutUserRelation = {};
    Object.keys(token).forEach((key) => {
      if (key !== 'user') {
        tokenWithoutUserRelation[key] = token[key];
      }
    });

    return {
      user: token.user,
      currentToken: tokenWithoutUserRelation as Token,
    };
  }
}