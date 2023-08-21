// @mui
import {Box, Typography} from '@mui/material';
import {TimelineDot} from '@mui/lab';
import React, {useContext, useEffect, useState} from 'react';
import {getDuration, Timezones} from '@test1/shared';
import {getBackgroundColor} from '../../../utils/colors/getBackgroundColor';
import {StoreContext} from '../../../hooks/useStore';
import {useStore} from 'zustand';
import {getHexFromRGBObject} from 'apps/frontend/utils/colors/getHexFromRGBObject';
import {getColorShadeBasedOnSliderPickerSchema} from 'apps/frontend/utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getRgbaObjectFromHexString} from 'apps/frontend/utils/colors/getRgbaObjectFromHexString';
import {DateTime} from 'luxon';
import Iconify from '../../../components/iconify';
import {TimeLog} from '@prisma/client';
import {calculateTimeLogDurationDuringDesiredTimePeriod} from '../../../helperFunctions/calculateTimeLogDurationDuringDesiredTimePeriod';
import {cloneDeep} from 'lodash';
import EditTimeLog from '../browse/EditTimeLog';
// utils
// ----------------------------------------------------------------------

export default function DetailPeriod({ timeLog }: { timeLog: TimeLog }) {
  const store = useContext(StoreContext);
  const { isEditing, showTimeLogsFrom, showTimeLogsTo } = useStore(store);

  if (isEditing.timeLogId === timeLog.id) {
    return <EditTimeLog timeLog={timeLog} />;
  }

  const calculateTimeLogDurationDuringDesiredTimePeriodWrapper = () =>
    calculateTimeLogDurationDuringDesiredTimePeriod(
      { from: showTimeLogsFrom, to: showTimeLogsTo },
      cloneDeep({
        from: new Date(timeLog.startedAt).getTime(),
        to: timeLog.endedAt
          ? new Date(timeLog.endedAt).getTime()
          : new Date().getTime(),
      })
    );

  const [duration, setDuration] = useState(
    calculateTimeLogDurationDuringDesiredTimePeriodWrapper()
  );

  useEffect(() => {
    if (timeLog.endedAt) {
      return;
    }
    setDuration(calculateTimeLogDurationDuringDesiredTimePeriodWrapper());
    const intervalIdLocal = setInterval(
      () =>
        setDuration(calculateTimeLogDurationDuringDesiredTimePeriodWrapper()),
      1000
    );
    return () => clearInterval(intervalIdLocal);
  }, [timeLog, showTimeLogsFrom, showTimeLogsTo]);

  return (
    <DisplayTimeLog
      timeLog={timeLog}
      duration={duration}
      key={`DisplayTimeLog-${timeLog.id}-${duration}`}
    />
  );
}

function DisplayTimeLog({
  timeLog,
  duration,
}: {
  timeLog: TimeLog;
  duration: number;
}) {
  const store = useContext(StoreContext);
  const {
    categories,
    showTimeLogsFrom,
    showTimeLogsTo,
    disableHover,
    isSaving,
    setIsEditing,
    user,
  } = useStore(store);
  const category = categories.find(
    (category) => category.id === timeLog.categoryId
  );

  const color = category.color;

  const from: number =
    new Date(timeLog.startedAt).getTime() < showTimeLogsFrom
      ? showTimeLogsFrom
      : new Date(timeLog.startedAt).getTime();

  const to: number =
    !timeLog.endedAt || new Date(timeLog.endedAt).getTime() > showTimeLogsTo
      ? showTimeLogsTo
      : new Date(timeLog.endedAt).getTime();

  const dateFormat =
    showTimeLogsTo - showTimeLogsFrom <= 1000 * 60 * 60 * 24
      ? DateTime.TIME_SIMPLE
      : DateTime.DATETIME_SHORT;

  const showPlusOne: boolean =
    to === showTimeLogsTo &&
    new Date().getTime() > showTimeLogsTo &&
    dateFormat === DateTime.TIME_SIMPLE;

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
          {category?.name}
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
            {!timeLog.endedAt && ' *active*'}
          </span>
        </Typography>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            From:{' '}
            <b>
              {DateTime.fromMillis(from)
                .setZone(Timezones[user.timezone])
                .toLocaleString(dateFormat)}
            </b>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            To:{' '}
            <b>
              {typeof timeLog.endedAt === 'string' ||
              new Date().getTime() > showTimeLogsTo
                ? DateTime.fromMillis(to)
                    .setZone(Timezones[user.timezone])
                    .toLocaleString(dateFormat)
                : 'now'}{' '}
              {showPlusOne && `(+1 day)`}
            </b>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Duration: <b>{getDuration(duration)}</b>
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
          onClick={() => !isSaving && setIsEditing({ timeLogId: timeLog.id })}
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
