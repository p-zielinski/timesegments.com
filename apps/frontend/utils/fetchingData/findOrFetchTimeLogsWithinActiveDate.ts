import { FromToDate, Timezones } from '@test1/shared';
import { TimeLogsWithinDate } from '../../types/timeLogsWithinDate';
import {
  findTimeLogsWithinCurrentPeriod,
  TimeLogWithinCurrentPeriod,
} from '../findTimeLogsWithinCurrentPeriod';
import { handleFetch } from './handleFetch';
import { DateTime } from 'luxon';
import { User } from '@prisma/client';

export const findOrFetchTimeLogsWithinActiveDate = async (
  date: FromToDate,
  timeLogsWithinDates: TimeLogsWithinDate[],
  activeDate: DateTime,
  setTimeLogsWithinDates: (
    value:
      | ((prevState: TimeLogsWithinDate[]) => TimeLogsWithinDate[])
      | TimeLogsWithinDate[]
  ) => void,
  user: User
): Promise<TimeLogWithinCurrentPeriod[]> => {
  const timeLogsWithinActiveDate = timeLogsWithinDates.find(
    (timeLogsWithinDate) => {
      return (
        timeLogsWithinDate.date.year === date.year &&
        timeLogsWithinDate.date.month === date.month &&
        timeLogsWithinDate.date.day === date.day
      );
    }
  )?.timeLogsExtended;
  if (timeLogsWithinActiveDate) {
    return timeLogsWithinActiveDate;
  }

  //update setTimeLogsWithinDates while fetching data
  const response = await handleFetch({
    pathOrUrl: 'time-log/find-extended',
    body: { from: { ...activeDate.c }, to: { ...activeDate.c } },
    method: 'POST',
  });
  if (response.statusCode === 201) {
    const timeLogsExtendedForActiveDate = findTimeLogsWithinCurrentPeriod({
      allTimeLogs: response.timeLogs,
      userTimezone: Timezones[user.timezone],
      fromDate: activeDate.c,
      toDate: activeDate.c,
      categories: response.categories,
      subcategories: response.subcategories,
    });
    setTimeLogsWithinDates([
      ...timeLogsWithinDates,
      {
        date: activeDate.c,
        timeLogsExtended: timeLogsExtendedForActiveDate,
      },
    ] as TimeLogsWithinDate[]);
    return timeLogsExtendedForActiveDate as TimeLogWithinCurrentPeriod[];
  }
  //handle error, error while fetching
  return [] as TimeLogWithinCurrentPeriod[];
};
