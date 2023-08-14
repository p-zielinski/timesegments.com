import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma, Token, User } from '@prisma/client';
import { LoggerService } from '../../common/logger/loger.service';

@Injectable()
export class TokenService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService
  ) {}

  async invalidateSingleToken(tokenId: string, user: User) {
    const token = await this.findOne(tokenId, { user: true });
    if (!token || token?.user?.id !== user.id) {
      return {
        success: false,
        error: `Token not found, bad request`,
      };
    }
    const invalidateTokenResult = await this.updateValid(tokenId, false);
    if (!invalidateTokenResult?.id) {
      return {
        success: false,
        error: `Could not invalidate token`,
      };
    }
    return {
      success: true,
      message: `Token "${tokenId}" was deleted`,
    };
  }

  async invalidateUsersTokensButOne(tokenId: string, user: User) {
    await this.updateManyValid(user.id, tokenId, false);
    return {
      success: true,
      message: `Other tokens were successfully deleted`,
    };
  }

  async generateToken(userId: string, userAgent: string): Promise<Token> {
    try {
      const token = await this.prisma.token.create({
        data: {
          userId: userId,
          userAgent,
        },
      });
      if (!token?.id) {
        throw new HttpException({}, HttpStatus.BAD_REQUEST);
      }
      return token;
    } catch (e) {
      this.loggerService.error(e.message);
      throw new HttpException({}, HttpStatus.BAD_REQUEST);
    }
  }

  async findUsersTokens(userId: string) {
    return await this.prisma.token.findMany({ where: { userId } });
  }

  async findOne(tokenId: string, include: Prisma.TokenInclude = null) {
    return await this.prisma.token.findFirst({
      where: { id: tokenId },
      include,
    });
  }

  async deleteOne(tokenId: string) {
    return await this.prisma.token.delete({
      where: { id: tokenId },
    });
  }

  async deleteMany(tokenIds: string[]): Promise<{ count?: number }> {
    return await this.prisma.token.deleteMany({
      where: { id: { in: tokenIds } },
    });
  }

  async updateValid(tokenId: string, valid: boolean) {
    return await this.prisma.token.update({
      where: { id: tokenId },
      data: { valid },
    });
  }

  async updateManyValid(userId, skipTokenId: string, valid: boolean) {
    return await this.prisma.token.updateMany({
      where: {
        userId,
        id: {
          not: {
            equals: skipTokenId,
          },
        },
      },
      data: { valid },
    });
  }
}
