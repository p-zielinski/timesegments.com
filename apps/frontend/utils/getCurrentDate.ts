import { Timezones } from '@test1/shared';
import { DateTime } from 'luxon';

export const getRelativeDate = (timezone: Timezones, days = 0, months = 0) =>
  DateTime.now()
    .setZone(timezone)
    .set({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
    .plus({ days, months });

export const getCurrentTime = (timezone: Timezones) =>
  DateTime.now().setZone(timezone);

export const getCurrentDate = (timezone: Timezones) =>
  getRelativeDate(timezone, 0);

export const getNextDate = (timezone: Timezones) =>
  getRelativeDate(timezone, 1);
