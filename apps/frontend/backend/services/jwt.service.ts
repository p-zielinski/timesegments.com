import jwt from 'jsonwebtoken';
import { jwtSecretToken } from './config.service';

export const createJWT = (payload: object) => {
  return jwt.sign(payload, jwtSecretToken, {
    algorithm: 'HS256',
  });
};

export const verifyJWT = (token: string): false | { tokenId: string } => {
  return jwt.verify(
    token,
    jwtSecretToken,
    { algorithms: ['HS256'], ignoreExpiration: true },
    (error, decoded) => {
      if (error) {
        return false;
      }
      if (decoded) {
        return decoded as { userId: string; iat: number; exp: number };
      }
    }
  ) as void as any;
};
