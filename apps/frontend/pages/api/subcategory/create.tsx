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
import { createSubcategoryDto } from '../../../backend/dto/subcategory/createSubcategoryDto';
import { createSubcategory } from '../../../backend/services/subcategory.service';

export default async function createSubcategoryController(
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
          const { errors } = validateRequestBody(createSubcategoryDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { categoryId, name, color, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const createSubcategoryStatus = await createSubcategory(
            user,
            categoryId,
            name,
            color
          );
          if (!createSubcategoryStatus.success) {
            return res.status(400).json({
              error: createSubcategoryStatus.error,
            });
          }
          return res.status(201).json({
            ...createSubcategoryStatus,
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
