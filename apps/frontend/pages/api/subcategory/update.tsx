import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import {
  badResponse,
  internalServerErrorResponse,
  invalidControlValueResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { getNewControlValue } from '../../../backend/services/user.service';
import { updateSubcategoryDto } from '../../../backend/dto/subcategory/updateSubcategoryDto';
import { updateSubcategory } from '../../../backend/services/subcategory.service';

export default async function updateSubcategoryController(
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
          const { errors } = validateRequestBody(updateSubcategoryDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { subcategoryId, name, color, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const updateSubcategoryStatus = await updateSubcategory(
            user,
            subcategoryId,
            name,
            color
          );
          if (!updateSubcategoryStatus.success) {
            return badResponse(res, {
              error: updateSubcategoryStatus.error,
            });
          }
          return res.status(201).json({
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
