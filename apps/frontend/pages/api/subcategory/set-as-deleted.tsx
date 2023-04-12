import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import {
  internalServerErrorResponse,
  invalidControlValueResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { getNewControlValue } from '../../../backend/services/user.service';
import { setSubcategoryAsDeletedDto } from '../../../backend/dto/subcategory/setSubcategoryAsDeletedDto';
import { setSubcategoryAsDeleted } from '../../../backend/services/subcategory.service';

export default async function setSubcategoryAsDeletedController(
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
          const { errors } = validateRequestBody(
            setSubcategoryAsDeletedDto,
            req
          );
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { subcategoryId, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const setSubcategoryAsDeletedStatus = await setSubcategoryAsDeleted(
            subcategoryId,
            user
          );
          if (!setSubcategoryAsDeletedStatus.success) {
            return res.status(400).json({
              error: setSubcategoryAsDeletedStatus.error,
            });
          }
          return res.status(201).json({
            ...setSubcategoryAsDeletedStatus,
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
