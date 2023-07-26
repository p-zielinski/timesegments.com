import * as Joi from 'joi';

export const ValidationSchema = Joi.object({
  SALT_ROUNDS: Joi.number().integer().min(1).max(15).optional().default(8),
  JWT_SECRET: Joi.string().min(50).max(60).required(),
  MAX_NUMBER_OF_CATEGORIES_PER_USER: Joi.number().min(30).max(100).default(30),
  MAX_NUMBER_OF_NOTES_PER_CATEGORY: Joi.number().min(5).max(20).default(5),
  FRONTEND_URL: Joi.string().required(),
  SEND_MAIL_TOKEN: Joi.string().required(),
  REDIS_URL: Joi.string().default(''),
});
