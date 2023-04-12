import { NextApiRequest, NextApiResponse } from 'next';
import {
  internalServerErrorResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { getMeExtended } from '../../../backend/services/user.service';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import { meExtendedDto } from '../../../backend/dto/user/meExtendedDto';

export default async function meExtendedController(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await (async () => {
    try {
      switch (req.method) {
        case 'POST': {
          const validationResult = await validateRequestToken(req);
          if (!validationResult) {
            return unauthorizedResponse(res);
          }
          const { user } = validationResult;
          const { errors } = validateRequestBody(meExtendedDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { extend } = req.body;
          return res.status(201).json(await getMeExtended(user.id, extend));
        }
        default:
          return noResponse(res);
      }
    } catch (error) {
      console.log(error);
      return internalServerErrorResponse(res);
    }
  })();
}
