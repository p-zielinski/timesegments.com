export const getQueryObjectFromUrlObject = (urlObject) => {
  const urlObjectQuery = {};
  urlObject.searchParams.forEach((value, key) => (urlObjectQuery[key] = value));
  return urlObjectQuery;
};
