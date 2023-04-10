import { NextApiRequest, NextApiResponse } from 'next';
import { loginRegisterDto } from '../../../backend/dto/loginRegisterDto';
import { MeExtendedOption } from '@test1/shared';
import {
  getMeExtended,
  validateUser,
} from '../../../backend/services/user.service';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';

export default async function loginController(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await (async () => {
    try {
      switch (req.method) {
        case 'POST': {
          const { errors } = validateRequestBody(loginRegisterDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { email, password } = req.body;
          const validatingResult = await validateUser({
            email,
            password,
          });
          if (validatingResult.success === false) {
            return res.status(400).json({
              error: validatingResult.error,
            });
          }
          const { user, limits } = await getMeExtended(
            validatingResult.user.id,
            [
              MeExtendedOption.CATEGORIES,
              MeExtendedOption.SUBCATEGORIES,
              MeExtendedOption.CATEGORIES_LIMIT,
              MeExtendedOption.SUBCATEGORIES_LIMIT,
            ]
          );
          return res.status(200).json({ ...validatingResult, user, limits });
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
