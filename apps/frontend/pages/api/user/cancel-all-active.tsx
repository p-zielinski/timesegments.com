import { NextApiRequest, NextApiResponse } from 'next';
import {
  badResponse,
  defaultOkResponse,
  internalServerErrorResponse,
  invalidControlValueResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { cancelAllActive } from '../../../backend/services/user.service';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { cancelAllActiveDto } from '../../../backend/dto/user/cancelAllActiveDto';

export default async function cancelAllActiveController(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await (async () => {
    try {
      switch (req.method) {
        case 'POST': {
          const { errors } = validateRequestBody(cancelAllActiveDto, req);
          if (errors) {
            return badResponse(res, { errors });
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
          const cancelAllActiveStatus = await cancelAllActive(user);
          if (cancelAllActiveStatus.success === false) {
            return badResponse(res, {
              error: cancelAllActiveStatus.error,
            });
          }
          return defaultOkResponse(res, cancelAllActiveStatus);
        }
        default:
          return noResponse(res);
      }
    } catch (error) {
      return internalServerErrorResponse(res);
    }
  })();
}
