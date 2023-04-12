export const fromToDatesDto = {
  type: 'object',
  properties: {
    from: {
      type: 'object',
      properties: {
        day: {
          type: 'number',
        },
        month: {
          type: 'number',
        },
        year: {
          type: 'number',
        },
      },
      required: ['day', 'month', 'year'],
    },
    to: {
      type: 'object',
      properties: {
        day: {
          type: 'number',
        },
        month: {
          type: 'number',
        },
        year: {
          type: 'number',
        },
      },
      required: ['day', 'month', 'year'],
    },
  },
  required: ['from', 'to'],
};
