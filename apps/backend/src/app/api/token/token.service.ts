import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma, Token, User } from '@prisma/client';
import { LoggerService } from '../../common/logger/loger.service';

const isDate = (date: object) => {
  return date instanceof Date && !isNaN(date.valueOf());
};

@Injectable()
export class TokenService {
  constructor(
    private prisma: PrismaService,
    private loggerService: LoggerService
  ) {}

  async deleteUsersTokensButOne(tokenId: string, user: User) {
    const tokens = await this.findUsersTokens(user.id);
    const tokensToDelete = tokens
      .map((token) => token.id)
      .filter((_tokenId) => _tokenId !== tokenId);
    if (tokensToDelete.length > 0) {
      await this.deleteMany(tokensToDelete);
    }
    return {
      success: true,
      message: `Other tokens were successfully deleted`,
    };
  }

  async deleteSingleToken(tokenId: string, user: User) {
    const token = await this.findOne(tokenId, { user: true });
    if (!token || token?.user?.id !== user.id) {
      return {
        success: false,
        error: `Token not found, bad request`,
      };
    }
    const deleteResult = await this.deleteOne(tokenId);
    if (!deleteResult?.id) {
      return {
        success: false,
        error: `Could not delete token`,
      };
    }
    return {
      success: true,
      message: `Token "${tokenId}" was deleted`,
    };
  }

  async generateToken(
    userId: string,
    expiresAt: string | Date,
    userAgent: string
  ): Promise<Token> {
    if (!!expiresAt && typeof expiresAt !== 'string' && !isDate(expiresAt)) {
      throw new HttpException({}, HttpStatus.BAD_REQUEST);
    }
    try {
      const token = await this.prisma.token.create({
        data: {
          userId: userId,
          expiresAt: expiresAt,
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
}
