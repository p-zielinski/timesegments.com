import { TimeLog, User } from '@prisma/client';
import { Timezones } from '@test1/shared';
import { calculateTimeLogDurationDuringDesiredTimePeriod } from './calculateTimeLogDurationDuringDesiredTimePeriod';
import { DateTime } from 'luxon';
import { cloneDeep } from 'lodash';

export const createGroupedTimeLogPeriods = (
  user: User,
  timeLogs: TimeLog[]
) => {
  const endOfDay = DateTime.now()
    .setZone(Timezones[user.timezone])
    .set({ hour: 24, minute: 0, second: 0, millisecond: 0 });
  const beginningOfToday = endOfDay.minus({ days: 1 });
  const desiredPeriod = { from: beginningOfToday.ts, to: endOfDay.ts };
  const groupedTimeLogPeriods: Record<string, number> = {};
  timeLogs.forEach((timeLog) => {
    const duration = calculateTimeLogDurationDuringDesiredTimePeriod(
      desiredPeriod,
      cloneDeep({
        from: new Date(timeLog.startedAt).getTime(),
        to: timeLog.endedAt
          ? new Date(timeLog.endedAt).getTime()
          : new Date().getTime(),
      })
    );
    groupedTimeLogPeriods[timeLog.categoryId] =
      duration + (groupedTimeLogPeriods?.[timeLog.categoryId] || 0);
  });
  return groupedTimeLogPeriods;
};
