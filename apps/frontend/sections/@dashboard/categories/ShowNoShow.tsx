import { Box, Card as CardBlock, Grid, Stack, Typography } from '@mui/material';
import { ShowNoShowType } from '../../../enum/showNoShowType';

export default function ShowNoShow({ type }: { type: ShowNoShowType }) {
  const Card = (
    <CardBlock
      sx={{
        backgroundColor: 'rgba(0,0,0,0.11)',
        border: `solid 2px rgba(0,0,0,0.02)`,
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography noWrap>No {type} to display</Typography>
      </Stack>
    </CardBlock>
  );

  if (type === ShowNoShowType.SUBCATEGORIES) {
    return Card;
  }

  return (
    <Grid key={`no_${type}_to_show`} item xs={1} sm={1} md={1}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: `100px`,
            }}
          ></Box>
          <Box
            sx={{
              flex: 1,
            }}
          >
            {Card}
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}
