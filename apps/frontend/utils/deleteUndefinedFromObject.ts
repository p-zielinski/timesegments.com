export const deleteUndefinedFromObject = (object) => {
  if (!!object && typeof object === 'object')
    for (const key of Object.keys(object)) {
      if (typeof object[key] === 'object') {
        deleteUndefinedFromObject(object[key]);
      }
      if (typeof object[key] === 'undefined') {
        delete object[key];
      }
    }
  return object;
};
