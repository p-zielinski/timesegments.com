import { isNaN, isNumber } from 'lodash';

export const categoriesLimit =
  isNumber(Number(process.env?.['MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY'])) &&
  !isNaN(Number(process.env?.['MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY']))
    ? Number(process.env?.['MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY'])
    : 10;

export const subcategoriesLimit =
  isNumber(Number(process.env?.['MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY'])) &&
  !isNaN(Number(process.env?.['MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY']))
    ? Number(process.env?.['MAX_NUMBER_OF_SUBCATEGORIES_PER_CATEGORY'])
    : 10;

export const jwtSecretToken: string = process.env?.['JWT_SECRET_TOKEN'];
