import { DateTime } from 'luxon';

export const mapTimeLogsToDateTimeLogs = (
  timeLogs,
  userTimeZone,
  categories
) => {
  return timeLogs.map((timeLog) => {
    const startedAt = DateTime.fromISO(timeLog.startedAt, {
      zone: userTimeZone,
    });
    const endedAt = timeLog?.endedAt
      ? typeof timeLog.endedAt === 'string'
        ? DateTime.fromISO(timeLog.endedAt, {
            zone: userTimeZone,
          })
        : timeLog.endedAt
      : undefined;
    const ended = !!timeLog.endedAt;
    let periodInSeconds, periodInMinutes, periodInHours;
    if (ended) {
      const periodTotalMs = endedAt.ts - startedAt.ts;
      const periodInSecondsTotal = Math.floor(periodTotalMs / 1000);
      const periodInMinutesTotal = Math.floor(periodInSecondsTotal / 60);
      periodInHours = Math.floor(periodInMinutesTotal / 60);
      periodInMinutes = periodInMinutesTotal % 60;
      periodInSeconds = periodInSecondsTotal % 60;
    }
    return {
      timeLogId: timeLog.id,
      isIsoString: false,
      ended,
      startedAt: startedAt,
      endedAt: endedAt,
      category: timeLog.categoryId
        ? categories.find((category) => category.id === timeLog.categoryId)
        : undefined,
      subcategory: timeLog.subcategoryId
        ? (
            categories.find((category) => category.id === timeLog.categoryId)
              .subcategories || []
          ).find((subcategory) => subcategory.id === timeLog.subcategoryId)
        : undefined,
      periodTotalMs: ended ? endedAt.ts - startedAt.ts : undefined,
      periodInHours,
      periodInMinutes,
      periodInSeconds,
    };
  });
};
