import PropTypes from 'prop-types';
// @mui
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import CategoryCard from './CategoryCard';
import Iconify from '../../../components/iconify';
import { LIGHT_GREEN, GREEN, LIGHT_RED, RED } from '../../../consts/colors';
import React from 'react';
import AddNew from './AddNew';
import { CategoriesPageMode } from '../../../enum/categoriesPageMode';
import { CreateNewType } from '../../../enum/createNewType';

// ----------------------------------------------------------------------

CategoryList.propTypes = {
  categories: PropTypes.array.isRequired,
  setCategories: PropTypes.func.isRequired,
  isEditing: PropTypes.object.isRequired,
  setIsEditing: PropTypes.func.isRequired,
};

export default function CategoryList({
  categories,
  setCategories,
  mode,
  setMode,
  isEditing,
  setIsEditing,
  ...other
}) {
  const getCategories = (categories) => {
    return categories.filter((category) =>
      isEditing ? category.visible : true
    );
  };

  return (
    <>
      <Grid container spacing={2} {...other} columns={1}>
        {mode === CategoriesPageMode.EDIT && (
          <Grid key={'edit_categories'} item xs={1} sm={1} md={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.11)',
                  cursor: 'pointer',
                  border: `solid 2px ${LIGHT_RED}`,
                  background: LIGHT_RED,
                  '&:hover': {
                    border: `solid 2px ${RED}`,
                  },
                }}
                onClick={() => setMode(CategoriesPageMode.VIEW)}
              >
                <Iconify
                  icon={'mdi:cancel-bold'}
                  width={42}
                  sx={{ m: -2, position: 'absolute', bottom: 22, left: 22 }}
                />
                <Stack spacing={2} sx={{ p: 2, ml: 5 }}>
                  <Typography variant="subtitle2" noWrap>
                    STOP EDITING CATEGORIES
                  </Typography>
                </Stack>
              </Card>
              <AddNew type={CreateNewType.CATEGORY} />
            </Box>
          </Grid>
        )}
        {getCategories(categories).length
          ? getCategories(categories).map((category) => (
              <Grid key={category.id} item xs={1} sm={1} md={1}>
                <CategoryCard
                  mode={mode}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  category={category}
                  categories={categories}
                  setCategories={setCategories}
                />
              </Grid>
            ))
          : !isEditing && (
              <Grid key={'no_category_to_show'} item xs={1} sm={1} md={1}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex' }}>
                    <Box
                      sx={{
                        width: `100px`,
                      }}
                    ></Box>
                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Card
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.11)',
                          border: `solid 2px rgba(0,0,0,0.02)`,
                        }}
                      >
                        <Stack spacing={2} sx={{ p: 2 }}>
                          <Typography variant="subtitle3" noWrap>
                            No categories to display
                          </Typography>
                        </Stack>
                      </Card>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}
        {mode === CategoriesPageMode.VIEW && (
          <Grid
            key={'edit_categories'}
            item
            xs={1}
            sm={1}
            md={1}
            onClick={() => setMode(CategoriesPageMode.EDIT)}
          >
            <Card
              sx={{
                backgroundColor: 'rgba(0,0,0,0.11)',
                cursor: 'pointer',
                border: `solid 2px ${LIGHT_GREEN}`,
                background: LIGHT_GREEN,
                '&:hover': {
                  border: `solid 2px ${GREEN}`,
                },
              }}
            >
              <Iconify
                icon={'material-symbols:edit'}
                width={40}
                sx={{ m: -2, position: 'absolute', bottom: 25, left: 25 }}
              />
              <Stack spacing={2} sx={{ p: 2, ml: 5 }}>
                <Typography variant="subtitle2" noWrap>
                  EDIT CATEGORIES
                </Typography>
              </Stack>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  );
}