import { Prisma } from '@prisma/client';

const userWithCategoriesAndSubcategories = Prisma.validator<Prisma.UserArgs>()({
  include: { categories: { include: { subcategories: true } } },
});

export type UserWithCategoriesAndSubcategories = Prisma.UserGetPayload<
  typeof userWithCategoriesAndSubcategories
>;

const userWithCategoriesAndSubcategoriesAndNotes =
  Prisma.validator<Prisma.UserArgs>()({
    include: { categories: { include: { subcategories: true } }, notes: true },
  });

export type UserWithCategoriesAndSubcategoriesAndNotes = Prisma.UserGetPayload<
  typeof userWithCategoriesAndSubcategoriesAndNotes
>;
