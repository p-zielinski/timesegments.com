import hexRgb from "hex-rgb";

export const getRGBA = (hexRgbValue = `ffffff`, alpha = 1) => {
  const hexRgbObject = hexRgb(hexRgbValue);
  return `rgba(${hexRgbObject.red},${hexRgbObject.green},${hexRgbObject.blue},${alpha})`;
};
