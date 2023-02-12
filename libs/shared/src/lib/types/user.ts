import { Prisma } from '@prisma/client';

const userWithCategoriesAndSubcategories = Prisma.validator<Prisma.UserArgs>()({
  include: { categories: { include: { subcategories: true } } },
});

export type UserWithCategoriesAndSubcategories = Prisma.UserGetPayload<
  typeof userWithCategoriesAndSubcategories
>;
