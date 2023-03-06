import { Category, Subcategory, TimeLog } from '@prisma/client';
import { FromToDate, Timezones } from '@test1/shared';
import { DateTime } from 'luxon';

export type TimeLogWithinCurrentPeriodISO =
  | {
      isIsoString: true;
      ended: true;
      startedAt: string;
      endedAt: string;
      categories: Category | undefined;
      subcategories: Subcategory | undefined;
      periodTotalMs: number;
      periodInHours: number;
      periodInMinutes: number;
      periodInSeconds: number;
    }
  | {
      isIsoString: true;
      ended: false;
      startedAt: string;
      endedAt: undefined;
      categories: Category | undefined;
      subcategories: Subcategory | undefined;
      periodTotalMs: undefined;
      periodInHours: undefined;
      periodInMinutes: undefined;
      periodInSeconds: undefined;
    };

export type TimeLogWithinCurrentPeriod =
  | {
      isIsoString: false;
      ended: true;
      startedAt: DateTime;
      endedAt: DateTime;
      categories: Category | undefined;
      subcategories: Subcategory | undefined;
      periodTotalMs: number;
      periodInHours: number;
      periodInMinutes: number;
      periodInSeconds: number;
    }
  | {
      isIsoString: false;
      ended: false;
      startedAt: DateTime;
      endedAt: undefined;
      categories: Category | undefined;
      subcategories: Subcategory | undefined;
      periodTotalMs: undefined;
      periodInHours: undefined;
      periodInMinutes: undefined;
      periodInSeconds: undefined;
    };

export const findTimeLogsWithinCurrentPeriod = ({
  allTimeLogs,
  timezone,
  fromDate,
  toDate,
  categories,
  subcategories,
  options,
}: {
  allTimeLogs: TimeLog[];
  timezone: Timezones;
  fromDate: FromToDate;
  toDate?: FromToDate;
  categories: Category[];
  subcategories: Subcategory[];
  options?: { asIso: true };
}): TimeLogWithinCurrentPeriod[] | TimeLogWithinCurrentPeriodISO[] => {
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
    const endedAt = timeLog?.endedAt
      ? typeof timeLog.endedAt === 'string'
        ? DateTime.fromISO(timeLog.endedAt, {
            zone: timezone,
          })
        : timeLog.endedAt
      : undefined;
    const ended = !!timeLog.endedAt;
    let periodTotalMs, periodInSeconds, periodInMinutes, periodInHours;
    if (ended) {
      const periodTotalMs = (endedAt.ts - startedAt.ts) as number;
      const periodInSecondsTotal = Math.floor(periodTotalMs / 1000);
      const periodInMinutesTotal = Math.floor(periodInSecondsTotal / 60);
      periodInHours = Math.floor(periodInMinutesTotal / 60);
      periodInMinutes = periodInMinutesTotal % 60;
      periodInSeconds = periodInSecondsTotal % 60;
    }
    return {
      isIsoString: !!options?.asIso,
      ended,
      startedAt: options?.asIso ? startedAt.toISOTime() : startedAt,
      endedAt: options?.asIso ? endedAt.toISOTime() : endedAt,
      category: timeLog.categoryId
        ? categories.find((category) => category.id === timeLog.categoryId)
        : undefined,
      subcategory: timeLog.subcategoryId
        ? subcategories.find(
            (subcategory) => subcategory.id === timeLog.subcategoryId
          )
        : undefined,
      periodTotalMs,
      periodInHours,
      periodInMinutes,
      periodInSeconds,
    };
  }) as unknown as
    | TimeLogWithinCurrentPeriod[]
    | TimeLogWithinCurrentPeriodISO[];
};
