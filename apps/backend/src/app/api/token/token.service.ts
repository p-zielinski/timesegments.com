import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Token, Prisma } from '@prisma/client';
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

  async generateToken(
    userId: string,
    expiresAt: string | Date
  ): Promise<Token> {
    if (!!expiresAt && typeof expiresAt !== 'string' && !isDate(expiresAt)) {
      throw new HttpException({}, HttpStatus.BAD_REQUEST);
    }
    try {
      const token = await this.prisma.token.create({
        data: {
          userId: userId,
          expiresAt: expiresAt,
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
}
