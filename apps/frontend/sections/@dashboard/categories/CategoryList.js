import PropTypes from 'prop-types';
// @mui
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import CategoryCard from './CategoryCard';
import Iconify from '../../../components/iconify';
import {
  LIGHT_GREEN,
  GREEN,
  LIGHT_RED,
  RED,
  IS_SAVING_HEX,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import React from 'react';
import AddNew from './AddNew';
import { CategoriesPageMode } from '../../../enum/categoriesPageMode';
import { CreateNewType } from '../../../enum/createNewType';
import ShowNoShow from './ShowNoShow';
import { ShowNoShowType } from '../../../enum/showNoShowType';
import ShowLimitReached from './ShowLimitReached';
import { ShowLimitReachedType } from '../../../enum/showLimitReachedType';

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
  viewMode,
  setViewMode,
  isEditing,
  setIsEditing,
  isSaving,
  setIsSaving,
  limits,
}) {
  const getCategories = (categories) => {
    return categories.filter((category) =>
      isEditing ? category.visible : true
    );
  };

  return (
    <>
      <Grid container spacing={2} columns={1}>
        {viewMode === CategoriesPageMode.EDIT && (
          <Grid key={'edit_categories'} item xs={1} sm={1} md={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                sx={{
                  backgroundColor: isSaving
                    ? IS_SAVING_HEX
                    : 'rgba(0,0,0,0.11)',
                  cursor: !isSaving && 'pointer',
                  color: isSaving && IS_SAVING_HEX,
                  border: `solid 2px ${isSaving ? IS_SAVING_HEX : LIGHT_RED}`,
                  background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED,
                  '&:hover': !isSaving && {
                    border: `solid 2px ${RED}`,
                  },
                }}
                onClick={() =>
                  !isSaving && setViewMode(CategoriesPageMode.VIEW)
                }
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
              {categories.length < limits.categoriesLimit ? (
                <AddNew
                  type={CreateNewType.CATEGORY}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  isSaving={isSaving}
                  setIsSaving={setIsSaving}
                />
              ) : (
                <ShowLimitReached type={ShowLimitReachedType.CATEGORIES} />
              )}
            </Box>
          </Grid>
        )}
        {getCategories(categories).length
          ? getCategories(categories).map((category) => (
              <Grid key={category.id} item xs={1} sm={1} md={1}>
                <CategoryCard
                  viewMode={viewMode}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  category={category}
                  categories={categories}
                  setCategories={setCategories}
                  isSaving={isSaving}
                  setIsSaving={setIsSaving}
                  limits={limits}
                />
              </Grid>
            ))
          : !isEditing && (
              <ShowNoShow
                type={ShowNoShowType.CATEGORIES}
                isSaving={isSaving}
              />
            )}
        {viewMode === CategoriesPageMode.VIEW && (
          <Grid
            key={'edit_categories'}
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
                '&:hover': !isSaving && {
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
        )}
      </Grid>
    </>
  );
}
