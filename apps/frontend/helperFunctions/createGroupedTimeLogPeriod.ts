import { TimeLog, User } from '@prisma/client';
import { Timezones } from '@test1/shared';
import { calculateTimeLogDurationDuringDesiredTimePeriod } from './calculateTimeLogDurationDuringDesiredTimePeriod';
import { DateTime } from 'luxon';
import { cloneDeep } from 'lodash';

export const createGroupedTimeLogPeriod = (
  user: User,
  timeLogs: TimeLog[],
  categoryId: string
) => {
  const endOfDay = DateTime.now()
    .setZone(Timezones[user.timezone])
    .set({ hour: 24, minute: 0, second: 0, millisecond: 0 });
  const beginningOfToday = endOfDay.minus({ days: 1 });
  const desiredPeriod = { from: beginningOfToday.ts, to: endOfDay.ts };
  let groupedTimeLogPeriods: number = 0;
  timeLogs
    .filter((timeLog) => timeLog.categoryId === categoryId)
    .forEach((timeLog) => {
      const duration = calculateTimeLogDurationDuringDesiredTimePeriod(
        desiredPeriod,
        cloneDeep({
          from: new Date(timeLog.startedAt).getTime(),
          to: timeLog.endedAt
            ? new Date(timeLog.endedAt).getTime()
            : new Date().getTime(),
        })
      );
      groupedTimeLogPeriods += duration;
    });
  return groupedTimeLogPeriods;
};
