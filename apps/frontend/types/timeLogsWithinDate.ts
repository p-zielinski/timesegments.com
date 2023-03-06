import { FromToDate } from '@test1/shared';
import {
  TimeLogWithinCurrentPeriod,
  TimeLogWithinCurrentPeriodISO,
} from '../utils/findTimeLogsWithinCurrentPeriod';

export type TimeLogsWithinDate = {
  date: FromToDate;
  timeLogsExtended: TimeLogWithinCurrentPeriod[];
};

export type TimeLogsWithinDateISO = {
  date: FromToDate;
  timeLogsExtended: TimeLogWithinCurrentPeriodISO[];
};
