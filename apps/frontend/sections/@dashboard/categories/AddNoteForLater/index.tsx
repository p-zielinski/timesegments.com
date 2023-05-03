import { Grid } from '@mui/material';
import { getRgbaObjectFromHexString } from '../../../../utils/colors/getRgbaObjectFromHexString';
import React, { useState } from 'react';
import { IsNotOpened } from './IsNotOpened';
import IsOpened from './IsOpened';

export const AddNoteForLater = ({ isSaving, disableHover, setIsSaving }) => {
  const [isOpen, setIsOpen] = useState(false);
  //   hex: '#c800d9',
  const [color] = useState({
    hex: '#c4b900',
    rgb: getRgbaObjectFromHexString('#c4b900'),
  });

  return (
    <Grid container spacing={2} columns={1}>
      <Grid key={'edit_categories'} item xs={1} sm={1} md={1} sx={{ mb: 2 }}>
        {isOpen ? (
          <IsOpened
            color={color}
            setIsOpen={setIsOpen}
            setIsSaving={setIsSaving}
            isSaving={isSaving}
            disableHover={disableHover}
          />
        ) : (
          <IsNotOpened
            color={color}
            setIsOpen={setIsOpen}
            isSaving={isSaving}
            disableHover={disableHover}
          />
        )}
      </Grid>
    </Grid>
  );
};
