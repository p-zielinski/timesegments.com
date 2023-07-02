import { DateCalendar } from '@mui/x-date-pickers';
import React from 'react';
import { DateTime } from 'luxon';
import { Box } from '@mui/material';
import { ORANGE, RED, ULTRA_LIGHT_YELLOW } from '../../../consts/colors';
import Iconify from '../../../components/iconify';

export default function Calendar({
  activeDate,
  setActiveDate,
  disabled,
  setShowCalendar,
}: {
  activeDate: DateTime;
  setActiveDate: (date: DateTime) => void;
  disabled: boolean;
  setShowCalendar: (showCalendar: boolean) => void;
}) {
  return (
    <Box
      sx={{
        mb: 2,
        mt: -1,
        background: ULTRA_LIGHT_YELLOW,
        borderRadius: '12px',
        border: `1px solid ${ORANGE}`,
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          color: RED,
        }}
        onClick={() => setShowCalendar(false)}
      >
        <Iconify
          icon="ph:x-bold"
          width={30}
          sx={{
            cursor: 'pointer',
            opacity: 1,
            mt: 0.31,
            ml: 0.5,
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <Box sx={{ width: '320px' }}>
          <DateCalendar
            value={activeDate}
            onChange={(newValue) => setActiveDate(newValue)}
            disableFuture
            disabled={disabled}
            sx={{ mr: -1 }}
          />
        </Box>
      </Box>
    </Box>
  );
}
