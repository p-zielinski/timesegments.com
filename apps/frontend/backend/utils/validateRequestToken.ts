import { NextApiRequest } from 'next';
import { verifyJWT } from '../services/jwt.service';
import { findOneToken } from '../services/token.service';

export const validateRequestToken = async (req: NextApiRequest) => {
  const rawToken = req.headers?.jwt_token;
  if (!rawToken || typeof rawToken !== 'string') {
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
