import Ajv from 'ajv';
import { NextApiRequest } from 'next';

export const validateRequestBody = (
  bodyValidationSchema: any,
  req: NextApiRequest
) => {
  const ajv = new Ajv({ removeAdditional: 'all' });
  const valid = ajv.validate(bodyValidationSchema, req.body);
  if (!valid) {
    return { errors: ajv.errors };
  }
  return { errors: undefined };
};
