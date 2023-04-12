import { ColumnSortOption } from '@test1/shared';

export const setSortingCategoriesDto = {
  type: 'object',
  properties: {
    sortingCategories: {
      type: 'string',
      enum: Object.values(ColumnSortOption),
    },
  },
  required: ['sortingCategories'],
};
