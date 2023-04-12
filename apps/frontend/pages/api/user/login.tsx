import { NextApiRequest, NextApiResponse } from 'next';
import { loginRegisterDto } from '../../../backend/dto/user/loginRegisterDto';
import { MeExtendedOption } from '@test1/shared';
import {
  getMeExtended,
  validateUser,
} from '../../../backend/services/user.service';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import {
  internalServerErrorResponse,
  noResponse,
} from '../../../backend/utils/responses';

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
            Object.values(MeExtendedOption)
          );
          return res.status(201).json({ ...validatingResult, user, limits });
        }
        default:
          return noResponse(res);
      }
    } catch (error) {
      return internalServerErrorResponse(res);
    }
  })();
}
