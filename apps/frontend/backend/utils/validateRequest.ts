import Ajv from 'ajv';
import { NextApiResponse } from 'next';

const validateRequest = (dto: any, body: any, res: NextApiResponse) => {
  const ajv = new Ajv();
  const valid = ajv.validate(dto, body);
  if (!valid) {
    return { errors: ajv.errors };
  }
  const newBody: any = {};
  for (const key of Object.keys(dto.properties)) {
    if (body?.[key]) {
      newBody[key] = body?.[key];
    }
  }
  return { body: newBody };
};

export default validateRequest;
