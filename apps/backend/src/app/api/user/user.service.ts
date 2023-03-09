import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { hashString } from '../../common/hashString';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { checkHashedString } from '../../common/checkHashedString';
import { TokenService } from '../token/token.service';
import { CategoryService } from '../category/category.service';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { TimeLogService } from '../time-log/time-log.service';
import { Prisma, Timezone, User } from '@prisma/client';
import {
  ColumnSortOption,
  Limits,
  MeExtendedOption,
  Timezones,
} from '@test1/shared';
import { LoggerService } from '../../common/logger/loger.service';
import { nanoid } from 'nanoid';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly categoryService: CategoryService,
    private readonly subcategoryService: SubcategoryService,
    private readonly timeLogService: TimeLogService,
    private loggerService: LoggerService
  ) {}

  public getNewControlValue(user: User): string {
    const newControlValue = nanoid();
    this.updateControlValue(user.id, newControlValue);
    return newControlValue;
  }

  public async getMeExtended(
    id: string,
    extend: MeExtendedOption[]
  ): Promise<{
    user: User;
    limits: Limits;
  }> {
    const include: Prisma.UserInclude = {};
    if (
      extend.includes(MeExtendedOption.CATEGORIES) &&
      extend.includes(MeExtendedOption.SUBCATEGORIES)
    ) {
      include.categories = {
        where: { deleted: false },
        include: {
          subcategories: { where: { deleted: false } },
        },
      };
    } else if (extend.includes(MeExtendedOption.CATEGORIES)) {
      include.categories = { where: { deleted: false } };
    }

    const limits: { categoriesLimit?: number; subcategoriesLimit?: number } =
      {};
    if (extend.includes(MeExtendedOption.CATEGORIES_LIMIT)) {
      limits.categoriesLimit = this.configService.get<number>(
        'MAX_NUMBER_OF_CATEGORIES_PER_USER'
      );
    }
    if (extend.includes(MeExtendedOption.SUBCATEGORIES_LIMIT)) {
      limits.subcategoriesLimit = this.configService.get<number>(
        'MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY'
      );
    }
    return {
      user:
        extend.includes(MeExtendedOption.CATEGORIES) ||
        extend.includes(MeExtendedOption.SUBCATEGORIES)
          ? await this.prisma.user.findFirst({
              where: { id },
              include,
            })
          : undefined,
      limits: Object.keys(limits).length ? limits : undefined,
    };
  }

  public async cancelAllActive(user: User): Promise<
    | {
        success: true;
        message: string;
      }
    | { success: false; error: string }
  > {
    const timeLogNotEnded =
      await this.timeLogService.findFirstTimeLogWhereNotEnded(user.id);
    if (!timeLogNotEnded) {
      return {
        success: true,
        message: 'All activities were cancelled successfully.',
      };
    }
    await this.timeLogService.setTimeLogAsEnded(timeLogNotEnded.id);
    const category = await this.categoryService.setCategoryActiveState(
      timeLogNotEnded.categoryId,
      false
    );
    if (timeLogNotEnded.subcategoryId) {
      const subcategory =
        await this.subcategoryService.setSubcategoryActiveState(
          timeLogNotEnded.subcategoryId,
          false
        );
      if (subcategory.active !== false) {
        return {
          success: false,
          error: 'Could not set subcategory active state',
        };
      }
    }
    if (category.active !== false) {
      return {
        success: false,
        error: 'Could not set category active state',
      };
    }
    return {
      success: true,
      message: 'All activities were cancelled successfully.',
    };
  }

  public async createNewUser(
    data: { email: string; plainPassword: string; timezone: Timezones },
    options?: { generateToken: boolean }
  ): Promise<
    | { success: false; error: string }
    | { success: true; user: User; token?: string }
  > {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: data.email,
          password: await hashString(
            data.plainPassword,
            this.configService.get<number>('SALT_ROUNDS')
          ),
          timezone: Timezones[data.timezone] as Timezone,
        },
      });
      if (!options?.generateToken) {
        return { success: true, user: newUser };
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
        user: newUser,
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
  }): Promise<
    | { success: false; error: string }
    | { success: true; token: string; user: User }
  > {
    const requestedUser = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    const VALIDATION_ERROR = {
      success: false,
      error: 'Email or password does not match',
    } as { success: false; error: string };
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
      user: requestedUser,
    };
  }

  async setSortingCategories(user: User, sortingCategories: ColumnSortOption) {
    if (user.sortingCategories === sortingCategories) {
      return { success: true, sortingCategories };
    }
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { sortingCategories },
        select: { sortingCategories: true },
      });
      if (updatedUser.sortingCategories === sortingCategories) {
        return { success: true, sortingCategories };
      }
    } catch (error) {
      this.loggerService.error(error);
    }

    return {
      success: false,
      error: `Could not update sortingCategories to: ${ColumnSortOption}`,
    };
  }

  private async updateControlValue(userId: string, controlValue: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { controlValue },
    });
  }
}
