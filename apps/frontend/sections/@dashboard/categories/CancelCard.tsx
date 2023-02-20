import { Card, Grid, Stack, Typography } from '@mui/material';
import {
  IS_SAVING_HEX,
  LIGHT_RED,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import Iconify from '../../../components/iconify';
import React, { useEffect, useState } from 'react';
import { handleFetch } from '../../../utils/handleFetch';
import { StatusCodes } from 'http-status-codes';

export default function CancelCard({
  controlValue,
  setControlValue,
  disableHover,
  isSaving,
  setIsSaving,
  categories,
  setCategories,
}) {
  const [activeCategory, setActiveCategory] = useState(undefined);

  useEffect(() => {
    setActiveCategory(categories.find((category) => category.active));
  }, [categories.find((category) => category.active)?.id]);

  const handleCancelActive = async () => {
    if (!activeCategory) {
      return;
    }
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/cancel-all-active',
      body: {
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setCategories(
        categories.map((category) => {
          return {
            ...category,
            subcategories: (category.subcategories ?? []).map((subcategory) => {
              return { ...subcategory, active: false };
            }),
            active: false,
          };
        })
      );
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
  };

  return (
    <Grid key={'cancel_active'} item xs={1} sm={1} md={1}>
      <Card
        sx={{
          p: 2,
          cursor: !isSaving && !!activeCategory && 'pointer',
          minHeight: 54,
          color: (isSaving || !activeCategory) && IS_SAVING_HEX,
          background:
            isSaving || !activeCategory ? SUPER_LIGHT_SILVER : LIGHT_RED,
          border: `solid 2px  ${
            isSaving || !activeCategory ? IS_SAVING_HEX : LIGHT_RED
          }`,
          '&:hover': !disableHover &&
            !!activeCategory &&
            !isSaving && {
              border: `solid 2px  ${RED}`,
            },
        }}
        onClick={() => handleCancelActive()}
      >
        <Iconify
          icon={'mdi:cancel-bold'}
          width={50}
          sx={{
            m: -2,
            position: 'absolute',
            bottom: 18,
            left: 20,
          }}
        />
        <Stack spacing={2} sx={{ ml: 5 }}>
          <Typography variant="subtitle2" noWrap>
            CANCEL ACTIVE
          </Typography>
        </Stack>
      </Card>
    </Grid>
  );
}
