export const setSubcategoryActiveDto = {
  type: 'object',
  properties: {
    subcategoryId: {
      type: 'string',
      minLength: 10,
      maxLength: 100,
    },
    controlValue: { type: 'string' },
  },
  required: ['subcategoryId', 'controlValue'],
};
