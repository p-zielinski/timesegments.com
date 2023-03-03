import React, { useEffect, useState } from 'react';
import { handleFetch } from '../../utils/handleFetch';
import { FromToDate } from '@test1/shared';

type TestProps = {
  from: FromToDate;
  to?: FromToDate;
};

export const Test: React.FC<TestProps> = ({ from, to }) => {
  const [isFetched, setIsFetched] = useState(false);
  const [timeLogs, setTimeLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetchTimeLogs(from, to);
      if (result.statusCode === 201) {
        setTimeLogs(result.timeLogs);
        setCategories(result.categories);
        setSubcategories(result.subcategories);
      }
      setIsFetched(true);
    })();
  }, []);

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
      {JSON.stringify(timeLogs)}
      {JSON.stringify(categories)}
      {JSON.stringify(subcategories)}
    </>
  );
};
