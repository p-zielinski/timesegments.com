// @mui
import {Box, Card, CardContent, Typography} from '@mui/material';
import {Timeline, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator,} from '@mui/lab';
import {nanoid} from 'nanoid'; // utils
import {getHexFromRGBAObject} from '../../../utils/colors/getHexFromRGBAObject';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
import {useEffect, useState} from 'react';
import {DateTime} from 'luxon';
import {Timezones} from '@test1/shared';
import {getColorShadeBasedOnSliderPickerSchema} from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../../utils/colors/getHexFromRGBObject';
// utils
// ----------------------------------------------------------------------

const getDuration = (totalPeriodInMs) => {
  const periodInSecondsTotal = Math.floor(totalPeriodInMs / 1000);
  const periodInMinutesTotal = Math.floor(periodInSecondsTotal / 60);
  const durationHours = Math.floor(periodInMinutesTotal / 60);
  const durationMinutes = periodInMinutesTotal % 60;
  const durationSeconds = periodInSecondsTotal % 60;

  const hours = durationHours
    ? `${durationHours} hour${durationHours !== 1 ? 's' : ''}`
    : undefined;
  const minutes = durationMinutes
    ? `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`
    : undefined;
  const seconds =
    durationSeconds || (!hours && !minutes)
      ? `${durationSeconds} second${durationSeconds !== 1 ? 's' : ''}`
      : undefined;

  return [hours, minutes, seconds].filter((text) => text).join(' ');
};

export default function AppOrderTimeline({
  user,
  timeLogsWithinActiveDate,
  showDetails,
}) {
  const getGroupedTimeLogsWithDateSorted = (timeLogsWithinActiveDate) => {
    const grouped = [];
    timeLogsWithinActiveDate.forEach((x) => {
      let index;
      for (const i in grouped) {
        if (grouped[i][0]?.category?.id === x?.category?.id) {
          if (
            grouped[i][0]?.subcategory === undefined &&
            x?.subcategory === undefined
          ) {
            index = i;
            break;
          }
          if (grouped[i][0]?.subcategory?.id === x?.subcategory?.id) {
            index = i;
            break;
          }
        }
      }
      if (index) {
        grouped[index] = [...grouped[index], x];
      } else {
        grouped.push([x]);
      }
    });
    return grouped
      .map((group) => {
        const category = group[0]?.category;
        const subcategory = group[0]?.subcategory;
        const notFinishedPeriod = group.find(
          (timeLogsWithinDate) => timeLogsWithinDate.ended === false
        );
        const ended = !notFinishedPeriod;
        const totalPeriodInMsWithoutUnfinishedTimeLog = group.reduce(
          (accumulator, currentValue) => {
            if (currentValue.ended) {
              return accumulator + currentValue.periodTotalMs;
            }
            return accumulator;
          },
          0
        );
        return {
          category,
          subcategory,
          notFinishedPeriod,
          ended,
          totalPeriodInMsWithoutUnfinishedTimeLog,
        };
      })
      .sort((a, b) => {
        if (a.ended === false) {
          return -1;
        }
        if (b.ended === false) {
          return 1;
        }
        return (
          b.totalPeriodInMsWithoutUnfinishedTimeLog -
          a.totalPeriodInMsWithoutUnfinishedTimeLog
        );
      });
  };

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
                      key={group.subcategory?.id || group.category?.id}
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

  const color = group?.subcategory?.color ?? group?.category?.color;

  return (
    <TimelineItem
      sx={{
        background: getHexFromRGBAObject(
          getRgbaObjectFromHexString(color, 0.2)
        ),
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
          {group.subcategory && <> - {group.subcategory?.name}</>}{' '}
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

  const color =
    timeLogExtended?.subcategory?.color ?? timeLogExtended?.category?.color;

  return (
    <TimelineItem
      sx={{
        background: getHexFromRGBAObject(
          getRgbaObjectFromHexString(color, 0.2)
        ),
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
          {timeLogExtended.subcategory && (
            <> - {timeLogExtended.subcategory?.name}</>
          )}{' '}
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
