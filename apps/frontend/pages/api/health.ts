import { NextApiRequest, NextApiResponse } from 'next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return new Promise(async () => {
    switch (req.method) {
      case 'GET':
        return res.status(200).json({ health: 'ok' });
      default:
        return res.status(400).json({ error: 'No Response for This Request' });
    }
  });
}
