import { Box, Typography } from '@mui/material';
import Iconify from '../../../components/iconify';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import React, { useContext } from 'react';
import { DateTime } from 'luxon';
import { Timezones } from '@test1/shared';
import parse from 'html-react-parser';
import { getRandomRgbObjectForSliderPicker } from '../../../utils/colors/getRandomRgbObjectForSliderPicker';
import EditNote from './EditNote';
import { getBackgroundColor } from '../../../utils/colors/getBackgroundColor';
import { StoreContext } from '../../../hooks/useStore';
import { useStore } from 'zustand';

export const Note = ({ category, note }) => {
  const store = useContext(StoreContext);
  const { isSaving, isEditing, setIsEditing, disableHover, user } =
    useStore(store);

  const tomorrow = DateTime.now()
    .setZone(Timezones[user.timezone])
    .plus({ days: 1 });
  const updated = note.updatedAt !== note.createdAt;
  const createdAtLocale = DateTime.fromISO(note.createdAt, {
    zone: Timezones[user.timezone],
  }).toLocaleString(
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
    { locale: 'en' }
  );

  const updatedAtLocale = updated
    ? DateTime.fromISO(note.updatedAt, {
        zone: Timezones[user.timezone],
      }).toLocaleString(
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        },
        { locale: 'en' }
      )
    : undefined;

  const color = category?.color
    ? {
        hex: category.color,
        rgb: getRgbaObjectFromHexString(category.color),
      }
    : getRandomRgbObjectForSliderPicker();

  if (isEditing.noteId === note.id) {
    return <EditNote category={category} note={note} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        background: getBackgroundColor(0.2, color.hex),
        borderRadius: '10px',
        pl: 0,
        m: 0,
        pr: 1.5,
        minHeight: '30px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignContent: 'flex-start',
          gap: '10px',
          borderRadius: '10px',
          border: `solid 1px ${getBackgroundColor(0.2, color.hex)}`,
          flex: 1,
        }}
      >
        <Box sx={{ margin: '6px' }}>
          <Typography
            variant="subtitle2"
            sx={{ color: isSaving ? '#637381' : undefined }}
          >
            {updatedAtLocale ? (
              <>
                {updatedAtLocale}{' '}
                <span style={{ fontWeight: '400' }}>(edited)</span>
              </>
            ) : (
              createdAtLocale
            )}
          </Typography>
          <Box sx={{ display: 'flex', direction: 'column', mb: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', mb: 0, whiteSpace: 'normal' }}
            >
              {parse(note.text.replaceAll(/\n/g, '<br />'))}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', mr: '-12px' }}>
        <Box
          sx={{
            borderRadius: '10px',
            border: `solid 1px ${getBackgroundColor(0.2, color.hex)}`,

            pl: '5px',
            pr: '5px',
            '&:hover': !disableHover &&
              !isSaving && {
                cursor: 'pointer',
                border: `solid 1px ${getBackgroundColor(1, color.hex)}`,
              },
          }}
          onClick={() => !isSaving && setIsEditing({ noteId: note.id })}
        >
          <Iconify
            icon={'fluent:edit-32-regular'}
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '40%',
              transform: 'translate(-40%, -50%)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
