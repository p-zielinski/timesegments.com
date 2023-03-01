import React, { useState } from 'react';
import { handleFetch } from '../../utils/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { FromToDate } from '@test1/shared';

type TestProps = {
  from: FromToDate;
  to: FromToDate;
};

export const Test: React.FC<TestProps> = ({ from, to }) => {
  const [isFetched, setIsFetched] = useState(false);

  const fetchData = async (
    from: FromToDate,
    to: FromToDate
  ): Promise<undefined> => {
    const response = await handleFetch({
      pathOrUrl: 'user/' + endpoint,
      body: emailAndPassword,
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      await Cookies.set('jwt_token', response.token, { expires: 7, path: '' });
      setUser(response.user);
      setCategories(response.user?.categories ?? []);
      setLimits(response.limits);
      return true;
    }
    setError(new Error(response.error));
    return;
  };

  return <>{isFetched}nope</>;
};
