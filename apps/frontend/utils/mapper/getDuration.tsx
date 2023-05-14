export const getDuration = (totalPeriodInMs) => {
  const periodInSecondsTotal = Math.floor(totalPeriodInMs / 1000);
  const periodInMinutesTotal = Math.floor(periodInSecondsTotal / 60);
  const durationHours = Math.floor(periodInMinutesTotal / 60);
  const durationMinutes = periodInMinutesTotal % 60;
  const durationSeconds = periodInSecondsTotal % 60;

  const hours = durationHours
    ? `${durationHours} hour${durationHours !== 1 ? 's' : ''}`
    : undefined;
  const minutes = durationMinutes
    ? `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`
    : undefined;
  const seconds =
    durationSeconds || (!hours && !minutes)
      ? `${durationSeconds} second${durationSeconds !== 1 ? 's' : ''}`
      : undefined;

  return [hours, minutes, seconds].filter((text) => text).join(' ');
};
