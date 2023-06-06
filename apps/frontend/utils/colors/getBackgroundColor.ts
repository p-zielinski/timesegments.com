import { getHexFromRGBAObject } from './getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from './getRgbaObjectFromHexString';
import { getColorShadeBasedOnSliderPickerSchema } from './getColorShadeBasedOnSliderPickerSchema';

export const getBackgroundColor = (alpha, color) =>
  getHexFromRGBAObject(
    getRgbaObjectFromHexString(
      getHexFromRGBAObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRgbaObjectFromHexString(color),
          'bright'
        )
      ),
      alpha
    )
  );
