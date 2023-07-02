import { DateCalendar } from '@mui/x-date-pickers';
import React from 'react';
import { DateTime } from 'luxon';
import { Box } from '@mui/material';
import { LIGHT_BLUE, ULTRA_LIGHT_BLUE } from '../../../consts/colors';

export default function Calendar({
  activeDate,
  setActiveDate,
  disabled,
}: {
  activeDate: DateTime;
  setActiveDate: (date: DateTime) => void;
  disabled: boolean;
}) {
  return (
    <Box
      sx={{
        mb: 2,
        mt: -1,
        background: ULTRA_LIGHT_BLUE,
        borderRadius: '12px',
        border: `1px solid ${LIGHT_BLUE}`,
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <DateCalendar
          value={activeDate}
          onChange={(newValue) => setActiveDate(newValue)}
          disableFuture
          disabled={disabled}
          sx={{ mr: -1 }}
        />
      </Box>
    </Box>
  );
}
