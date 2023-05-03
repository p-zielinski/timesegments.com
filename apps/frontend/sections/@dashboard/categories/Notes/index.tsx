import { Grid } from '@mui/material';
import { getRgbaObjectFromHexString } from '../../../../utils/colors/getRgbaObjectFromHexString';
import React, { useState } from 'react';
import { AddIsNotOpened } from './Add/IsNotOpened';
import AddIsOpened from './Add/IsOpened';

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

  return (
    <Grid container spacing={2} columns={1}>
      <Grid key={'edit_categories'} item xs={1} sm={1} md={1} sx={{ mb: 2 }}>
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
            userNotes={userNotes}
            color={color}
            setIsOpen={setIsOpen}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            disableHover={disableHover}
          />
        )}
      </Grid>
    </Grid>
  );
};
