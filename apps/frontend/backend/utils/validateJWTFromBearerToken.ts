import { NextApiRequest } from 'next';
import { verifyJWT } from './JWT';

const getBearerToken = (req: NextApiRequest) => {
  const authorization = req.headers?.authorization;
  if ((authorization as string)?.length < 8) return null;
  return (authorization as string).slice(7);
};
const validateJWTFromBearerToken = (req: NextApiRequest) => {
  const token = getBearerToken(req);
  if (!token) {
    return false;
  }
  return verifyJWT(token);
};
export default validateJWTFromBearerToken;
