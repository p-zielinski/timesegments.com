export const createCategoryDto = {
  type: 'object',
  properties: {
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
  required: ['name', 'color', 'controlValue'],
};