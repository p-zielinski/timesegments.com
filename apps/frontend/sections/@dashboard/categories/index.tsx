// @mui
import {Box, Grid, Stack} from '@mui/material';
import Category from './Category';
import React from 'react';
import AddCategory from './AddCategory';
import SortCategories from './Sort';
import {Helmet} from 'react-helmet-async';
import CategoryNotesCards from './CategoryNotesCards'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function Categories({ useStore }) {
  const { limits, categories } = useStore();

  const categoriesLimit = limits?.categoriesLimit || 5;

  return (
    <>
      <Helmet>
        <title>Categories</title>
      </Helmet>
      <Grid container spacing={2} columns={1} sx={{ mt: 1 }}>
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
              <SortCategories useStore={useStore} />
            </Stack>
          </Stack>
        </Grid>

        {categories.map((category) => (
          <Grid key={category.id} item xs={1} sm={1} md={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Category category={category} useStore={useStore} />
              <CategoryNotesCards category={category} useStore={useStore} />
            </Box>
          </Grid>
        ))}
        {categoriesLimit > categories.length && (
          <Grid key={'new category'} item xs={1} sm={1} md={1}>
            <AddCategory useStore={useStore} />
          </Grid>
        )}
      </Grid>
    </>
  );
}
