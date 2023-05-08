import { Box, Card as CardBlock, Grid, Stack, Typography } from '@mui/material';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import React, { useState } from 'react';
import { AddIsNotOpened } from './Add/IsNotOpened';
import AddIsOpened from './Add/IsOpened';
import {
  GRAY,
  IS_SAVING_HEX,
  LIGHT_SILVER,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import SortNotes from './Sort';
import { Note } from './Note';

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
  const [editing, setEditing] = useState({
    isEditing: undefined,
    isDeleting: false,
  });

  const color = {
    hex: '#c4b900',
    rgb: getRgbaObjectFromHexString('#c4b900'),
  };
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
            {editing?.isEditing === 'new' ? (
              <AddIsOpened
                color={color}
                setEditing={setEditing}
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
                setEditing={setEditing}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                disableHover={disableHover}
              />
            )}
            {userNotes.map((note) => (
              <Note
                userNotes={userNotes}
                setUserNotes={setUserNotes}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                editing={editing}
                setEditing={setEditing}
                disableHover={disableHover}
                note={note}
                user={user}
              />
            ))}
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
