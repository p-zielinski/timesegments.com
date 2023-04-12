export const setExpandSubcategoriesDto = {
  type: 'object',
  properties: {
    categoryId: {
      type: 'string',
      minLength: 10,
      maxLength: 100,
    },
    expandSubcategories: {
      type: 'boolean',
    },
    controlValue: { type: 'string' },
  },
  required: ['categoryId', 'expandSubcategories', 'controlValue'],
};
