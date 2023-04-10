import { MeExtendedOption } from '@test1/shared';

export const meExtendedDto = {
  type: 'object',
  properties: {
    extend: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          MeExtendedOption.CATEGORIES,
          MeExtendedOption.SUBCATEGORIES,
          MeExtendedOption.CATEGORIES_LIMIT,
          MeExtendedOption.SUBCATEGORIES_LIMIT,
        ],
      },
    },
  },
  required: ['extend'],
};
