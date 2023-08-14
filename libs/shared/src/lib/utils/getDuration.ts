import { Duration } from 'luxon';

export const getDuration = (totalPeriodInMs: number) => {
  if (!totalPeriodInMs) {
    return `0 seconds`;
  }
  const durationObject = Duration.fromMillis(totalPeriodInMs)
    .shiftToAll()
    .toObject();
  delete durationObject.milliseconds;
  let durationString = '';
  Object.entries(durationObject).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    durationString += ` ${value} ${
      value !== 1 ? key : key.slice(0, key.length - 1)
    }`;
  });
  return durationString;
};
