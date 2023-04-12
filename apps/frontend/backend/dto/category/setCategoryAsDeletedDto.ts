export const setCategoryAsDeletedDto = {
  type: 'object',
  properties: {
    categoryId: {
      type: 'string',
      minLength: 10,
      maxLength: 100,
    },
    controlValue: { type: 'string' },
  },
  required: ['categoryId', 'controlValue'],
};
