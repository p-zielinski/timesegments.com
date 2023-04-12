import { NextApiRequest, NextApiResponse } from 'next';
import {
  internalServerErrorResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { setSortingCategories } from '../../../backend/services/user.service';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { setSortingCategoriesDto } from '../../../backend/dto/user/setSortingCategoriesDto';

export default async function setSortingCategoriesController(
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
          const { errors } = validateRequestBody(setSortingCategoriesDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const updateSortingCategoriesStatus = await setSortingCategories(
            user,
            req.body
          );
          if (!updateSortingCategoriesStatus.success) {
            return res.status(400).json({
              error: updateSortingCategoriesStatus.error,
            });
          }
          return res.status(201).json(updateSortingCategoriesStatus);
        }
        default:
          return noResponse(res);
      }
    } catch (error) {
      return internalServerErrorResponse(res);
    }
  })();
}