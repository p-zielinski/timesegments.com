// @mui
import {Box, Grid, Stack} from '@mui/material';
import Category from './Category';
import React, {useContext} from 'react';
import AddCategory from './AddCategory';
import SortCategories from './Sort';
import {Helmet} from 'react-helmet-async';
import CategoryNotesCards from './CategoryNotesCards';
import {StoreContext} from '../../../hooks/useStore';
import {useStore} from 'zustand';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function Categories() {
  const store = useContext(StoreContext);
  const { limits, categories, key, groupedTimeLogPeriods } = useStore(store);

  const categoriesLimit = limits?.categoriesLimit || 5;

  return (
    <>
      <Helmet>
        <title>Categories</title>
      </Helmet>
      <Grid container spacing={2} columns={1} sx={{ mt: 1 }}>
        {JSON.stringify(groupedTimeLogPeriods)}
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
