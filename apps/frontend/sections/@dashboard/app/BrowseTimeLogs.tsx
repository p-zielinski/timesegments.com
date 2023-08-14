// @mui
import {Box, Typography} from '@mui/material';
import {TimelineDot} from '@mui/lab';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
import React, {useContext, useEffect, useState} from 'react';
import {DateTime} from 'luxon';
import {getDuration, Timezones} from '@test1/shared';
import {getColorShadeBasedOnSliderPickerSchema} from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../../utils/colors/getHexFromRGBObject';
import {getBackgroundColor} from '../../../utils/colors/getBackgroundColor';
import Iconify from '../../../components/iconify';
import {useStore} from 'zustand';
import {StoreContext} from '../../../hooks/useStore';
import GroupedPeriods from './GroupedPeriods';
// utils
// ----------------------------------------------------------------------

export default function BrowseTimeLogs({ showDetails }) {
  const store = useContext(StoreContext);
  const { user, timeLogs, showTimeLogsFrom, showTimeLogsTo } = useStore(store);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {showDetails ? <GroupedPeriods /> : <GroupedPeriods />}

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
      const totalPeriodInMs = now.ts - timeLogExtended.startedAt.ts;
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

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        background: getBackgroundColor(0.2, color),
        borderRadius: '10px',
        pl: 0,
        m: 0,
        pr: 1.5,
        minHeight: '30px',
      }}
    >
      <Box sx={{ marginLeft: '10px' }}>
        <TimelineDot sx={{ background: color, mb: 0 }} />
      </Box>
      <Box
        sx={{ margin: '6px', marginLeft: '10px', marginBottom: '8px', flex: 1 }}
      >
        <Typography variant="subtitle2">
          {timeLogExtended.category?.name}
          <span
            style={{
              color: getHexFromRGBObject(
                getColorShadeBasedOnSliderPickerSchema(
                  getRgbaObjectFromHexString(color)
                )
              ),
              fontWeight: 400,
            }}
          >
            {!timeLogExtended.ended && ' *active*'}
          </span>
        </Typography>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            From:{' '}
            <b>
              {timeLogExtended.startedAt.toLocaleString(
                {
                  hour: 'numeric',
                  minute: '2-digit',
                },
                { locale: 'en' }
              )}
            </b>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            To:{' '}
            <b>
              {timeLogExtended.endedAt
                ? timeLogExtended.endedAt.toLocaleString(
                    {
                      hour: 'numeric',
                      minute: '2-digit',
                    },
                    { locale: 'en' }
                  )
                : 'now'}
            </b>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Duration:{' '}
            <b>
              {totalPeriodInMs
                ? getDuration(totalPeriodInMs)
                : calculating
                ? 'calculating'
                : 'error'}
            </b>
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', mr: '-12px' }}>
        <Box
          sx={{
            borderRadius: '10px',
            border: `solid 1px ${getBackgroundColor(0.2, color)}`,
            pl: '5px',
            pr: '5px',
            '&:hover': !disableHover &&
              !isSaving && {
                cursor: 'pointer',
                border: `solid 1px ${getBackgroundColor(1, color)}`,
              },
          }}
          onClick={() =>
            !isSaving && setIsEditing({ timeLogId: timeLogExtended.id })
          }
        >
          <Iconify
            icon={'fluent:edit-32-regular'}
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '40%',
              transform: 'translate(-40%, -50%)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
