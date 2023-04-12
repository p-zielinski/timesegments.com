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
import { setCategoryAsDeletedDto } from '../../../backend/dto/category/setCategoryAsDeletedDto';

export default async function setCategoryAsDeletedController(
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
          const { errors } = validateRequestBody(setCategoryAsDeletedDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { categoryId, controlValue } = req.body;
          if (user.controlValue !== controlValue) {
            return invalidControlValueResponse(res);
          }
          const setCategoryAsDeletedStatus =
            await this.categoryService.setCategoryAsDeleted(categoryId, user);
          if (!setCategoryAsDeletedStatus.success) {
            return res.status(400).json({
              error: setCategoryAsDeletedStatus.error,
            });
          }
          return res.status(201).json({
            ...setCategoryAsDeletedStatus,
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
