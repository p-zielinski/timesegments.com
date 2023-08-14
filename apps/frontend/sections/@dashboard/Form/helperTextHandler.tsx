import parse from 'html-react-parser';

const helperTextHandler = (
  meta: any,
  helperText = '',
  infoText = `&nbsp;`,
  showInfoTextOnError = false,
  hideFieldUpdating = false
) => {
  const result =
    meta.initialValue &&
    JSON.stringify(meta.initialValue) !== JSON.stringify([]) &&
    meta.initialValue !== meta.value &&
    !!meta.value &&
    !meta.error
      ? infoText !== `&nbsp;`
        ? `${infoText}. Field updated`
        : 'Field updated'
      : helperText?.match(/optional/i)
      ? meta.touched
        ? meta.error
          ? meta.error
          : meta.initialValue &&
            JSON.stringify(meta.initialValue) !== JSON.stringify([]) &&
            meta.initialValue !== meta.value &&
            meta.value
          ? infoText !== `&nbsp;`
            ? `${infoText} Field updated`
            : 'Field updated'
          : helperText?.match(/recommended/i)
          ? 'Optional but recommended'
          : 'Optional'
        : meta.initialValue && meta.error
        ? showInfoTextOnError
          ? `${meta.error}. ${infoText}`
          : meta.error
        : helperText?.match(/recommended/i)
        ? 'Optional but recommended'
        : 'Optional'
      : meta.touched
      ? meta.error
        ? showInfoTextOnError
          ? `${meta.error}. ${infoText}`
          : meta.error
        : parse(infoText)
      : meta.initialValue && meta.error
      ? infoText !== `&nbsp;`
        ? `${infoText} Field updated`
        : 'Field updated'
      : parse(infoText);
  if (result === 'Field updated') {
    return parse(`&nbsp;`);
  }
  return result;
};

export default helperTextHandler;
