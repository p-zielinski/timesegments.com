import { Prisma } from '@prisma/client';

const categoryWithSubcategories = Prisma.validator<Prisma.CategoryArgs>()({
  include: { subcategories: true },
});

export type CategoryWithSubcategories = Prisma.CategoryGetPayload<
  typeof categoryWithSubcategories
>;
