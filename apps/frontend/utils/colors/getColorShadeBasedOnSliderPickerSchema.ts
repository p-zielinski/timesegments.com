export const getColorShadeBasedOnSliderPickerSchema = (
  rgbaObject,
  darknessLevel: 'dark' | 'normal' | 'bright' | 'very bright' = 'normal'
): { r: number; g: number; b: number } => {
  const rgbObject = {
    r: rgbaObject.r,
    g: rgbaObject.g,
    b: rgbaObject.b,
  };
  let lowest = Infinity;
  for (const key of Object.keys(rgbObject)) {
    if (rgbObject[key] < lowest) {
      lowest = rgbObject[key];
    }
  }
  if (darknessLevel === 'normal' && lowest === 45) {
    return rgbObject;
  }
  if (darknessLevel === 'dark' && lowest === 25) {
    return rgbObject;
  }

  const baseColor = {};
  for (const key of Object.keys(rgbObject)) {
    switch (lowest) {
      case 179:
        baseColor[key] = Math.round((rgbObject[key] - 179) * 4.98);
        break;
      case 121:
        baseColor[key] = Math.round((rgbObject[key] - 121) * 2.8539);
        break;
      case 64:
        baseColor[key] = Math.floor(rgbObject[key] - 64) * 2;
        break;
      case 45:
        baseColor[key] = Math.ceil((rgbObject[key] - 45) * 2.8481);
        break;
      case 25:
        baseColor[key] = Math.round((rgbObject[key] - 25) * 4.8846);
        break;
      default:
        baseColor[key] = rgbObject[key];
    }
    if (baseColor[key] < 0) {
      baseColor[key] = 0;
    } else if (baseColor[key] > 255) {
      baseColor[key] = 255;
    }
  }

  const newRgbObject = {};
  for (const key of Object.keys(baseColor)) {
    if (darknessLevel === 'normal') {
      newRgbObject[key] = Math.floor(baseColor[key] / 2.8481) + 45;
    } else if (darknessLevel === 'very bright') {
      newRgbObject[key] = Math.floor(baseColor[key] / 2.8539) + 121;
    } else if (darknessLevel === 'bright') {
      newRgbObject[key] = Math.floor(baseColor[key] / 2) + 64;
    } else {
      newRgbObject[key] = Math.floor(baseColor[key] / 4.8846) + 25;
    }
    if (baseColor[key] < 0) {
      baseColor[key] = 0;
    } else if (baseColor[key] > 255) {
      baseColor[key] = 255;
    }
  }
  return newRgbObject as { r: number; g: number; b: number };
};
