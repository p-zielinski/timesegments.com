export const findKeyOfValueInObject = (object, value: string) => {
  for (const key in object) {
    if (object[key] === value) {
      return key;
    }
  }
};
