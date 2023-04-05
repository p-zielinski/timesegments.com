import { Prisma, PrismaClient, Timezone, User } from '@prisma/client';
import { isNumber } from 'lodash';
import { hashString } from './utils/hashString';
import { generateToken } from './token';
import { createJWT } from './jwt';
import { Limits, MeExtendedOption } from '@test1/shared';
import { categoriesLimit, subcategoriesLimit } from './configService';

const prisma = new PrismaClient();
export const createNewUser = async (
  data: { email: string; plainPassword: string; timezone: Timezone },
  options?: { generateToken: boolean }
): Promise<
  | { success: false; error: string }
  | { success: true; user: User; token?: string }
> => {
  try {
    const processEnvSaltRounds = process.env?.['SALT_ROUNDS'];
    const saltRounds = isNumber(Number(processEnvSaltRounds))
      ? Number(processEnvSaltRounds)
      : 10;
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: await hashString(data.plainPassword, saltRounds),
        timezone: Timezone[data.timezone],
      },
    });
    if (!options?.generateToken) {
      return { success: true, user: newUser };
    }
    const token = await generateToken(
      newUser.id,
      new Date(Date.now() + 3600 * 1000 * 24 * 400)
    );
    return {
      success: true,
      token: createJWT({
        userId: newUser.id,
        tokenId: token.id,
        expiresAt: token.expiresAt,
      }),
      user: newUser,
    };
  } catch (error) {
    console.log(error);
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
};

export const getMeExtended = async (
  id: string,
  extend: MeExtendedOption[]
): Promise<{
  user: User;
  limits: Limits;
}> => {
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

  const limits: { categoriesLimit?: number; subcategoriesLimit?: number } = {};
  if (extend.includes(MeExtendedOption.CATEGORIES_LIMIT)) {
    limits.categoriesLimit = categoriesLimit;
  }
  if (extend.includes(MeExtendedOption.SUBCATEGORIES_LIMIT)) {
    limits.subcategoriesLimit = subcategoriesLimit;
  }
  return {
    user:
      extend.includes(MeExtendedOption.CATEGORIES) ||
      extend.includes(MeExtendedOption.SUBCATEGORIES)
        ? await prisma.user.findFirst({
            where: { id },
            include,
          })
        : undefined,
    limits: Object.keys(limits).length ? limits : undefined,
  };
};

export class UserService {
  private prisma;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // public getNewControlValue(user: User): string {
  //   const newControlValue = nanoid();
  //   this.updateControlValue(user.id, newControlValue);
  //   return newControlValue;
  // }
  //

  //
  // public async cancelAllActive(user: User): Promise<
  //   | {
  //       success: true;
  //       message: string;
  //     }
  //   | { success: false; error: string }
  // > {
  //   const timeLogNotEnded =
  //     await this.timeLogService.findFirstTimeLogWhereNotEnded(user.id);
  //   if (!timeLogNotEnded) {
  //     return {
  //       success: true,
  //       message: 'All activities were cancelled successfully.',
  //     };
  //   }
  //   await this.timeLogService.setTimeLogAsEnded(timeLogNotEnded.id);
  //   const category = await this.categoryService.setCategoryActiveState(
  //     timeLogNotEnded.categoryId,
  //     false
  //   );
  //   if (timeLogNotEnded.subcategoryId) {
  //     const subcategory =
  //       await this.subcategoryService.setSubcategoryActiveState(
  //         timeLogNotEnded.subcategoryId,
  //         false
  //       );
  //     if (subcategory.active !== false) {
  //       return {
  //         success: false,
  //         error: 'Could not set subcategory active state',
  //       };
  //     }
  //   }
  //   if (category.active !== false) {
  //     return {
  //       success: false,
  //       error: 'Could not set category active state',
  //     };
  //   }
  //   return {
  //     success: true,
  //     message: 'All activities were cancelled successfully.',
  //   };
  // }

  // public async validateUser(data: {
  //   password: string;
  //   email: string;
  // }): Promise<
  //   | { success: false; error: string }
  //   | { success: true; token: string; user: User }
  // > {
  //   const requestedUser = await this.prisma.user.findFirst({
  //     where: { email: data.email },
  //   });
  //   const VALIDATION_ERROR = {
  //     success: false,
  //     error: 'Email or password does not match',
  //   } as { success: false; error: string };
  //   if (
  //     !requestedUser?.password ||
  //     !(await checkHashedString(data.password, requestedUser.password))
  //   ) {
  //     return VALIDATION_ERROR;
  //   }
  //   const token = await this.tokenService.generateToken(
  //     requestedUser.id,
  //     new Date(Date.now() + 3600 * 1000 * 24 * 60)
  //   );
  //   return {
  //     success: true,
  //     token: this.jwtService.sign({
  //       userId: requestedUser.id,
  //       tokenId: token.id,
  //       expiresAt: token.expiresAt,
  //     }),
  //     user: requestedUser,
  //   };
  // }

  // async setSortingCategories(user: User, sortingCategories: ColumnSortOption) {
  //   if (user.sortingCategories === sortingCategories) {
  //     return { success: true, sortingCategories };
  //   }
  //   try {
  //     const updatedUser = await this.prisma.user.update({
  //       where: { id: user.id },
  //       data: { sortingCategories },
  //       select: { sortingCategories: true },
  //     });
  //     if (updatedUser.sortingCategories === sortingCategories) {
  //       return { success: true, sortingCategories };
  //     }
  //   } catch (error) {
  //     this.loggerService.error(error);
  //   }
  //
  //   return {
  //     success: false,
  //     error: `Could not update sortingCategories to: ${ColumnSortOption}`,
  //   };
  // }

  private async updateControlValue(userId: string, controlValue: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { controlValue },
    });
  }
}
