import { NextApiRequest } from 'next';
import { verifyJWT } from '../services/jwt.service';
import { findOneToken } from '../services/token.service';

const getBearerToken = (req: NextApiRequest) => {
  const authorization = req.headers?.authorization;
  if (typeof authorization !== 'string' || authorization?.length < 8)
    return null;
  return authorization.slice(7);
};
export const validateRequestToken = async (req: NextApiRequest) => {
  const rawToken = getBearerToken(req);
  if (!rawToken) {
    return false;
  }
  const jwtPayload = verifyJWT(rawToken);
  if (!jwtPayload) {
    return false;
  }
  const { tokenId } = jwtPayload;
  const tokenWithUserRelation = await findOneToken(tokenId, { user: true });
  if (!tokenWithUserRelation) {
    return false;
  }
  const { user } = tokenWithUserRelation;
  delete tokenWithUserRelation.user;
  return { user, token: tokenWithUserRelation };
};
