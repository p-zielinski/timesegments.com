import { Card, Stack, Typography } from '@mui/material';

export default function ShowNoData() {
  return (
    <Card
      sx={{
        backgroundColor: 'rgba(0,0,0,0.11)',
        border: `solid 2px rgba(0,0,0,0.02)`,
      }}
    >
      <Stack spacing={2} sx={{ p: 1.63 }}>
        <Typography noWrap>No data</Typography>
      </Stack>
    </Card>
  );
}
