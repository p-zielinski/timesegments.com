import { timezoneOptions } from '../../../consts/timezoneOptions';

const getTimezoneOptionsForSelectWithSearch = () => {
  const timezoneOptionsResult = [];
  for (const key of Object.keys(timezoneOptions)) {
    for (const timezone of timezoneOptions[key]) {
      timezoneOptionsResult.push({
        groupBy: key,
        label: timezone.name,
        value: timezone.value,
      });
    }
  }
  return timezoneOptionsResult;
};

export const timezoneOptionsForSelect = getTimezoneOptionsForSelectWithSearch();
