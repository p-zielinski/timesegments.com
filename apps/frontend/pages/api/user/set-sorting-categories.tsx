import { NextApiRequest, NextApiResponse } from 'next';
import { unauthorizedResponse } from '../../../backend/utils/responses';
import { setSortingCategories } from '../../../backend/services/user.service';
import { validateRequestToken } from '../../../backend/utils/validateRequestToken';

export default async function meController(
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
          const updateSortingCategoriesStatus = await setSortingCategories(
            user,
            req.body
          );
          if (!updateSortingCategoriesStatus.success) {
            return res.status(400).json({
              error: updateSortingCategoriesStatus.error,
            });
          }
          return res.status(200).json(updateSortingCategoriesStatus);
        }
        default:
          return res
            .status(400)
            .json({ error: 'No Response for This Request' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })();
}
