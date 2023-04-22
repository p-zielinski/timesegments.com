import { sha256 } from 'js-sha256';
import * as bcrypt from 'bcrypt';

export const hashString = async (plainPassword, saltRounds) => {
  return await bcrypt.hash(sha256(plainPassword), saltRounds + 2);
};
