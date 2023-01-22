import { Card, Stack, Typography } from '@mui/material';
import { ShowLimitReachedType } from '../../../enum/showLimitReachedType';

export default function ShowLimitReached({
  type,
}: {
  type: ShowLimitReachedType;
}) {
  return (
    <Card
      sx={{
        backgroundColor: 'rgba(0,0,0,0.11)',
        border: `solid 2px rgba(0,0,0,0.02)`,
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography noWrap>
          You have reached the limit of the maximum number of {type}
        </Typography>
      </Stack>
    </Card>
  );
}
