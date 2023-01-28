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
import { User, Prisma } from '@prisma/client';
import { Limits, MeExtendedOption } from '@test1/shared';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly categoryService: CategoryService,
    private readonly subcategoryService: SubcategoryService,
    private readonly timeLogService: TimeLogService
  ) {}

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
      include.categories = { include: { subcategories: true } };
    } else if (extend.includes(MeExtendedOption.CATEGORIES)) {
      include.categories = true;
    }
    const user = await this.prisma.user.findFirst({
      where: { id },
      include,
    });

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
      user,
      limits: Object.keys(limits).length ? limits : undefined,
    };
  }

  public async cancelAllActive(userId: string) {
    const { categories, subcategories } = (await this.prisma.user.findFirst({
      where: { id: userId },
      include: { categories: true, subcategories: true },
    })) || { categories: [], subcategories: [] };
    const activeCategories = categories.filter((category) => category.active);
    const activeSubcategories = subcategories.filter(
      (subcategory) => subcategory.active
    );
    const activeTimeLogId =
      await this.timeLogService.findFirstTimeLogWhereNotEnded(userId);
    if (
      !(
        activeTimeLogId ||
        activeCategories.length ||
        activeSubcategories.length
      )
    ) {
      return {
        status: true,
        message: 'All activities were cancelled successfully.',
      };
    }
    activeCategories.forEach((category) =>
      this.categoryService.setCategoryActiveState(category.id, false)
    );
    activeSubcategories.forEach((subcategory) =>
      this.subcategoryService.setSubcategoryActiveState(subcategory.id, false)
    );
    if (activeTimeLogId) {
      await this.timeLogService.setTimeLogAsEnded(activeTimeLogId); //don't wait
    }
    return {
      status: true,
      message: 'All activities were cancelled successfully.',
    };
  }

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
