import { ControlValue } from '@test1/shared';

export const getListControlValuesKeysToCheckOnCurrentPage = (
  pathname: string
) => {
  switch (pathname) {
    case '/dashboard/time-logs':
      return [ControlValue.TIME_LOGS];
    case '/dashboard/settings':
      return [ControlValue.USER];
    case '/dashboard':
    default:
      return Object.values(ControlValue);
  }
};
