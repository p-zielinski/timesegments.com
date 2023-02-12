import { CategoryWithSubcategories, ColumnSortOption } from '@test1/shared';

export const sortCategories = (
  categories: CategoryWithSubcategories[],
  sortOption: ColumnSortOption
) => {
  switch (sortOption) {
    case ColumnSortOption.ALPHABETICAL:
      return categories
        .map((category) => {
          return {
            ...category,
            subcategories: category.subcategories.sort(
              (subcategory1, subcategory2) =>
                (subcategory1?.name ?? '').localeCompare(
                  subcategory2?.name ?? ''
                )
            ),
          };
        })
        .sort((category1, category2) =>
          (category1?.name ?? '').localeCompare(category2?.name ?? '')
        );
    case ColumnSortOption.REVERSE_ALPHABETICAL:
      return categories
        .map((category) => {
          return {
            ...category,
            subcategories: category.subcategories.sort(
              (subcategory2, subcategory1) =>
                (subcategory1?.name ?? '').localeCompare(
                  subcategory2?.name ?? ''
                )
            ),
          };
        })
        .sort((category2, category1) =>
          (category1?.name ?? '').localeCompare(category2?.name ?? '')
        );

    case ColumnSortOption.OLDEST:
      return categories
        .map((category) => {
          return {
            ...category,
            subcategories: category.subcategories.sort(
              (subcategory1, subcategory2) =>
                new Date(subcategory1?.createdAt).getTime() -
                new Date(subcategory2?.createdAt).getTime()
            ),
          };
        })
        .sort(
          (category1, category2) =>
            new Date(category1?.createdAt).getTime() -
            new Date(category2?.createdAt).getTime()
        );
    case ColumnSortOption.NEWEST:
      return categories
        .map((category) => {
          return {
            ...category,
            subcategories: category.subcategories.sort(
              (subcategory2, subcategory1) =>
                new Date(subcategory1?.createdAt).getTime() -
                new Date(subcategory2?.createdAt).getTime()
            ),
          };
        })
        .sort(
          (category2, category1) =>
            new Date(category1?.createdAt).getTime() -
            new Date(category2?.createdAt).getTime()
        );
    default:
      return categories;
  }
};
