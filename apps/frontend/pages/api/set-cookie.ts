import { NextApiRequest, NextApiResponse } from 'next';

const validateString = (string: any): boolean => {
  if (typeof string !== 'string') {
    return false;
  }
  return string.length !== 0;
};

export default async function setCookie(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await (async () => {
    try {
      switch (req.method) {
        case 'POST': {
          const { name, value } = req.body;
          if (!validateString(name) || !validateString(value)) {
            return res.status(400).json({
              error:
                'name and value must be string, min 1 length max 100 length',
            });
          }

          res.setHeader(
            'Set-Cookie',
            `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 400}`
          );
          return res.status(200).json({});
        }
        default:
          return res
            .status(400)
            .json({ error: 'No Response for This Request' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })();
}
