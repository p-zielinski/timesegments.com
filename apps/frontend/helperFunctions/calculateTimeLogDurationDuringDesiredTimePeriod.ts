export const calculateTimeLogDurationDuringDesiredTimePeriod = (
  desiredPeriod,
  timeLogPeriod
) => {
  let nf, nt;
  if (timeLogPeriod.f < desiredPeriod.f) {
    nf = desiredPeriod.f;
  } else if (
    timeLogPeriod.f >= desiredPeriod.f &&
    timeLogPeriod.f <= desiredPeriod.t
  ) {
    nf = timeLogPeriod.f;
  } else {
    return 0;
  }
  if (timeLogPeriod.t > desiredPeriod.t) {
    nt = desiredPeriod.t;
  } else if (
    timeLogPeriod.t >= desiredPeriod.f &&
    timeLogPeriod.t <= desiredPeriod.t
  ) {
    nt = timeLogPeriod.t;
  } else {
    return 0;
  }
  return nt - nf;
};
