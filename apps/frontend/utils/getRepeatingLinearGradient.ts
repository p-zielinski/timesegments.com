import { getHexFromRGBAObject } from './getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from './getRgbaObjectFromHexString';

export const getRepeatingLinearGradient = (
  hexValueOfRgb = `ffffff`,
  alpha = 1,
  numberOfDegrees = 45
) => {
  return hexValueOfRgb === 'ffffff'
    ? 'white'
    : `repeating-linear-gradient(
          ${numberOfDegrees}deg,
        ${getHexFromRGBAObject(
          getRgbaObjectFromHexString(hexValueOfRgb, alpha)
        )},
        ${getHexFromRGBAObject(
          getRgbaObjectFromHexString(hexValueOfRgb, alpha)
        )} 10px,
        ${getHexFromRGBAObject(
          getRgbaObjectFromHexString(hexValueOfRgb, alpha / 5)
        )} 150px,
        ${getHexFromRGBAObject(
          getRgbaObjectFromHexString(hexValueOfRgb, alpha / 5)
        )} 28px
        )`;
};
