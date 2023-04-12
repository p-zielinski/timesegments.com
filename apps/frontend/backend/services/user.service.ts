import { Prisma, Timezone, User } from '@prisma/client';
import { isNumber } from 'lodash';
import { hashString } from '../utils/hashString';
import { generateToken } from './token.service';
import { createJWT } from './jwt.service';
import { ColumnSortOption, Limits, MeExtendedOption } from '@test1/shared';
import { categoriesLimit, subcategoriesLimit } from './config.service';
import { nanoid } from 'nanoid';
import { checkHashedString } from '../utils/checkHashedString';
import {
  findFirstTimeLogWhereNotEnded,
  setTimeLogAsEnded,
} from './time-log.service';
import { setCategoryActiveState } from './category.service';
import { setSubcategoryActiveState } from './subcategory.service';
import { prisma } from './prisma.service';

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
  userId: string,
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
            where: { id: userId },
            include,
          })
        : undefined,
    limits: Object.keys(limits).length ? limits : undefined,
  };
};

const updateControlValue = async (userId: string, controlValue: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { controlValue },
  });
};

export const getNewControlValue = async (user: User) => {
  const newControlValue = nanoid();
  await updateControlValue(user.id, newControlValue);
  return newControlValue;
};

export const cancelAllActive = async (
  user: User
): Promise<
  | {
      success: true;
      message: string;
    }
  | { success: false; error: string }
> => {
  const timeLogNotEnded = await findFirstTimeLogWhereNotEnded(user.id);
  if (!timeLogNotEnded) {
    return {
      success: true,
      message: 'All activities were cancelled successfully.',
    };
  }
  await setTimeLogAsEnded(timeLogNotEnded.id);
  const category = await setCategoryActiveState(
    timeLogNotEnded.categoryId,
    false
  );
  if (timeLogNotEnded.subcategoryId) {
    const subcategory = await setSubcategoryActiveState(
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
};

export const validateUser = async (data: {
  password: string;
  email: string;
}): Promise<
  | { success: false; error: string }
  | { success: true; token: string; user: User }
> => {
  const requestedUser = await prisma.user.findFirst({
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
  const token = await generateToken(
    requestedUser.id,
    new Date(Date.now() + 3600 * 1000 * 24 * 60)
  );
  return {
    success: true,
    token: createJWT({
      userId: requestedUser.id,
      tokenId: token.id,
      expiresAt: token.expiresAt,
    }),
    user: requestedUser,
  };
};

export const setSortingCategories = async (
  user: User,
  sortingCategories: ColumnSortOption
) => {
  if (user.sortingCategories === sortingCategories) {
    return { success: true, sortingCategories };
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { sortingCategories },
      select: { sortingCategories: true },
    });
    if (updatedUser.sortingCategories === sortingCategories) {
      return { success: true, sortingCategories };
    }
  } catch (error) {
    // this.loggerService.error(error);
  }

  return {
    success: false,
    error: `Could not update sortingCategories to: ${ColumnSortOption}`,
  };
};
