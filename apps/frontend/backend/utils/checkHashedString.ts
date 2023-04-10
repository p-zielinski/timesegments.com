import { sha256 } from 'js-sha256';
import * as bcrypt from 'bcrypt';

export const checkHashedString = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(sha256(plainPassword), hashedPassword);
};
