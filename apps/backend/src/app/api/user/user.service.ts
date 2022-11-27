import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { hashString } from '../../common/hashString';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async createNewUser(
    data: { email: string; plainPassword: string },
    options?: { generateToken: boolean }
  ): Promise<{ success: boolean; error?: string; token?: string }> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: data.email,
          password: await hashString(
            data.plainPassword,
            this.configService.get<number>('SALT_ROUNDS') ?? 10
          ),
        },
      });
      if (!options?.generateToken) {
        return { success: true };
      }
      const token = await this.prisma.token.create({
        data: {
          userId: newUser.id,
          expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 60),
        },
      });
      return { success: true, token: token.id };
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
}
