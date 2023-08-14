// @mui
import {Box} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {DateTime} from 'luxon';
import {Timezones} from '@test1/shared';
import {useStore} from 'zustand';
import {StoreContext} from '../../../hooks/useStore';
import GroupedPeriods from './GroupedPeriods';
import TimeLogsWithinDesiredPeriod from './TimeLogsWithinDesiredPeriod';
// utils
// ----------------------------------------------------------------------

export default function BrowseTimeLogs({ showDetails }) {
  const store = useContext(StoreContext);
  const { user, timeLogs, showTimeLogsFrom, showTimeLogsTo } = useStore(store);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {showDetails ? <TimeLogsWithinDesiredPeriod /> : <GroupedPeriods />}

        {/*{showDetails ? (*/}
        {/*  <>*/}
        {/*    /!*<AddTimeLog*!/*/}
        {/*    /!*  user={user}*!/*/}
        {/*    /!*  isEditing={isEditing}*!/*/}
        {/*    /!*  setIsEditing={setIsEditing}*!/*/}
        {/*    /!*  categories={categories}*!/*/}
        {/*    /!*  controlValue={controlValue}*!/*/}
        {/*    /!*  setControlValue={setControlValue}*!/*/}
        {/*    /!*  disableHover={disableHover}*!/*/}
        {/*    /!*  isSaving={isSaving}*!/*/}
        {/*    /!*  setIsSaving={setIsSaving}*!/*/}
        {/*    /!*  refreshTimeLogs={refreshTimeLogs}*!/*/}
        {/*    /!*/
        /*/}
                                                                                                                                                {/*    {`timeLogs`}*/}
        {/*  </>*/}
        {/*) : timeLogsWithinActiveDate?.length ? (*/}
        {/*  getGroupedTimeLogsWithDateSorted(timeLogsWithinActiveDate).map(*/}
        {/*    (group) => (*/}
        {/*
        {/*    )*/}
        {/*  )*/}
        {/*) : (*/}
        {/*  <ShowNoData />*/}
        {/*)}*/}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function DetailPeriod({ timeLogExtended, user, setIsEditing }) {
  const [totalPeriodInMs, setTotalPeriodInMs] = useState(
    timeLogExtended.periodTotalMs
  );
  const [calculating, setCalculating] = useState(true);
  useEffect(() => {
    if (timeLogExtended.periodTotalMs || timeLogExtended.ended === true) {
      return;
    }
    const setTotalPeriodInMsWithUnfinishedTimeLog = () => {
      const now = DateTime.now().setZone(Timezones[user.timezone]);
      const totalPeriodInMs =
        now.toMillis() - timeLogExtended.startedAt.toMillis();
      if (isNaN(totalPeriodInMs)) {
        return console.log(`totalPeriodInMs is NaN`);
      }
      setCalculating(false);
      setTotalPeriodInMs(totalPeriodInMs);
    };
    setTotalPeriodInMsWithUnfinishedTimeLog();
    setCalculating(false);
    const intervalId = setInterval(
      () => setTotalPeriodInMsWithUnfinishedTimeLog(),
      1000
    );
    return () => clearInterval(intervalId);
  }, []);

  const color = timeLogExtended?.category?.color;

  const isSaving = false;
  const disableHover = false;
}
