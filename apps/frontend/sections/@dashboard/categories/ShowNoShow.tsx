import { Box, Card as CardBlock, Grid, Stack, Typography } from '@mui/material';
import { ShowNoShowType } from '../../../enum/showNoShowType';
import {
  IS_SAVING_HEX,
  LIGHT_SILVER,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';

export default function ShowNoShow({
  type,
  isSaving,
}: {
  type: ShowNoShowType;
  isSaving: boolean;
}) {
  const Card = (
    <CardBlock
      sx={{
        backgroundColor: SUPER_LIGHT_SILVER,
        border: `solid 2px ${isSaving ? IS_SAVING_HEX : LIGHT_SILVER}`,
        color: isSaving ? IS_SAVING_HEX : 'black',
        minHeight: 58,
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="body2" noWrap>
          No {type} to display
        </Typography>
      </Stack>
    </CardBlock>
  );

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
