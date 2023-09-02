import * as Joi from 'joi';

export const ValidationSchema = Joi.object({
  SALT_ROUNDS: Joi.number().integer().min(1).max(15).optional().default(8),
  JWT_SECRET: Joi.string().min(50).max(60).required(),
  MAX_NUMBER_OF_CATEGORIES_PER_USER: Joi.number().min(30).max(100).default(30),
  MAX_NUMBER_OF_NOTES_PER_CATEGORY: Joi.number().min(5).max(20).default(5),
  MAX_NUMBER_OF_NOTES_PER_USER: Joi.number().min(5).max(20).default(10),
  FRONTEND_URL: Joi.string().required(),
  SEND_MAIL_TOKEN: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_USERNAME: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_TLS: Joi.boolean().required(),
  ENVIRONMENT: Joi.string().required(),
  SCHEDULE_TOKEN: Joi.string().min(70).required(),
});
