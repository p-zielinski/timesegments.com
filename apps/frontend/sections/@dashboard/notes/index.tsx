import {
  Box,
  Card as CardBlock,
  Card,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import React, { useState } from 'react';
import { AddIsNotOpened } from './Add/IsNotOpened';
import AddIsOpened from './Add/IsOpened';
import {
  GRAY,
  GREEN,
  IS_SAVING_HEX,
  LIGHT_SILVER,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import Iconify from '../../../components/iconify';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import { DateTime } from 'luxon';
import { Timezones } from '@test1/shared';
import SortNotes from './Sort';

export const NotesSection = ({
  controlValue,
  setControlValue,
  user,
  setUser,
  userNotes,
  setUserNotes,
  isSaving,
  setIsSaving,
  disableHover,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const color = {
    hex: '#c4b900',
    rgb: getRgbaObjectFromHexString('#c4b900'),
  };
  const color2 = {
    hex: '#006cc4',
    rgb: getRgbaObjectFromHexString('#006cc4'),
  };

  const note = userNotes.at(-1) || {};
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

  return (
    <>
      <Stack
        direction="row"
        flexWrap="wrap-reverse"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ mt: 1, mb: 1 }}>
          <SortNotes user={user} />
        </Stack>
      </Stack>
      <Grid container spacing={2} columns={1}>
        <Grid key={'edit_categories'} item xs={1} sm={1} md={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isOpen ? (
              <AddIsOpened
                color={color}
                setIsOpen={setIsOpen}
                setIsSaving={setIsSaving}
                isSaving={isSaving}
                disableHover={disableHover}
                userNotes={userNotes}
                setUserNotes={setUserNotes}
              />
            ) : (
              <AddIsNotOpened
                controlValue={controlValue}
                setControlValue={setControlValue}
                user={user}
                setUser={setUser}
                color={color}
                setIsOpen={setIsOpen}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                disableHover={disableHover}
              />
            )}
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
                  onClick={() => !isSaving && null}
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
                  onClick={() => {
                    return;
                  }}
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
                        {createdAt}
                      </Typography>
                      {updated && (
                        <Typography variant="subtitle2">{updatedAt}</Typography>
                      )}
                    </Box>
                    <Typography sx={{ whiteSpace: 'normal' }}>
                      {note.note}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Card>
            <CardBlock
              sx={{
                backgroundColor: SUPER_LIGHT_SILVER,
                border: `solid 2px ${isSaving ? IS_SAVING_HEX : LIGHT_SILVER}`,
                color: isSaving ? IS_SAVING_HEX : GRAY,
                minHeight: 58,
              }}
            >
              <Stack spacing={2} sx={{ p: 2 }}>
                <Typography variant="body2" noWrap>
                  You can see notes only up to 3 days old on this page.
                </Typography>
              </Stack>
            </CardBlock>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
