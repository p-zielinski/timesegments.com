import { getHexFromRGBAObject } from './getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from './getRgbaObjectFromHexString';

export const getRepeatingLinearGradient = (
  hexValueOfRgb = `ffffff`,
  alpha = 1,
  numberOfDegrees = 45,
  mode = true
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
        )} ${mode ? '10px' : '50px'},
        ${getHexFromRGBAObject(
          getRgbaObjectFromHexString(hexValueOfRgb, alpha / 5)
        )} ${mode ? '10px' : '50px'},
        ${getHexFromRGBAObject(
          getRgbaObjectFromHexString(hexValueOfRgb, alpha / 5)
        )} ${mode ? '20px' : '100px'}
        )`;
};
