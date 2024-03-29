import { DateTime } from 'luxon';

export const mapTimeLogToDateTimeLogs = (timeLog, userTimeZone, categories) => {
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
    const periodTotalMs = endedAt.toMillis() - startedAt.toMillis();
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
    periodTotalMs: ended
      ? endedAt.toMillis() - startedAt.toMillis()
      : undefined,
    periodInHours,
    periodInMinutes,
    periodInSeconds,
  };
};

export const mapTimeLogsToDateTimeLogs = (
  timeLogs,
  userTimeZone,
  categories
) => {
  return timeLogs.map((timeLog) =>
    mapTimeLogToDateTimeLogs(timeLog, userTimeZone, categories)
  );
};
