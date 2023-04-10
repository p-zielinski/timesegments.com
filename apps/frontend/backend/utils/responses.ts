import { NextApiResponse } from 'next';

export const unauthorizedResponse = (res: NextApiResponse) => {
  return res.status(401).json({ error: 'unauthorized' });
};
