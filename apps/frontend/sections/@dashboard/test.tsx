import React, { useEffect, useState } from 'react';
import { handleFetch } from '../../utils/handleFetch';
import { FromToDate, Timezones } from '@test1/shared';
import { User } from '@prisma/client';
import { findTimeLogsWithinCurrentPeriod } from '../../utils/findTimeLogsWithinCurrentPeriod';

type TestProps = {
  user: User;
  from: FromToDate;
  to?: FromToDate;
};

export const Test: React.FC<TestProps> = ({ user, from, to }) => {
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

  console.log(
    findTimeLogsWithinCurrentPeriod({
      allTimeLogs: allTimeLogs,
      timezone: usersTimezone,
      fromDate: {
        day: 2,
        month: 3,
        year: 2023,
      },
      categories,
      subcategories,
    })
  );

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
