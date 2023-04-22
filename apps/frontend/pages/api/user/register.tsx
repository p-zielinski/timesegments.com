import { NextApiRequest, NextApiResponse } from 'next';
import { loginRegisterDto } from '../../../backend/dto/loginRegisterDto';
import { MeExtendedOption } from '@test1/shared';
import {
  createNewUser,
  getMeExtended,
} from '../../../backend/services/user.service';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';

export default async function registerController(
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
          const { email, password: plainPassword } = req.body;
          const registeringResult = await createNewUser(
            {
              email,
              plainPassword,
              timezone: 'EUROPE__WARSAW',
            },
            { generateToken: true }
          );
          if (registeringResult.success === false) {
            return res.status(400).json({
              error: registeringResult.error,
            });
          }
          const { limits } = await getMeExtended(registeringResult.user.id, [
            MeExtendedOption.CATEGORIES_LIMIT,
            MeExtendedOption.SUBCATEGORIES_LIMIT,
          ]);
          return res.status(200).json({
            ...registeringResult,
            user: { ...registeringResult.user, categories: [] },
            limits,
          });
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
