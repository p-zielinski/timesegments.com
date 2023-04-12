import { MeExtendedOption } from '@test1/shared';

export const meExtendedDto = {
  type: 'object',
  properties: {
    extend: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(MeExtendedOption),
      },
    },
  },
  required: ['extend'],
};
