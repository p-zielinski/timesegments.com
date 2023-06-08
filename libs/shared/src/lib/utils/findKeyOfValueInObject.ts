export const findKeyOfValueInObject = (object: any, value: string) => {
  for (const key in object) {
    if (object[key] === value) {
      return key;
    }
  }
  return;
};
