import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';
import {
  internalServerErrorResponse,
  noResponse,
  unauthorizedResponse,
} from '../../../backend/utils/responses';
import { validateRequestBody } from '../../../backend/utils/validateRequestBody';
import { fromToDatesDto } from '../../../backend/dto/time-log/fromToDatesDto';
import { findFromToTimeLogsEnrichedWithCategoriesAndSubcategories } from '../../../backend/services/time-log.service';

export default async function findExtendedController(
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
          const { errors } = validateRequestBody(fromToDatesDto, req);
          if (errors) {
            return res.status(400).json({ errors });
          }
          const { from, to } = req.body;
          const findFromToTimeLogsResult =
            await findFromToTimeLogsEnrichedWithCategoriesAndSubcategories(
              user,
              from,
              to
            );
          if (findFromToTimeLogsResult.success === false) {
            return res.status(400).json({
              error: findFromToTimeLogsResult.error,
            });
          }
          return res.status(201).json(findFromToTimeLogsResult);
        }
        default:
          return noResponse(res);
      }
    } catch (error) {
      return internalServerErrorResponse(res);
    }
  })();
}