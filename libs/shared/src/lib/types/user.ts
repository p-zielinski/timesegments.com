import { Prisma } from '@prisma/client';

const userWithCategories = Prisma.validator<Prisma.UserArgs>()({
  include: { categories: true },
});

export type UserWithCategories = Prisma.UserGetPayload<
  typeof userWithCategories
>;

const userWithCategoriesAndNotes = Prisma.validator<Prisma.UserArgs>()({
  include: { categories: { include: { notes: true } }, notes: true },
});

export type UserWithCategoriesAndNotes = Prisma.UserGetPayload<
  typeof userWithCategoriesAndNotes
>;
