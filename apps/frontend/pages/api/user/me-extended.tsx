import { NextApiRequest, NextApiResponse } from 'next';
import { unauthorizedResponse } from '../../../backend/utils/responses';
import { getMeExtended } from '../../../backend/services/user.service';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import { meExtendedDto } from '../../../backend/dto/meExtendedDto';

export default async function meExtendedController(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await (async () => {
    try {
      switch (req.method) {
        case 'POST': {
          const { errors } = validateRequestBody(meExtendedDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { extend } = req.body;
          const validationResult = await validateRequestToken(req);
          if (!validationResult) {
            return unauthorizedResponse(res);
          }
          const { user } = validationResult;
          return res.status(200).json(await getMeExtended(user.id, extend));
        }
        default:
          return res
            .status(400)
            .json({ error: 'No Response for This Request' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })();
}
