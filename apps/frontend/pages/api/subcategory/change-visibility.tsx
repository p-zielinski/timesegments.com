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
import { changeVisibilitySubcategoryDto } from '../../../backend/dto/subcategory/changeVisibilitySubcategoryDto';
import { updateVisibilitySubcategory } from '../../../backend/services/subcategory.service';

export default async function changeSubcategoryVisibilityController(
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
            changeVisibilitySubcategoryDto,
            req
          );
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { subcategoryId, visible, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const updateSubcategoryStatus = await updateVisibilitySubcategory(
            subcategoryId,
            visible,
            user
          );
          if (!updateSubcategoryStatus.success) {
            return res.status(400).json({
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
