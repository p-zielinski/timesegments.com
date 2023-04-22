import jwt from 'jsonwebtoken';
import { jwtSecretToken } from './configService';

export const createJWT = (payload: object) => {
  return jwt.sign(payload, jwtSecretToken);
};

export const verifyJWT = (
  token: string
): false | { userId: string; iat: number; exp: number } => {
  return jwt.verify(
    token,
    process.env.JWT_TOKEN_SECRET as string,
    (error, decoded) => {
      if (error) {
        return false;
      }
      if (decoded) {
        return decoded;
      }
    }
  ) as unknown as false | { userId: string; iat: number; exp: number };
};
