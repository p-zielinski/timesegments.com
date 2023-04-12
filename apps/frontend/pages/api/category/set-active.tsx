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
import { setCategoryActive } from '../../../backend/services/category.service';
import { setCategoryActiveDto } from '../../../backend/dto/category/setCategoryActiveDto';

export default async function setCategoryActiveStateController(
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
          const { errors } = validateRequestBody(setCategoryActiveDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { categoryId, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const updateCategoryStatus = await setCategoryActive(
            categoryId,
            user
          );
          if (updateCategoryStatus.success === false) {
            return res.status(400).json({
              error: updateCategoryStatus.error,
            });
          }
          return res.status(201).json({
            ...updateCategoryStatus,
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
