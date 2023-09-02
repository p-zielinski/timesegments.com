import { SettingOption } from '../enum/settingOption';
import { findKeyOfValueInObject } from '@test1/shared';

export const findKeyOfSettingOptionEnum = (settingOption: SettingOption) => {
  return findKeyOfValueInObject(SettingOption, settingOption);
};
