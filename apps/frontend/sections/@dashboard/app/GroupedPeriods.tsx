// @mui
import React, {useContext, useEffect, useState} from 'react';
import {useStore} from 'zustand';
import {StoreContext} from '../../../hooks/useStore';
import {calculateTimeLogDurationDuringDesiredTimePeriod} from '../../../helperFunctions/calculateTimeLogDurationDuringDesiredTimePeriod';
import {cloneDeep} from 'lodash';
import GroupedPeriod from './GroupedPeriod';
import ShowNoData from '../browse/ShowNoData';
// utils
// ----------------------------------------------------------------------

export default function GroupedPeriods({}) {
  const store = useContext(StoreContext);
  const { timeLogs, showTimeLogsFrom, showTimeLogsTo, isSaving, setIsSaving } =
    useStore(store);

  const getCategoriesDurationDuringDesiredTimePeriod = (
    timeLogs,
    showTimeLogsFrom,
    showTimeLogsTo
  ) => {
    const categoriesIdsWithDurationPeriod = timeLogs
      .map((timeLog) => {
        return {
          endedAt: timeLog.endedAt,
          categoryId: timeLog.categoryId,
          duration: calculateTimeLogDurationDuringDesiredTimePeriod(
            { from: showTimeLogsFrom, to: showTimeLogsTo },
            cloneDeep({
              from: new Date(timeLog.startedAt).getTime(),
              to: timeLog.endedAt
                ? new Date(timeLog.endedAt).getTime()
                : new Date().getTime(),
            })
          ),
        };
      })
      .filter(
        (timeLogWithDurationWithinDesiredTimePeriod) =>
          timeLogWithDurationWithinDesiredTimePeriod.duration > 0
      )
      .reduce((accumulator, timeLog) => {
        accumulator.set(timeLog.categoryId, {
          duration:
            timeLog.duration +
            (accumulator.get(timeLog.categoryId)?.duration || 0),
          notFinished:
            accumulator.get(timeLog.categoryId)?.notFinished ||
            !timeLog.endedAt,
        });
        return accumulator;
      }, new Map());
    const categoriesDurationDuringDesiredTimePeriod = [];
    const categoriesIdsWithDurationPeriodKeysIterator =
      categoriesIdsWithDurationPeriod.keys();
    let nextKey = categoriesIdsWithDurationPeriodKeysIterator.next().value;
    while (!!nextKey) {
      const nextValue = categoriesIdsWithDurationPeriod.get(nextKey);
      categoriesDurationDuringDesiredTimePeriod.push({
        categoryId: nextKey,
        duration: nextValue.duration,
        notFinished: nextValue.notFinished,
      });
      nextKey = categoriesIdsWithDurationPeriodKeysIterator.next().value;
    }
    return categoriesDurationDuringDesiredTimePeriod;
  };

  const [
    categoriesDurationDuringDesiredTimePeriod,
    setCategoriesDurationDuringDesiredTimePeriod,
  ] = useState(
    getCategoriesDurationDuringDesiredTimePeriod(
      timeLogs,
      showTimeLogsFrom,
      showTimeLogsTo
    )
  );

  useEffect(() => {
    setCategoriesDurationDuringDesiredTimePeriod(
      getCategoriesDurationDuringDesiredTimePeriod(
        timeLogs,
        showTimeLogsFrom,
        showTimeLogsTo
      )
    );
    const intervalIdLocal = setInterval(() => {
      setCategoriesDurationDuringDesiredTimePeriod(
        getCategoriesDurationDuringDesiredTimePeriod(
          timeLogs,
          showTimeLogsFrom,
          showTimeLogsTo
        )
      );
    }, 1000);
    return () => clearInterval(intervalIdLocal);
  }, [timeLogs, showTimeLogsFrom, showTimeLogsTo]);

  return (
    <>
      {isSaving ? (
        'loading'
      ) : (
        <>
          {categoriesDurationDuringDesiredTimePeriod
            .sort(
              (categoryIdAndDuration1, categoryIdAndDuration2) =>
                categoryIdAndDuration1.duration -
                categoryIdAndDuration2.duration
            )
            .map((categoryIdNotFinishedStateAndDuration) => (
              <GroupedPeriod
                categoryIdNotFinishedStateAndDuration={
                  categoryIdNotFinishedStateAndDuration
                }
              />
            ))}
          {categoriesDurationDuringDesiredTimePeriod.length === 0 && (
            <ShowNoData />
          )}
        </>
      )}
    </>
  );
}
