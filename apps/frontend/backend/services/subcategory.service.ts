import { Category, Prisma, Subcategory, User } from '@prisma/client';
import {
  createNewTimeLog,
  findFirstTimeLogWhereNotEnded,
  setTimeLogAsEnded,
} from './time-log.service';
import {
  findCategoryIfNotDeleted,
  setCategoryActiveState,
} from './category.service';
import { subcategoriesLimit } from './config.service';
import { prisma } from './prisma.service';

export const createSubcategory = async (
  user: User,
  categoryId: string,
  name: string,
  color: string
): Promise<{ success: boolean; error?: string; subcategory?: Subcategory }> => {
  const categoryWithUser = await findCategoryIfNotDeleted(categoryId, {
    user: true,
  });
  if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Subcategory not found, bad request`,
    };
  }
  if (
    (await countCategorySubcategoriesNotDeleted(categoryId)) >
    subcategoriesLimit
  ) {
    return {
      success: false,
      error: `Max number of subcategories per category ${categoryId} was exceeded`,
    };
  }
  const subcategory = await prisma.subcategory.create({
    data: {
      name: name,
      categoryId: categoryId,
      userId: user.id,
      color: color ? color : null,
    },
  });
  if (!subcategory?.id) {
    return {
      success: false,
      error: `Could not create subcategory`,
    };
  }
  return { success: true, subcategory };
};

export const updateVisibilitySubcategory = async (
  subcategoryId: string,
  visible: boolean,
  user: User
): Promise<{ success: boolean; error?: string; subcategory?: Subcategory }> => {
  const subcategoryWithUser = await findSubcategoryIfNotDeleted(subcategoryId, {
    user: true,
  });
  if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Subcategory not found, bad request`,
    };
  }
  if (subcategoryWithUser.active) {
    return {
      success: false,
      error: `You cannot hide active subcategory`,
    };
  }
  if (subcategoryWithUser.visible === visible) {
    return {
      success: true,
      subcategory: { ...subcategoryWithUser, user: undefined } as Subcategory,
    };
  }
  const updatedSubcategory = await updateVisibility(subcategoryId, visible);
  if (updatedSubcategory.visible !== visible) {
    return {
      success: false,
      error: `Could not update visibility`,
    };
  }
  return { success: true, subcategory: updatedSubcategory };
};

export const setSubcategoryActive = async (
  subcategoryId: string,
  user: User
): Promise<
  | {
      success: true;
      subcategory: Subcategory;
      category: Category;
    }
  | { success: false; error: string }
> => {
  const subcategoryWithUserAndCategory = await findSubcategoryIfNotDeleted(
    subcategoryId,
    {
      user: true,
      category: true,
    }
  );
  if (
    !subcategoryWithUserAndCategory ||
    subcategoryWithUserAndCategory?.user?.id !== user.id
  ) {
    return {
      success: false,
      error: `Subcategory not found, bad request`,
    };
  }
  const timeLogNotEnded = await findFirstTimeLogWhereNotEnded(user.id);
  if (!timeLogNotEnded) {
    await createNewTimeLog(
      user.id,
      subcategoryWithUserAndCategory.category.id,
      subcategoryWithUserAndCategory.id
    );
    const category = await setCategoryActiveState(
      subcategoryWithUserAndCategory.category.id,
      true
    );
    return {
      success: true,
      category,
      subcategory: await setSubcategoryActiveState(
        subcategoryWithUserAndCategory.id,
        true
      ),
    };
  }
  if (
    timeLogNotEnded.categoryId === subcategoryWithUserAndCategory.category.id
  ) {
    await setTimeLogAsEnded(timeLogNotEnded.id);
    if (timeLogNotEnded.subcategoryId === subcategoryWithUserAndCategory.id) {
      const category = await setCategoryActiveState(
        subcategoryWithUserAndCategory.category.id,
        false
      );
      return {
        success: true,
        category,
        subcategory: await setSubcategoryActiveState(
          subcategoryWithUserAndCategory.id,
          false
        ),
      };
    }
    if (timeLogNotEnded.subcategoryId) {
      await setSubcategoryActiveState(timeLogNotEnded.subcategoryId, false);
    }
    await createNewTimeLog(
      user.id,
      subcategoryWithUserAndCategory.category.id,
      subcategoryWithUserAndCategory.id
    );
    return {
      success: true,
      category: subcategoryWithUserAndCategory.category,
      subcategory: await setSubcategoryActiveState(
        subcategoryWithUserAndCategory.id,
        true
      ),
    };
  }
  await setTimeLogAsEnded(timeLogNotEnded.id);
  await setCategoryActiveState(timeLogNotEnded.categoryId, false);
  if (timeLogNotEnded.subcategoryId) {
    await setSubcategoryActiveState(timeLogNotEnded.subcategoryId, false);
  }
  await createNewTimeLog(
    user.id,
    subcategoryWithUserAndCategory.category.id,
    subcategoryWithUserAndCategory.id
  );
  return {
    success: true,
    category: await setCategoryActiveState(
      subcategoryWithUserAndCategory.category.id,
      true
    ),
    subcategory: await setSubcategoryActiveState(
      subcategoryWithUserAndCategory.id,
      true
    ),
  };
};

export const updateSubcategory = async (
  user: User,
  subcategoryId: string,
  name: string,
  color?: string
) => {
  const subcategoryWithUser = await findSubcategoryIfNotDeleted(subcategoryId, {
    user: true,
  });
  if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Subcategory not found, bad request`,
    };
  }
  if (
    subcategoryWithUser.name === name &&
    subcategoryWithUser.color === color
  ) {
    return {
      success: true,
      subcategory: { ...subcategoryWithUser, user: undefined },
    };
  }
  const updatedSubcategory = await updateNameAndColor(
    subcategoryId,
    name,
    color
  );
  return { success: true, subcategory: updatedSubcategory };
};

export const setSubcategoryAsDeleted = async (
  subcategoryId: string,
  user: User
) => {
  const subcategoryWithUser = await findSubcategoryIfNotDeleted(subcategoryId, {
    user: true,
  });
  if (!subcategoryWithUser || subcategoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Subcategory not found, bad request`,
    };
  }
  if (subcategoryWithUser.active || subcategoryWithUser.visible) {
    return {
      success: false,
      error: `Category cannot be deleted, bad request`,
    };
  }
  const updatedSubcategory = await updateDeleted(subcategoryId, true);
  return { success: true, subcategory: updatedSubcategory };
};

export const setSubcategoryActiveState = async (
  subcategoryId: string,
  active: boolean
) => {
  return await prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { active },
  });
};

export const findManySubcategoriesIfInIdList = async (
  subcategoriesIds: string[]
) => {
  return await prisma.subcategory.findMany({
    where: { id: { in: subcategoriesIds } },
  });
};

const countCategorySubcategoriesNotDeleted = async (categoryId: string) => {
  return await prisma.subcategory.count({ where: { categoryId } });
};

const findSubcategoryIfNotDeleted = async (
  subcategoryId: string,
  include: Prisma.SubcategoryInclude = null
) => {
  return await prisma.subcategory.findFirst({
    where: { id: subcategoryId, deleted: false },
    include,
  });
};

const updateVisibility = async (subcategoryId: string, visible: boolean) => {
  return await prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { visible },
  });
};

const updateDeleted = async (subcategoryId: string, deleted: boolean) => {
  return await prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { deleted },
  });
};

const updateNameAndColor = async (
  subcategoryId: string,
  name: string,
  color?: string
) => {
  return await prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { name, color: color ?? null },
  });
};
