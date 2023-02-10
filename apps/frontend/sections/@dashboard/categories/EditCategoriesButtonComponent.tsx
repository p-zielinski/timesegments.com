import { Card, Grid, Stack, Typography } from '@mui/material';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import Iconify from '../../../components/iconify';
import React from 'react';
import { CategoriesPageMode } from '../../../enum/categoriesPageMode';

export default function EditCategoriesButtonComponent({
  disableHover,
  isSaving,
  setViewMode,
}) {
  return (
    <Grid
      key={'edit_categories_bottom'}
      item
      xs={1}
      sm={1}
      md={1}
      onClick={() => setViewMode(CategoriesPageMode.EDIT)}
    >
      <Card
        sx={{
          cursor: !isSaving && 'pointer',
          color: isSaving && IS_SAVING_HEX,
          border: `solid 2px ${isSaving ? IS_SAVING_HEX : LIGHT_GREEN}`,
          background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_GREEN,
          '&:hover': !disableHover &&
            !isSaving && {
              border: `solid 2px ${GREEN}`,
            },
        }}
      >
        <Iconify
          icon={'material-symbols:edit'}
          width={40}
          sx={{ m: -2, position: 'absolute', bottom: 22, left: 25 }}
        />
        <Stack spacing={2} sx={{ p: 2, ml: 5 }}>
          <Typography variant="subtitle2" noWrap>
            EDIT CATEGORIES
          </Typography>
        </Stack>
      </Card>
    </Grid>
  );
}
