export const deleteIfValueIsFalseFromObject = (object) => {
  if (!!object && typeof object === 'object')
    for (const key of Object.keys(object)) {
      if (!object[key]) {
        delete object[key];
      }
      if (typeof object[key] === 'object') {
        deleteIfValueIsFalseFromObject(object[key]);
      }
    }
  return object;
};
