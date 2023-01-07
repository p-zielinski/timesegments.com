import { getRGBA } from './getRGBA';

export const getRepeatingLinearGradient = (
  hexRgbValue = `ffffff`,
  alpha = 1
) => {
  return hexRgbValue === 'ffffff'
    ? 'white'
    : `repeating-linear-gradient(
          45deg,
        ${getRGBA(hexRgbValue, alpha)},
        ${getRGBA(hexRgbValue, alpha)} 10px,
        ${getRGBA(hexRgbValue, alpha / 5)} 10px,
        ${getRGBA(hexRgbValue, alpha / 5)} 28px
        )`;
};
