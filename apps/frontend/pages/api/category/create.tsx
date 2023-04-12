import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import {
  internalServerErrorResponse,
  invalidControlValueResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { createCategoryDto } from '../../../backend/dto/category/createCategoryDto';
import { getNewControlValue } from '../../../backend/services/user.service';
import { createCategory } from '../../../backend/services/category.service';

export default async function createCategoryController(
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
          const { errors } = validateRequestBody(createCategoryDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { name, color, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const createCategoryStatus = await createCategory(user, name, color);
          if (!createCategoryStatus.success) {
            return res.status(400).json({
              error: createCategoryStatus.error,
            });
          }
          return res.status(201).json({
            ...createCategoryStatus,
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
