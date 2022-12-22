const deleteCookie = (name: string, path: string) => {
  document.cookie =
    name +
    "=" +
    (path ? ";path=" + path : "") +
    ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
};

export default deleteCookie;
