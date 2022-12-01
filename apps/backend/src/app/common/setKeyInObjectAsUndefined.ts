const setKeyInObjectAsUndefined = (e: object, key: string) => {
  if (!!e && typeof e === 'object')
    for (const f of Object.keys(e)) {
      if (typeof e[f] === 'object') {
        setKeyInObjectAsUndefined(e[f], key);
      }
      if (f === key) {
        e[key] = undefined;
      }
    }
  return e;
};

export default setKeyInObjectAsUndefined;
