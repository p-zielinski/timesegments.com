import { Prisma } from '@prisma/client';

const userWithCategoriesAndSubcategories = Prisma.validator<Prisma.UserArgs>()({
  include: { categories: { include: { subcategories: true } } },
});

const categoryWithSubcategories = Prisma.validator<Prisma.CategoryArgs>()({
  include: { subcategories: true },
});

export type UserWithCategoriesAndSubcategories = Prisma.UserGetPayload<
  typeof userWithCategoriesAndSubcategories
>;

export type CategoryWithSubcategories = Prisma.CategoryGetPayload<
  typeof categoryWithSubcategories
>;
