const removeKeyInObject = (e: object, key: string) => {
  if (!!e && typeof e === 'object')
    for (const f of Object.keys(e)) {
      if (typeof e[f] === 'object') {
        removeKeyInObject(e[f], key);
      }
      if (f === key) {
        delete e[key];
      }
    }
  return e;
};

export default removeKeyInObject;
