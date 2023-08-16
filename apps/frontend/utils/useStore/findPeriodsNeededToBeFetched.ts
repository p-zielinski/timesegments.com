export const findPeriodsNeededToBeFetched = (desiredPeriod, fetchedPeriods) => {
  const alreadyFetchedPeriods = fetchedPeriods
    .map((fetchedPeriod) =>
      findAlreadyFetchedPeriod(desiredPeriod, fetchedPeriod)
    )
    .filter((e) => e)
    .sort((a, b) => a.from - b.from);
  if (alreadyFetchedPeriods.length === 0) {
    return [desiredPeriod];
  }
  const needToFetchPeriods = [];
  if (desiredPeriod.from !== alreadyFetchedPeriods.at(0).from) {
    needToFetchPeriods.push({
      from: desiredPeriod.from,
      to: alreadyFetchedPeriods.at(0).from,
    });
  }
  for (let i = 1; i < alreadyFetchedPeriods.length; i++) {
    needToFetchPeriods.push({
      from: alreadyFetchedPeriods.at(i - 1).to,
      to: alreadyFetchedPeriods.at(i).from,
    });
  }
  if (desiredPeriod.to !== alreadyFetchedPeriods.at(-1).to) {
    needToFetchPeriods.push({
      from: alreadyFetchedPeriods.at(-1).to,
      to: desiredPeriod.to,
    });
  }
  return needToFetchPeriods;
};

const findAlreadyFetchedPeriod = (desiredPeriod, fetchedPeriod) => {
  let nf, nt;
  if (fetchedPeriod.from < desiredPeriod.from) {
    nf = desiredPeriod.from;
  } else if (
    fetchedPeriod.from >= desiredPeriod.from &&
    fetchedPeriod.from <= desiredPeriod.to
  ) {
    nf = fetchedPeriod.from;
  } else {
    return null;
  }
  if (fetchedPeriod.to > desiredPeriod.to) {
    nt = desiredPeriod.to;
  } else if (
    fetchedPeriod.to >= desiredPeriod.from &&
    fetchedPeriod.to <= desiredPeriod.to
  ) {
    nt = fetchedPeriod.to;
  } else {
    return null;
  }
  return { from: nf, to: nt };
};
