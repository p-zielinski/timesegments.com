// @mui
import {Box, Grid, Stack} from '@mui/material';
import Category from './Category';
import React, {useContext, useEffect} from 'react';
import AddCategory from './AddCategory';
import SortCategories from './Sort';
import {Helmet} from 'react-helmet-async';
import CategoryNotesCards from './CategoryNotesCards';
import {StoreContext} from '../../../hooks/useStore';
import {useStore} from 'zustand';
import {handleFetch} from '../../../utils/fetchingData/handleFetch';
import {StatusCodes} from 'http-status-codes';
import {isObject} from 'lodash';
import {ControlValue} from '@test1/shared';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function Categories() {
  const store = useContext(StoreContext);
  const {
    limits,
    categories,
    isSaving,
    setIsSaving,
    handleIncorrectControlValues,
    controlValues,
  } = useStore(store);

  const checkControlValues = async () => {
    const response = await handleFetch({
      pathOrUrl: 'user/me-extended',
      body: {
        extend: [],
      },
      method: 'POST',
    });
    if (
      isSaving ||
      response.statusCode !== StatusCodes.CREATED ||
      !isObject(response.controlValues)
    ) {
      return;
    }
    const newControlValues: ControlValue[] = response.controlValues;
    const typesOfControlValuesWithIncorrectValues: ControlValue[] = [];
    Object.keys(controlValues).forEach((key: ControlValue) => {
      if (controlValues[key] !== newControlValues[key]) {
        typesOfControlValuesWithIncorrectValues.push(key);
      }
    });
    if (typesOfControlValuesWithIncorrectValues.length > 0) {
      setIsSaving(true);
      handleIncorrectControlValues(typesOfControlValuesWithIncorrectValues);
    }
    return;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkControlValues();
    }, 2 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [controlValues]);

  const categoriesLimit = limits?.categoriesLimit || 5;

  return (
    <>
      <Helmet>
        <title>Categories</title>
      </Helmet>
      <Grid
        container
        spacing={2}
        columns={1}
        sx={{
          mt: 1,
          filter: isSaving
            ? `saturate(.3) brightness(1.2) contrast(.85)`
            : undefined,
        }}
      >
        <Grid key={'sort-categories'} item xs={1} sm={1} md={1}>
          <Stack
            direction="row"
            flexWrap="wrap-reverse"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Stack
              direction="row"
              spacing={1}
              flexShrink={0}
              sx={{ mt: -1, mb: -1 }}
            >
              <SortCategories />
            </Stack>
          </Stack>
        </Grid>

        {categories.map((category) => (
          <Grid key={category.id} item xs={1} sm={1} md={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Category category={category} />
              <CategoryNotesCards category={category} />
            </Box>
          </Grid>
        ))}
        {categoriesLimit > categories.length && (
          <Grid key={'new category'} item xs={1} sm={1} md={1}>
            <AddCategory />
          </Grid>
        )}
      </Grid>
    </>
  );
}
