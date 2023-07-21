export const getMapKeysAsSet = (map: Map<string, any>) => {
  const keysIterator = map.keys();
  const result = new Set();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const value = keysIterator.next().value;
    if (!value) {
      break;
    }
    result.add(value);
  }
  return result;
};
