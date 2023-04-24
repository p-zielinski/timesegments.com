import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

const validateString = (string: any): boolean => {
  if (typeof string !== 'string') {
    return false;
  }
  return !(string.length === 0 || string.length > 100);
};

export default async function setCookie(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await (async () => {
    try {
      switch (req.method) {
        case 'POST': {
          const {name, value} = req.body;
          if (!validateString(name) || !validateString(value)) {
            return res.status(400).json({
              error:
                'name and value must be string, min 1 length max 100 length',
            });
          }

          // To change a cookie, first create a response
          const response = NextResponse.next();

          // Setting a cookie with additional options
          response.cookies.set({
            name,
            value,
            httpOnly: false,
            secure: false,
            sameSite: false,
            maxAge: 1000 * 60 * 60 * 24 * 400,
          });

          return response;
        }
        default:
          return res
            .status(400)
            .json({error: 'No Response for This Request'});
      }
    } catch (error) {
      return res.status(500).json({error: 'Internal Server Error'});
    }
  })();
}
