// @mui
import {Box, Card, CardContent, CardHeader, Typography} from '@mui/material';
import {Timeline, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator,} from '@mui/lab';
import {nanoid} from 'nanoid'; // utils
import {DateTime} from 'luxon';
import {Timezones} from '@test1/shared';
import {deleteIfValueIsFalseFromObject} from '../../../utils/deleteIfValueIsFalseFromObject';
import {getHexFromRGBAObject} from '../../../utils/colors/getHexFromRGBAObject';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
// utils
// ----------------------------------------------------------------------

export default function AppOrderTimeline({ user, timeLogsWithinDate }) {
  const daysDifference = deleteIfValueIsFalseFromObject(
    DateTime.now()
      .setZone(Timezones[user.timezone])
      .set({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      })
      .diff(timeLogsWithinDate.date, ['years', 'months', 'days'])
      .toObject()
  );

  const mapDaysDifferenceToText = (daysDifference: {
    years?: number;
    months?: number;
    days?: number;
  }) => {
    if (Object.keys(daysDifference).length === 0) {
      return '(Today)';
    }
    const years = daysDifference.years
      ? `${daysDifference.years} year${daysDifference.years !== 1 ? 's' : ''}`
      : undefined;

    const months = daysDifference.months
      ? `${daysDifference.months} month${
          daysDifference.months !== 1 ? 's' : ''
        }`
      : undefined;

    const days = daysDifference.days
      ? `${daysDifference.days} day${daysDifference.days !== 1 ? 's' : ''}`
      : undefined;

    return `(${[years, months, days].filter((text) => !!text).join(' ')} ago)`;
  };

  const title = `${timeLogsWithinDate.date.toLocaleString({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} ${mapDaysDifferenceToText(daysDifference)}`;

  return (
    <Card>
      <CardHeader title={title} />

      <CardContent
        sx={{
          '& .MuiTimelineItem-missingOppositeContent:before': {
            display: 'none',
          },
        }}
      >
        <Timeline sx={{ gap: '5px' }}>
          {timeLogsWithinDate.timeLogsExtended?.length
            ? timeLogsWithinDate.timeLogsExtended.map((timeLogExtended) => (
                <OrderItem key={nanoid()} timeLogExtended={timeLogExtended} />
              ))
            : 'no data'}
        </Timeline>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

function OrderItem({ timeLogExtended }) {
  const color =
    timeLogExtended?.subcategory?.color ?? timeLogExtended?.category?.color;

  const duration = (durationHours, durationMinutes, durationSeconds) => {
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
          )}
        </Typography>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            From:{' '}
            <b>
              {timeLogExtended.startedAt.toLocaleString({
                hour: 'numeric',
                minute: '2-digit',
              })}
            </b>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            To:{' '}
            <b>
              {timeLogExtended.endedAt
                ? timeLogExtended.endedAt.toLocaleString({
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'now'}
            </b>
          </Typography>
        </Box>
        {timeLogExtended.ended && (
          <Box sx={{ display: 'flex', direction: 'column' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Duration:{' '}
              <b>
                {duration(
                  timeLogExtended.periodInHours,
                  timeLogExtended.periodInMinutes,
                  timeLogExtended.periodInSeconds
                )}
              </b>
            </Typography>
          </Box>
        )}
      </TimelineContent>
    </TimelineItem>
  );
}
