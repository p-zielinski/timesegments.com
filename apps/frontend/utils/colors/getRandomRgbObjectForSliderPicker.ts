import { getHexFromRGBObject } from './getHexFromRGBObject';

function getRandomInt(max) {
  const result = Math.round(Math.random() * (max + 1) - 0.5);
  return result ? result : 0;
}

const createRandomRGBObject = () => {
  const _option = getRandomInt(3);
  switch (_option) {
    case 0: {
      return { r: 255, g: getRandomInt(255), b: 0, a: 1 };
    }
    case 1: {
      return { r: getRandomInt(255), g: 255, b: 0, a: 1 };
    }
    case 2: {
      return { r: 0, g: 255, b: getRandomInt(255), a: 1 };
    }
    case 3: {
      return { r: 0, g: getRandomInt(255), b: 255, a: 1 };
    }
  }
};

export const getRandomRgbObjectForSliderPicker = () => {
  const rgbObject = createRandomRGBObject();
  const newRgbObject = {};
  for (const key of Object.keys(rgbObject)) {
    if (key === 'a') {
      newRgbObject[key] = 1;
      continue;
    }
    newRgbObject[key] = Math.floor(rgbObject[key] / 2) + 64;
  }
  const hex = getHexFromRGBObject(newRgbObject);
  return { rgb: newRgbObject, hex };
};
