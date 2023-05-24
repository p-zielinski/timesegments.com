import { Timezones } from '@test1/shared';
import { DateTime } from 'luxon';

export const getCurrentDate = (timezone: Timezones) => {
  return DateTime.now().setZone(timezone).set({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
};
