import * as Joi from 'joi';

export const ValidationSchema = Joi.object({
  SALT_ROUNDS: Joi.number().integer().min(1).max(15).optional().default(8),
});
