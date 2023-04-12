import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import {
  badResponse,
  defaultOkResponse,
  internalServerErrorResponse,
  invalidControlValueResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { getNewControlValue } from '../../../backend/services/user.service';
import { setSubcategoryActiveDto } from '../../../backend/dto/subcategory/setSubcategoryActiveDto';
import { setSubcategoryActive } from '../../../backend/services/subcategory.service';

export default async function setSubcategoryActiveStateController(
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
          const { errors } = validateRequestBody(setSubcategoryActiveDto, req);
          if (errors) {
            return badResponse(res, { errors });
          }
          const { subcategoryId, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const updateSubcategoryStatus = await setSubcategoryActive(
            subcategoryId,
            user
          );
          if (updateSubcategoryStatus.success === false) {
            return badResponse(res, {
              error: updateSubcategoryStatus.error,
            });
          }
          return defaultOkResponse(res, {
            ...updateSubcategoryStatus,
            controlValue: await getNewControlValue(user),
          });
        }
        default:
          return noResponse(res);
      }
    } catch (error) {
      return internalServerErrorResponse(res);
    }
  })();
}
