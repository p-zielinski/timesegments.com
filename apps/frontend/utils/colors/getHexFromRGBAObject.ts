import { getHexFromRGBObject } from './getHexFromRGBObject';

export const getHexFromRGBAObject = (rgba: {
  r: number;
  g: number;
  b: number;
  a?: number;
}) => {
  if (!rgba.a) {
    rgba.a = 1;
  }
  const calculate = (color) => {
    return Math.round(255 - (255 - color) * rgba?.a || 1);
  };

  const r = calculate(rgba.r);
  const g = calculate(rgba.g);
  const b = calculate(rgba.b);

  return getHexFromRGBObject({ r, g, b });
};
