import { Box, Typography } from '@mui/material';
import { IS_SAVING_HEX } from '../../../consts/colors';
import Iconify from '../../../components/iconify';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import React from 'react';
import { DateTime } from 'luxon';
import { Timezones } from '@test1/shared';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { useRouter } from 'next/router';
import parse from 'html-react-parser';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRandomRgbObjectForSliderPicker } from '../../../utils/colors/getRandomRgbObjectForSliderPicker';

export const Note = ({
  controlValue,
  setControlValue,
  isSaving,
  setIsSaving,
  isEditing,
  setIsEditing,
  disableHover,
  note,
  user,
}) => {
  const tomorrow = DateTime.now()
    .setZone(Timezones[user.timezone])
    .plus({ days: 1 });
  const endOfDate = DateTime.fromObject(
    {
      month: tomorrow.month,
      year: tomorrow.year,
      day: tomorrow.day,
      hour: 0,
      minute: 0,
      second: 0,
    },
    { zone: Timezones[user.timezone] }
  );
  const router = useRouter();
  const updated = note.updatedAt !== note.createdAt;
  const createdAt = DateTime.fromISO(note.createdAt, {
    zone: Timezones[user.timezone],
  });
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

  const color = note?.category?.color
    ? {
        hex: note.category.color,
        rgb: getRgbaObjectFromHexString(note.category.color),
      }
    : getRandomRgbObjectForSliderPicker();

  const deleteNote = async (noteId) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'note/delete',
      body: {
        noteId,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setIsEditing({
        isEditing: undefined,
        isDeleting: false,
      });
      if (response.cotrolValue) {
        setControlValue(response.cotrolValue);
      }
    } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
      return router.push('/');
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined); //skip setting isSaving(false)
      return;
    }
    setIsSaving(false);
    return;
  };

  const getBackgroundColor = (alpha) =>
    getHexFromRGBAObject(
      getRgbaObjectFromHexString(
        isSaving
          ? IS_SAVING_HEX
          : getHexFromRGBAObject(
              getColorShadeBasedOnSliderPickerSchema(
                getRgbaObjectFromHexString(color.hex),
                'bright'
              )
            ),
        alpha
      )
    );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        background: getBackgroundColor(0.2),
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
          border: `solid 1px ${getBackgroundColor(0.2)}`,
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
                {updatedAtLocale}
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
            border: `solid 1px ${getBackgroundColor(0.2)}`,

            pl: '5px',
            pr: '5px',
            '&:hover': !disableHover &&
              !isSaving && {
                cursor: 'pointer',
                border: `solid 1px ${getBackgroundColor(1)}`,
              },
          }}
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
