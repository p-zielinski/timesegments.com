export const findValueOfEnum = (enumObject, value) => {
  for (const key of Object.keys(enumObject)) {
    if (enumObject[key] === value) {
      return key;
    }
  }
};
