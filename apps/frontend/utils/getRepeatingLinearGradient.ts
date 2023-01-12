import { getRGBA } from './getRGBA';

export const getRepeatingLinearGradient = (
  hexValueOfRgb = `ffffff`,
  alpha = 1,
  numberOfDegrees = 45
) => {
  return hexValueOfRgb === 'ffffff'
    ? 'white'
    : `repeating-linear-gradient(
          ${numberOfDegrees}deg,
        ${getRGBA(hexValueOfRgb, alpha)},
        ${getRGBA(hexValueOfRgb, alpha)} 10px,
        ${getRGBA(hexValueOfRgb, alpha / 5)} 10px,
        ${getRGBA(hexValueOfRgb, alpha / 5)} 28px
        )`;
};
