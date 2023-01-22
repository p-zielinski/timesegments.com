import { Prisma } from '@prisma/client';

// 1: Define a type that includes the relation to `Post`
const userWithCategoriesAndSubcategories = Prisma.validator<Prisma.UserArgs>()({
  include: { categories: { include: { subcategories: true } } },
});

// 3: This type will include a user and all their posts
export type UserWithCategoriesAndSubcategories = Prisma.UserGetPayload<
  typeof userWithCategoriesAndSubcategories
>;
