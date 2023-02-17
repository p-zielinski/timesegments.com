import hexRgb from 'hex-rgb';

export const getRgbaObjectFromHexString = (
  hexRgbValue = `ffffff`,
  alpha = 1
) => {
  const hexRgbObject = hexRgb(hexRgbValue);
  return {
    r: hexRgbObject.red,
    g: hexRgbObject.green,
    b: hexRgbObject.blue,
    a: alpha,
  };
};
