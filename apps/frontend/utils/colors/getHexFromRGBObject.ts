export const getHexFromRGBObject = (rgbObject) => {
  const convertNumber = (number) => {
    const convertedNumber = number.toString(16);
    if (convertedNumber.length > 1) {
      return convertedNumber;
    }
    return `0${convertedNumber}`;
  };

  return `#${convertNumber(rgbObject.r)}${convertNumber(
    rgbObject.g
  )}${convertNumber(rgbObject.b)}`;
};
