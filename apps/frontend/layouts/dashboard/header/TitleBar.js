// @mui
import { Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { StoreContext } from '../../../hooks/useStore';
import { useStore } from 'zustand';
import { DARK_RED } from '../../../consts/colors';
import { DateTime } from 'luxon';
import { getNumberOfMsInDesiredNumberOfDays, Timezones } from '@test1/shared';

export default function TitleBar({ title }) {
  const store = useContext(StoreContext);
  const { user } = useStore(store);
  return (
    <Box sx={{ color: 'black' }} variant="h4">
      <Typography variant="h4">{title}</Typography>
      {!user?.email && (
        <Typography variant="subtitle2" sx={{ color: DARK_RED }}>
          If unclaimed, this account will be deleted:{' '}
          {DateTime.fromMillis(
            new Date(user.createdAt).getTime() +
              getNumberOfMsInDesiredNumberOfDays(3)
          )
            .setZone(Timezones[user.timezone])
            .toLocaleString(DateTime.DATETIME_SHORT)}
        </Typography>
      )}
    </Box>
  );
}
