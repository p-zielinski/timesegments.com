// @mui
import { Box, Typography } from '@mui/material';

export default function TitleBar({ title }) {
  return (
    <Box sx={{ color: 'black' }} variant="h4">
      <Typography variant="h4">{title}</Typography>
    </Box>
  );
}
