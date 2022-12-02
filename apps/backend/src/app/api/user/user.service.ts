import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { hashString } from '../../common/hashString';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { checkHashedString } from '../../common/checkHashedString';
import { TokenService } from '../token/token.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly tokenService: TokenService
  ) {}

  public async createNewUser(
    data: { email: string; plainPassword: string },
    options?: { generateToken: boolean }
  ): Promise<{ success: boolean; error?: string; token?: string }> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: data.email,
          password: await hashString(
            data.plainPassword,
            this.configService.get<number>('SALT_ROUNDS')
          ),
        },
      });
      if (!options?.generateToken) {
        return { success: true };
      }
      const token = await this.tokenService.generateToken(
        newUser.id,
        new Date(Date.now() + 3600 * 1000 * 24 * 60)
      );
      return {
        success: true,
        token: this.jwtService.sign({
          userId: newUser.id,
          tokenId: token.id,
          expiresAt: token.expiresAt,
        }),
      };
    } catch (error) {
      if (error?.meta?.target?.includes('email')) {
        return { success: false, error: 'This email is already taken' };
      }
      return {
        success: false,
        error:
          typeof error?.message === 'string'
            ? error?.message?.trim()
            : error?.message ?? 'Unknown error',
      };
    }
  }

  public async validateUser(data: {
    password: string;
    email: string;
  }): Promise<{ success: boolean; error?: string; token?: string }> {
    const requestedUser = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    const VALIDATION_ERROR = {
      success: false,
      error: 'Email or password does not match',
    };
    if (
      !requestedUser?.password ||
      !(await checkHashedString(data.password, requestedUser.password))
    ) {
      return VALIDATION_ERROR;
    }
    const token = await this.tokenService.generateToken(
      requestedUser.id,
      new Date(Date.now() + 3600 * 1000 * 24 * 60)
    );
    return {
      success: true,
      token: this.jwtService.sign({
        userId: requestedUser.id,
        tokenId: token.id,
        expiresAt: token.expiresAt,
      }),
    };
  }
}
