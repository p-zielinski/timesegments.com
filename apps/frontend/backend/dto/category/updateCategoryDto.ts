export const updateCategoryDto = {
  type: 'object',
  properties: {
    categoryId: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    color: {
      type: 'string',
      pattern: '^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$',
    },
    controlValue: { type: 'string' },
  },
  required: ['categoryId', 'name', 'color', 'controlValue'],
};
