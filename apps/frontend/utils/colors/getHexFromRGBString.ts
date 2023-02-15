import { getHexFromRGBObject } from './getHexFromRGBObject';

export const getHexFromRGBAString = (rgb: string) => {
  const colors = rgb
    .slice(rgb.indexOf('(') + 1, rgb.indexOf(')'))
    .split(',')
    .map((num) => {
      if (isNaN(parseInt(num.trim()))) {
        return 255;
      }
      return parseInt(num.trim());
    });

  const r = colors[0] ?? 255;
  const g = colors[1] ?? 255;
  const b = colors[2] ?? 255;

  return getHexFromRGBObject({ r, g, b });
};
