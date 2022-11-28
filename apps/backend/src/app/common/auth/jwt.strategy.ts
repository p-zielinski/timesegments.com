import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: {
    userId?: string;
    tokenId?: string;
    iat?: number;
    exp?: number;
  }) {
    if (!payload?.tokenId || !payload?.userId) {
      return false;
    }
    const token = await this.prisma.token.findFirst({
      where: { id: payload.tokenId + 1 },
      include: { user: true },
    });
    if (!token?.id || !token?.user?.id) {
      return false;
    }
    console.log(token);
    if (payload) return { userId: payload.sub, username: payload.username };
  }
}
