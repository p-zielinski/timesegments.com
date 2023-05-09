import { Box, Card, Stack, Typography } from '@mui/material';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_RED,
  LIGHT_SILVER,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import Iconify from '../../../components/iconify';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import React from 'react';
import { DateTime } from 'luxon';
import { Timezones } from '@test1/shared';
import EditNote from './EditNote';
import { getRepeatingLinearGradient } from '../../../utils/colors/getRepeatingLinearGradient';
import { getHexFromRGBAString } from '../../../utils/colors/getHexFromRGBString';
import { handleFetch } from '../../../utils/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { useRouter } from 'next/router';

export const Note = ({
  controlValue,
  setControlValue,
  userNotes,
  setUserNotes,
  isSaving,
  setIsSaving,
  editing,
  setEditing,
  disableHover,
  note,
  user,
}) => {
  const router = useRouter();
  const updated = note.updatedAt !== note.createdAt;
  const createdAt = DateTime.fromISO(note.createdAt, {
    zone: Timezones[user.timezone],
  }).toLocaleString({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const updatedAt = updated
    ? DateTime.fromISO(note.updatedAt, {
        zone: Timezones[user.timezone],
      }).toLocaleString({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : undefined;

  const color2 = {
    hex: '#006cc4',
    rgb: getRgbaObjectFromHexString('#006cc4'),
  };
  const { favorite } = note;

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
      setUserNotes(
        userNotes.filter((currentNote) => currentNote.id !== noteId)
      );
      setEditing({
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

  if (editing.isEditing === note.id && editing.isDeleting === false) {
    return (
      <EditNote
        key={note.id}
        controlValue={controlValue}
        setControlValue={setControlValue}
        note={note}
        userNotes={userNotes}
        setUserNotes={setUserNotes}
        disableHover={disableHover}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        setEditing={setEditing}
        color={color2}
      />
    );
  }

  const isDeleting =
    editing.isEditing === note.id && editing.isDeleting === true;

  if (isDeleting) {
    return (
      <Card>
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: `60px`,
              minWidth: '60px',
              p: 2,
              color: isSaving ? IS_SAVING_HEX : GREEN,
              background: isSaving ? SUPER_LIGHT_SILVER : 'white',
              border: `solid 2px ${LIGHT_SILVER}`,
              borderRight: `0px`,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              cursor: !isSaving && 'pointer',
              '&:hover': !disableHover &&
                !isSaving && {
                  borderRight: `0px`,
                  borderStyle: 'dashed',
                  borderColor: GREEN,
                },
            }}
            onClick={() =>
              !isSaving &&
              setEditing({
                isEditing: undefined,
                isDeleting: false,
              })
            }
          >
            <Iconify
              icon={'mdi:cancel-bold'}
              width={40}
              sx={{
                position: 'relative',
                top: '50%',
                left: '42%',
                transform: 'translate(-40%, -50%)',
              }}
            />
          </Box>
          <Box
            sx={{
              color: isSaving && IS_SAVING_HEX,
              background: getRepeatingLinearGradient(
                isSaving ? IS_SAVING_HEX : getHexFromRGBAString(RED),
                0.3,
                45,
                false
              ),
              flex: 1,
              border: isSaving
                ? `solid 2px ${IS_SAVING_HEX}`
                : `solid 2px ${LIGHT_RED}`,
              borderLeft: 0,
              borderRight: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            onClick={() => !isSaving && null}
          >
            <Stack
              spacing={1}
              sx={{ p: 3 }}
              direction="column"
              alignItems="left"
              justifyContent="left"
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    textDecoration: 'none',
                    fontSize: 14,
                    mb: 3,
                  }}
                >
                  Do you want to delete?
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    textDecoration: updated ? 'line-through' : 'none',
                    fontSize: updated ? 12 : undefined,
                  }}
                >
                  {updated ? '' : favorite ? '❤️ ' : ''}
                  {createdAt}
                </Typography>
                {updated && (
                  <Typography variant="subtitle2">
                    {favorite ? '❤️ ' : ''}
                    {updatedAt}
                  </Typography>
                )}
              </Box>
              <Typography sx={{ whiteSpace: 'normal' }}>{note.note}</Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              width: `61px`,
              p: 2,
              color: isSaving ? IS_SAVING_HEX : RED,
              background: `white`,
              border: `solid 2px ${LIGHT_SILVER}`,
              borderLeft: `0px`,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              cursor: !isSaving && 'pointer',
              '&:hover': !disableHover &&
                !isSaving && {
                  borderStyle: 'dashed',
                  borderLeft: `0px`,
                  borderColor: RED,
                },
            }}
            onClick={() => !isSaving && deleteNote(note.id)}
          >
            <Iconify
              icon={'material-symbols:delete-forever-rounded'}
              width={40}
              sx={{
                position: 'relative',
                top: '50%',
                left: '38%',
                transform: 'translate(-40%, -50%)',
              }}
            />
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ display: 'flex' }}>
        <Box
          sx={{
            width: `60px`,
            minWidth: '60px',
            p: 2,
            color: isSaving ? IS_SAVING_HEX : GREEN,
            background: isSaving ? SUPER_LIGHT_SILVER : `white`,
            border: `solid 2px ${LIGHT_SILVER}`,
            borderRight: `0px`,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            cursor: !isSaving && 'pointer',
            '&:hover': !disableHover && !isSaving && {},
          }}
          onClick={() =>
            !isSaving &&
            setEditing({
              isEditing: note.id,
              isDeleting: false,
            })
          }
        >
          <Iconify
            icon={'material-symbols:edit'}
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-40%, -50%)',
            }}
          />
        </Box>
        <Box
          sx={{
            width: `60px`,
            minWidth: '60px',
            p: 2,
            color: isSaving ? IS_SAVING_HEX : RED,
            background: isSaving ? SUPER_LIGHT_SILVER : `white`,
            borderTop: `solid 2px ${LIGHT_SILVER}`,
            borderBottom: `solid 2px ${LIGHT_SILVER}`,
            cursor: !isSaving && 'pointer',
            '&:hover': !disableHover &&
              !isSaving && {
                borderTop: `solid 2px ${LIGHT_SILVER}`,
                borderBottom: `solid 2px ${LIGHT_SILVER}`,
              },
          }}
          onClick={() =>
            !isSaving &&
            setEditing({
              isEditing: note.id,
              isDeleting: true,
            })
          }
        >
          <Iconify
            icon={'material-symbols:delete-forever-rounded'}
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </Box>
        <Box
          sx={{
            color: isSaving && IS_SAVING_HEX,
            background: isSaving
              ? SUPER_LIGHT_SILVER
              : getHexFromRGBAObject({
                  ...color2.rgb,
                  a: 0.1,
                }),
            flex: 1,
            height: 'auto',
            border: isSaving
              ? `solid 2px ${getHexFromRGBAObject({
                  ...getRgbaObjectFromHexString(IS_SAVING_HEX),
                  a: 0.5,
                })}`
              : `solid 2px ${getHexFromRGBAObject({
                  ...color2.rgb,
                  a: 0.3,
                })}`,
            borderLeft: 0,
            borderRadius: '12px',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <Stack
            spacing={1}
            sx={{ p: 3 }}
            direction="column"
            alignItems="left"
            justifyContent="left"
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  textDecoration: updated ? 'line-through' : 'none',
                  fontSize: updated ? 12 : undefined,
                }}
              >
                {updated ? '' : favorite ? '💙 ' : ''}
                {createdAt}
              </Typography>
              {updated && (
                <Typography variant="subtitle2">
                  {favorite ? '💙 ' : ''}
                  {updatedAt}
                </Typography>
              )}
            </Box>
            <Typography sx={{ whiteSpace: 'normal' }}>{note.note}</Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};
