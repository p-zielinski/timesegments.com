export const calculateTimeLogDurationDuringDesiredTimePeriod = (
  desiredPeriod: { from: number; to: number },
  timeLogPeriod: { from: number; to: number }
) => {
  let nf, nt;
  if (timeLogPeriod.from < desiredPeriod.from) {
    nf = desiredPeriod.from;
  } else if (
    timeLogPeriod.from >= desiredPeriod.from &&
    timeLogPeriod.from <= desiredPeriod.to
  ) {
    nf = timeLogPeriod.from;
  } else {
    return 0;
  }
  if (timeLogPeriod.to > desiredPeriod.to) {
    nt = desiredPeriod.to;
  } else if (
    timeLogPeriod.to >= desiredPeriod.from &&
    timeLogPeriod.to <= desiredPeriod.to
  ) {
    nt = timeLogPeriod.to;
  } else {
    return 0;
  }
  return nt - nf;
};
