import * as Joi from 'joi';

export const ValidationSchema = Joi.object({
  SALT_ROUNDS: Joi.number().integer().min(1).max(15).optional().default(8),
  JWT_SECRET: Joi.string().min(50).max(60).required(),
  MAX_NUMBER_OF_CATEGORIES_PER_USER: Joi.number().min(30).max(100).default(30),
});