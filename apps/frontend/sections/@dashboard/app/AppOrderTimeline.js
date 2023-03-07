// @mui
import {Box, Card, CardContent, CardHeader, Typography} from '@mui/material';
import {Timeline, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator,} from '@mui/lab'; // utils
// utils
// ----------------------------------------------------------------------

export default function AppOrderTimeline({ title, timeLogsExtended }) {
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
        <Timeline>
          {timeLogsExtended.map((timeLogExtended) => (
            <OrderItem timeLogExtended={timeLogExtended} />
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

function OrderItem({ timeLogExtended }) {
  const color =
    timeLogExtended?.subcategory?.color ?? timeLogExtended?.category?.color;
  const periodInHours = timeLogExtended.periodInHours;
  const periodInMinutes = timeLogExtended.periodInMinutes;
  const periodInSeconds = timeLogExtended.periodInSeconds;
  return (
    <TimelineItem>
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
            {timeLogExtended.startedAt.toLocaleString({
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', direction: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            To:{' '}
            {timeLogExtended.endedAt?.toLocaleString({
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }) ?? 'now'}
          </Typography>
        </Box>
        {timeLogExtended.ended && (
          <Box sx={{ display: 'flex', direction: 'column' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Duration: {periodInHours} hour{periodInHours !== 1 && 's'}{' '}
              {periodInMinutes} minute{periodInMinutes !== 1 && 's'}{' '}
              {periodInSeconds} second{periodInSeconds !== 1 && 's'}
            </Typography>
          </Box>
        )}
      </TimelineContent>
    </TimelineItem>
  );
}
