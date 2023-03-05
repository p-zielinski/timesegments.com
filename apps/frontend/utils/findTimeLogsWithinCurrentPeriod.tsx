import { Category, Subcategory, TimeLog } from '@prisma/client';
import { FromToDate, Timezones } from '@test1/shared';
import { DateTime } from 'luxon';

export const findTimeLogsWithinCurrentPeriod = ({
  allTimeLogs,
  timezone,
  fromDate,
  toDate,
  categories = [],
  subcategories = [],
}: {
  allTimeLogs: TimeLog[];
  timezone: Timezones;
  fromDate: FromToDate;
  toDate?: FromToDate;
  categories: Category[];
  subcategories: Subcategory[];
}) => {
  const fromDateTime = DateTime.fromObject(
    { ...fromDate, hour: 0, minute: 0, second: 0 },
    { zone: timezone }
  );
  const toDateTime = DateTime.fromObject(
    { ...(toDate ?? fromDate), hour: 24, minute: 0, second: 0 },
    { zone: timezone }
  );
  const timeLogs = [];
  allTimeLogs.forEach((timeLog) => {
    const timeLogStartedAt = DateTime.fromISO(timeLog.startedAt);
    const timeLogEndedAt = timeLog.endedAt
      ? DateTime.fromISO(timeLog.endedAt, {
          zone: timezone,
        })
      : DateTime.now().setZone(timezone);
    if (fromDateTime.ts > timeLogEndedAt.ts) {
      return;
    }
    if (toDateTime.ts < timeLogStartedAt.ts) {
      return;
    }
    if (
      fromDateTime.ts > timeLogStartedAt.ts &&
      toDateTime.ts < timeLogEndedAt.ts
    ) {
      return timeLogs.push({
        ...timeLog,
        startedAt: fromDateTime,
        endedAt: toDateTime,
      });
    }
    if (
      fromDateTime.ts > timeLogStartedAt.ts &&
      toDateTime.ts > timeLogEndedAt.ts
    ) {
      return timeLogs.push({
        ...timeLog,
        startedAt: fromDateTime,
      });
    }
    if (
      fromDateTime.ts < timeLogStartedAt.ts &&
      toDateTime.ts < timeLogEndedAt.ts
    ) {
      return timeLogs.push({
        ...timeLog,
        endedAt: toDateTime,
      });
    }
    return timeLogs.push(timeLog);
  });
  return timeLogs.map((timeLog) => {
    const startedAt = DateTime.fromISO(timeLog.startedAt, {
      zone: timezone,
    });
    const ended = !!timeLog.endedAt;
    let periodInSeconds, periodInMinutes, periodInHours;
    if (ended) {
      const periodMs = timeLog.endedAt.ts - startedAt.ts;
      const periodInSecondsTotal = Math.floor(periodMs / 1000);
      const periodInMinutesTotal = Math.floor(periodInSecondsTotal / 60);
      periodInHours = Math.floor(periodInMinutesTotal / 60);
      periodInMinutes = periodInMinutesTotal % 60;
      periodInSeconds = periodInSecondsTotal % 60;
    }
    return {
      startedAt,
      endedAt: timeLog.endedAt,
      ended,
      periodMs: timeLog.endedAt?.ts
        ? timeLog.endedAt.ts - startedAt.ts
        : undefined,
      category: timeLog.categoryId
        ? categories.find((category) => category.id === timeLog.categoryId)
        : undefined,
      subcategory: timeLog.subcategoryId
        ? subcategories.find(
            (subcategory) => subcategory.id === timeLog.subcategoryId
          )
        : undefined,
      periodInHours,
      periodInMinutes,
      periodInSeconds,
    };
  });
};
