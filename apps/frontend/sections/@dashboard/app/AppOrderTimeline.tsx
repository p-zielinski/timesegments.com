// @mui
import {Box, Card, CardContent, Typography} from '@mui/material';
import {Timeline, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator,} from '@mui/lab';
import {nanoid} from 'nanoid'; // utils
import {getHexFromRGBAObject} from '../../../utils/colors/getHexFromRGBAObject';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
// utils
// ----------------------------------------------------------------------

export default function AppOrderTimeline({
  user,
  timeLogsWithinActiveDate,
  showDetails,
}) {
  const getGroupedTimeLogsWithDate = (timeLogsWithinActiveDate) => {
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
    return grouped.map((group) => {
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
                  .sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0))
                  .map((timeLogExtended) => (
                    <OrderItem
                      key={nanoid()}
                      timeLogExtended={timeLogExtended}
                    />
                  ))
              : 'nope'}
          </Timeline>
        ) : (
          'no data'
        )}
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
