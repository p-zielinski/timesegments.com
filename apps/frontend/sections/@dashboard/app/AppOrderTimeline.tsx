// @mui
import {Box, Card, CardContent, Typography} from '@mui/material';
import {Timeline, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator,} from '@mui/lab';
import {nanoid} from 'nanoid'; // utils
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
import {useEffect, useState} from 'react';
import {DateTime} from 'luxon';
import {Timezones} from '@test1/shared';
import {getColorShadeBasedOnSliderPickerSchema} from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../../utils/colors/getHexFromRGBObject';
import {getGroupedTimeLogsWithDateSorted} from '../../../utils/mapper/getGroupedTimeLogsWithDateSorted';
import {getDuration} from '../../../utils/mapper/getDuration';
import {getBackgroundColor} from '../../../utils/colors/getBackgroundColor';
// utils
// ----------------------------------------------------------------------

export default function AppOrderTimeline({
  user,
  timeLogsWithinActiveDate,
  showDetails,
}) {
  return (
    <Card>
      <CardContent
        sx={{
          '& .MuiTimelineItem-missingOppositeContent:before': {
            display: 'none',
          },
        }}
      >
        {timeLogsWithinActiveDate?.length ? (
          <Timeline sx={{ gap: 1.5, m: -2 }}>
            {showDetails
              ? timeLogsWithinActiveDate
                  .sort((a, b) => b.startedAt - a.startedAt)
                  .map((timeLogExtended) => (
                    <DetailPeriod
                      timeLogExtended={timeLogExtended}
                      user={user}
                      key={nanoid()}
                    />
                  ))
              : getGroupedTimeLogsWithDateSorted(timeLogsWithinActiveDate).map(
                  (group) => (
                    <GroupedPeriod
                      group={group}
                      user={user}
                      key={group.category?.id}
                    ></GroupedPeriod>
                  )
                )}
          </Timeline>
        ) : (
          'no data'
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

function GroupedPeriod({ group, user }) {
  const [totalPeriodInMs, setTotalPeriodInMs] = useState(
    group.totalPeriodInMsWithoutUnfinishedTimeLog
  );
  useEffect(() => {
    if (!group.notFinishedPeriod) {
      return;
    }
    const setTotalPeriodInMsWithUnfinishedTimeLog = () => {
      const now = DateTime.now().setZone(Timezones[user.timezone]);
      const unfinishedPeriodDuration =
        now.ts - group.notFinishedPeriod.startedAt.ts;
      if (isNaN(unfinishedPeriodDuration)) {
        return console.log(`unfinishedPeriodDuration is NaN`);
      }
      setTotalPeriodInMs(
        group.totalPeriodInMsWithoutUnfinishedTimeLog + unfinishedPeriodDuration
      );
    };
    setTotalPeriodInMsWithUnfinishedTimeLog();
    const intervalId = setInterval(
      () => setTotalPeriodInMsWithUnfinishedTimeLog(),
      1000
    );
    return () => clearInterval(intervalId);
  }, []);

  const color = group?.category?.color;

  return (
    <TimelineItem
      sx={{
        background: getBackgroundColor(0.2, color),
        borderRadius: '10px',
        gap: '10px',
        pl: 1.5,
        pr: 1.5,
        minHeight: '30px',
      }}
    >
      <TimelineSeparator>
        <TimelineDot sx={{ background: color, mb: 0 }} />
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="subtitle2">
          {group.category?.name}
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
            {group.notFinishedPeriod && '*active*'}
          </span>
        </Typography>
        <Box sx={{ display: 'flex', direction: 'column', mb: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0 }}>
            Duration: <b>{getDuration(totalPeriodInMs)}</b>
          </Typography>
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
}

// ----------------------------------------------------------------------

function DetailPeriod({ timeLogExtended, user }) {
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

  return (
    <TimelineItem
      sx={{
        background: getBackgroundColor(0.2, color),
        borderRadius: '10px',
        gap: '10px',
        pr: 1.5,
        pl: 1.5,
      }}
    >
      <TimelineSeparator>
        <TimelineDot sx={{ background: color }} />
      </TimelineSeparator>

      <TimelineContent>
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
            {!timeLogExtended.ended && '*active*'}
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
      </TimelineContent>
    </TimelineItem>
  );
}
