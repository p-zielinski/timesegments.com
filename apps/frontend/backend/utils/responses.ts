import { NextApiResponse } from 'next';
import { HttpStatus } from '@nestjs/common';

export const unauthorizedResponse = (res: NextApiResponse) => {
  return res.status(401).json({ error: 'unauthorized' });
};

export const badResponse = (res: NextApiResponse, jsonObject: object) => {
  return res.status(400).json(jsonObject);
};

export const defaultOkResponse = (res: NextApiResponse, jsonObject: object) => {
  return res.status(201).json(jsonObject);
};

export const noResponse = (res: NextApiResponse) => {
  return res.status(400).json({ error: 'No Response for This Request' });
};

export const internalServerErrorResponse = (res: NextApiResponse) => {
  return res.status(500).json({ error: 'Internal Server Error' });
};

export const invalidControlValueResponse = (res: NextApiResponse) => {
  return res.status(HttpStatus.CONFLICT).json({ controlValue: 'invalid' });
};
