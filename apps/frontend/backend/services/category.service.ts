import { Category, Prisma, PrismaClient, User } from '@prisma/client';
import {
  createNewTimeLog,
  findFirstTimeLogWhereNotEnded,
  setTimeLogAsEnded,
} from './time-log.service';
import { setSubcategoryActiveState } from './subcategory.service';
import { categoriesLimit } from './config.service';

const prisma = new PrismaClient();
export const createCategory = async (
  user: User,
  name: string,
  color: string
): Promise<{ success: boolean; error?: string; category?: Category }> => {
  if ((await countUserCategoriesNotDeleted(user.id)) > categoriesLimit) {
    return {
      success: false,
      error: `Max number of categories per user was exceeded`,
    };
  }
  const category = await prisma.category.create({
    data: { name, userId: user.id, color },
  });
  if (!category?.id) {
    return {
      success: false,
      error: `Could not create category`,
    };
  }
  return { success: true, category };
};

export const updateVisibilityCategory = async (
  categoryId: string,
  visible: boolean,
  user: User
): Promise<{ success: boolean; error?: string; category?: Category }> => {
  const categoryWithUser = await findCategoryIfNotDeleted(categoryId, {
    user: true,
  });
  if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Category not found, bad request`,
    };
  }
  if (categoryWithUser.active) {
    return {
      success: false,
      error: `You cannot hide active category`,
    };
  }
  if (categoryWithUser.visible === visible) {
    return {
      success: true,
      category: { ...categoryWithUser, user: undefined } as Category,
    };
  }
  const updatedCategory = await updateVisibility(categoryId, visible);
  if (updatedCategory.visible !== visible) {
    return {
      success: false,
      error: `Could not update visibility`,
    };
  }
  return { success: true, category: updatedCategory };
};

export const updateExpandSubcategoriesCategory = async (
  categoryId: string,
  expandSubcategories: boolean,
  user: User
): Promise<{ success: boolean; error?: string; category?: Category }> => {
  const categoryWithUser = await findCategoryIfNotDeleted(categoryId, {
    user: true,
  });
  if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Category not found, bad request`,
    };
  }
  if (categoryWithUser.expandSubcategories === expandSubcategories) {
    return {
      success: true,
      category: { ...categoryWithUser, user: undefined } as Category,
    };
  }
  const updatedCategory = await updateExpandSubcategories(
    categoryId,
    expandSubcategories
  );
  if (updatedCategory.expandSubcategories !== expandSubcategories) {
    return {
      success: false,
      error: `Could not update expandSubcategories`,
    };
  }
  return { success: true, category: updatedCategory };
};

export const setCategoryActive = async (
  categoryId: string,
  user: User
): Promise<
  { success: true; category?: Category } | { success: false; error: string }
> => {
  const categoryWithUser = await findCategoryIfNotDeleted(categoryId, {
    user: true,
  });
  if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Category not found, bad request`,
    };
  }
  const timeLogNotEnded = await findFirstTimeLogWhereNotEnded(user.id);
  if (!timeLogNotEnded) {
    await createNewTimeLog(user.id, categoryWithUser.id);
    return {
      success: true,
      category: await setCategoryActiveState(categoryWithUser.id, true),
    };
  }
  if (timeLogNotEnded.categoryId === categoryWithUser.id) {
    await setTimeLogAsEnded(timeLogNotEnded.id);
    if (timeLogNotEnded.subcategoryId) {
      await createNewTimeLog(user.id, categoryWithUser.id);
      await setSubcategoryActiveState(timeLogNotEnded.subcategoryId, false);
      return {
        success: true,
        category: { ...categoryWithUser, user: undefined } as Category,
      };
    }
    await setCategoryActiveState(timeLogNotEnded.categoryId, false);
    return {
      success: true,
      category: {
        ...categoryWithUser,
        active: false,
        user: undefined,
      } as Category,
    };
  }
  await setCategoryActiveState(timeLogNotEnded.categoryId, false);
  if (timeLogNotEnded.subcategoryId) {
    await setSubcategoryActiveState(timeLogNotEnded.subcategoryId, false);
  }
  await setTimeLogAsEnded(timeLogNotEnded.id);
  await createNewTimeLog(user.id, categoryWithUser.id);
  return {
    success: true,
    category: await setCategoryActiveState(
      categoryWithUser.id,
      timeLogNotEnded.categoryId !== categoryWithUser.id
    ),
  };
};

export const updateCategory = async (
  categoryId: string,
  name: string,
  color: string,
  user: User
) => {
  const categoryWithUser = await findCategoryIfNotDeleted(categoryId, {
    user: true,
  });
  if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Category not found, bad request`,
    };
  }
  if (categoryWithUser.name === name && categoryWithUser.color === color) {
    return {
      success: true,
      category: { ...categoryWithUser, user: undefined } as Category,
    };
  }
  const updatedCategory = await updateNameAndColor(categoryId, name, color);
  return { success: true, category: updatedCategory };
};

export const setCategoryAsDeleted = async (categoryId: string, user: User) => {
  const categoryWithUser = await findCategoryIfNotDeleted(categoryId, {
    user: true,
  });
  if (!categoryWithUser || categoryWithUser?.user?.id !== user.id) {
    return {
      success: false,
      error: `Category not found, bad request`,
    };
  }
  if (categoryWithUser.active || categoryWithUser.visible) {
    return {
      success: false,
      error: `Category cannot be deleted, bad request`,
    };
  }
  const updatedCategory = await updateDeletedCategories(categoryId, true);
  return { success: true, category: updatedCategory };
};

export const findManyCategoriesIfInIdList = async (categoriesIds: string[]) => {
  return await prisma.category.findMany({
    where: { id: { in: categoriesIds } },
  });
};

export const findCategoryIfNotDeleted = async (
  categoryId: string,
  include: Prisma.CategoryInclude = null
) => {
  return await prisma.category.findFirst({
    where: { id: categoryId, deleted: false },
    include,
  });
};

export const setCategoryActiveState = async (
  categoryId: string,
  active: boolean
) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: { active },
  });
};

const countUserCategoriesNotDeleted = async (userId: string) => {
  return await prisma.category.count({ where: { userId } });
};

const updateVisibility = async (categoryId: string, visible: boolean) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: { visible },
  });
};

const updateDeletedCategories = async (
  categoryId: string,
  deleted: boolean
) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: { deleted },
  });
};

const updateExpandSubcategories = async (
  categoryId: string,
  expandSubcategories: boolean
) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: { expandSubcategories },
  });
};

const updateNameAndColor = async (
  categoryId: string,
  name: string,
  color: string
) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: { name, color },
  });
};
