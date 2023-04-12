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
import { updateCategory } from '../../../backend/services/category.service';
import { updateCategoryDto } from '../../../backend/dto/category/updateCategoryDto';

export default async function updateCategoryController(
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
          const { errors } = validateRequestBody(updateCategoryDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { categoryId, name, color, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const updateCategoryStatus = await updateCategory(
            categoryId,
            name,
            color,
            user
          );
          if (!updateCategoryStatus.success) {
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
