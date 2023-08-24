// @mui
import { Box, CircularProgress } from '@mui/material';
import React, { useContext } from 'react';
import { useStore } from 'zustand';
import { StoreContext } from '../../../hooks/useStore';
import GroupedPeriods from './GroupedPeriods';
import TimeLogsWithinDesiredPeriod from './TimeLogsWithinDesiredPeriod';
import AddTimeLog from '../browse/AddTimeLog';
// utils
// ----------------------------------------------------------------------

export default function BrowseTimeLogs({ showDetails }) {
  const store = useContext(StoreContext);
  const { isSaving } = useStore(store);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isSaving ? (
          <Box
            sx={{
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              mt: 1,
            }}
          >
            <CircularProgress disableShrink size={100} thickness={1.5} />
          </Box>
        ) : (
          <>
            <AddTimeLog />
            {showDetails ? <TimeLogsWithinDesiredPeriod /> : <GroupedPeriods />}
          </>
        )}
      </Box>
    </Box>
  );
}
