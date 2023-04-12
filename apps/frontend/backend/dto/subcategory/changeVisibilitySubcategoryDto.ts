export const changeVisibilitySubcategoryDto = {
  type: 'object',
  properties: {
    subcategoryId: {
      type: 'string',
      minLength: 10,
      maxLength: 100,
    },
    visible: {
      type: 'boolean',
    },
    controlValue: { type: 'string' },
  },
  required: ['categoryId', 'visible', 'controlValue'],
};
