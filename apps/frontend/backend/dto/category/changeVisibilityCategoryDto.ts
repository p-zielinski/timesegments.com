export const changeVisibilityCategoryDto = {
  type: 'object',
  properties: {
    categoryId: {
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
