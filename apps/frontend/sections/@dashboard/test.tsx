import React, { useEffect, useState } from 'react';
import { handleFetch } from '../../utils/handleFetch';
import { FromToDate, Timezones } from '@test1/shared';
import { User } from '@prisma/client';
import { DateTime } from 'luxon';

type TestProps = {
  user: User;
  from: FromToDate;
  to?: FromToDate;
};

export const Test: React.FC<TestProps> = ({user, from, to}) => {
  const usersTimezone = Timezones[user.timezone];
  const [isFetched, setIsFetched] = useState(false);
  const [allTimeLogs, setAllTimeLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetchTimeLogs(from, to);
      if (result.statusCode === 201) {
        setAllTimeLogs(result.timeLogs); //TODO sort by startedAt - just in case
        setCategories(result.categories);
        setSubcategories(result.subcategories);
      }
      setIsFetched(true);
    })();
  }, []);

  const x = (date: FromToDate) => {
    const fromDateTime = DateTime.fromObject(
      {...date, hour: 0, minute: 0, second: 0},
      {zone: usersTimezone}
    );
    const toDateTime = DateTime.fromObject(
      {...date, hour: 24, minute: 0, second: 0},
      {zone: usersTimezone}
    );
    const timeLogs = [];
    allTimeLogs.forEach((timeLog) => {
      const timeLogStartedAt = DateTime.fromISO(timeLog.startedAt);
      const timeLogEndedAt = timeLog.endedAt
        ? DateTime.fromISO(timeLog.endedAt, {
          zone: usersTimezone,
        })
        : DateTime.now().set(date).setZone(usersTimezone);
      if (fromDateTime.ts > timeLogEndedAt.ts) {
        return
      }
      if (fromDateTime.ts < timeLogStartedAt.ts && toDateTime.ts > timeLogEndedAt.ts) {

      }
    });
    return timeLogs;
  };


  x({
    day: 2,
    month: 3,
    year: 2023,
  });

  const fetchTimeLogs = async (from: FromToDate, to?: FromToDate) => {
    return await handleFetch({
      pathOrUrl: 'time-log/find-extended',
      body: {
        from,
        to: to ?? from,
      },
      method: 'POST',
    });
  };

  if (!isFetched) {
    return <>Fetching</>;
  }

  return (
    <>
      {JSON.stringify(allTimeLogs)}
      {JSON.stringify(categories)}
      {JSON.stringify(subcategories)}
    </>
  );
};
