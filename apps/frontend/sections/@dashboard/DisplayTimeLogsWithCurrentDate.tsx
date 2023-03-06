import React from 'react';
import { TimeLogsWithinDate } from '../../types/timeLogsWithinDate';
import { DateTime } from 'luxon';
import { User } from '@prisma/client';

type TestProps = {
  user: User;
  timeLogsWithDates: TimeLogsWithinDate[];
  setTimeLogsWithDates: (timeLogsWithinDate: TimeLogsWithinDate[]) => void;
  setIsFetched: (isFetched: boolean) => void;
  activeDate: DateTime;
  setActiveDate: (date: DateTime) => void;
};

export const DisplayTimeLogsWithCurrentDate: React.FC<TestProps> = ({
  user,
  timeLogsWithDates,
  setTimeLogsWithDates,
  setIsFetched,
  activeDate,
  setActiveDate,
}) => {
  return <>aa</>;
};
