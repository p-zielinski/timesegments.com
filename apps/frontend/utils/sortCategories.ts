import { CategoriesSortOption } from '@test1/shared';
import { Category } from '@prisma/client';

export const sortCategories = (
  categories: Category[],
  sortOption: CategoriesSortOption
) => {
  switch (sortOption) {
    case CategoriesSortOption.ALPHABETICAL:
      return categories.sort((category1, category2) =>
        (category1?.name ?? '').localeCompare(category2?.name ?? '')
      );
    case CategoriesSortOption.REVERSED_ALPHABETICAL:
      return categories.sort((category2, category1) =>
        (category1?.name ?? '').localeCompare(category2?.name ?? '')
      );
    case CategoriesSortOption.OLDEST:
      return categories.sort(
        (category1, category2) =>
          new Date(category1?.createdAt).getTime() -
          new Date(category2?.createdAt).getTime()
      );
    case CategoriesSortOption.NEWEST:
      return categories.sort(
        (category2, category1) =>
          new Date(category1?.createdAt).getTime() -
          new Date(category2?.createdAt).getTime()
      );
    default:
      return categories;
  }
};
