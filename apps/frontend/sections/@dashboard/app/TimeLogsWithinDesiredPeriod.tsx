// @mui
import React, {useContext} from 'react';
import {useStore} from 'zustand';
import {StoreContext} from '../../../hooks/useStore';
import {calculateTimeLogDurationDuringDesiredTimePeriod} from '../../../helperFunctions/calculateTimeLogDurationDuringDesiredTimePeriod';
import {cloneDeep} from 'lodash';
import ShowNoData from '../browse/ShowNoData';
import DetailPeriod from './DetailPeriod';
import {nanoid} from 'nanoid';
// utils
// ----------------------------------------------------------------------

export default function TimeLogsWithinDesiredPeriod({}) {
  const store = useContext(StoreContext);
  const { timeLogs, showTimeLogsFrom, showTimeLogsTo } = useStore(store);

  const timeLogsWithinDesiredTimePeriodSortedByStartedAt = timeLogs
    .filter((timeLog) =>
      calculateTimeLogDurationDuringDesiredTimePeriod(
        { from: showTimeLogsFrom, to: showTimeLogsTo },
        cloneDeep({
          from: new Date(timeLog.startedAt).getTime(),
          to: timeLog.endedAt
            ? new Date(timeLog.endedAt).getTime()
            : new Date().getTime(),
        })
      )
    )
    .sort(
      (timeLog1, timeLog2) =>
        new Date(timeLog1.startedAt).getTime() -
        new Date(timeLog2.startedAt).getTime()
    );

  return (
    <>
      {timeLogsWithinDesiredTimePeriodSortedByStartedAt.map((timeLog) => (
        <DetailPeriod timeLog={timeLog} key={nanoid()} />
      ))}
      {timeLogsWithinDesiredTimePeriodSortedByStartedAt.length === 0 && (
        <ShowNoData />
      )}
    </>
  );
}
