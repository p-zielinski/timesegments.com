import { NextApiRequest, NextApiResponse } from 'next';
import {
  defaultOkResponse,
  internalServerErrorResponse,
  invalidControlValueResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { checkControlValueDto } from '../../../backend/dto/user/checkControlValueDto';

export default async function checkControlValueController(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await (async () => {
    try {
      switch (req.method) {
        case 'POST': {
          const { errors } = validateRequestBody(checkControlValueDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { controlValue } = req.body;
          const validationResult = await validateRequestToken(req);
          if (!validationResult) {
            return unauthorizedResponse(res);
          }
          const { user } = validationResult;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          return defaultOkResponse(res, { success: true });
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
