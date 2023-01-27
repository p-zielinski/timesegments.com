import PropTypes from 'prop-types';
// @mui
import { Box, Card, Typography, Stack, Grid } from '@mui/material';
// utils
import IsActive from '../../../components/is-active/IsActive';
import Iconify from '../../../components/iconify';
import SubcategoryCard from './SubcategoryCard';
import {
  LIGHT_GREEN,
  GREEN,
  LIGHT_RED,
  RED,
  LIGHT_SILVER,
  IS_SAVING_HEX,
} from '../../../consts/colors';
import { getRgbaStringFromHexString } from '../../../utils/getRgbaStringFromHexString';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';
import { getHexFromRGBAObject } from '../../../utils/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../utils/getRgbaObjectFromHexString';
import EditCategory from './EditCategory';
import AddNew from './AddNew';
import { CreateNewType } from '../../../enum/createNewType';
import { CategoriesPageMode } from '../../../enum/categoriesPageMode';
import ShowNoShow from './ShowNoShow';
import { ShowNoShowType } from '../../../enum/showNoShowType';
import React from 'react';
import ShowLimitReached from './ShowLimitReached';
import { ShowLimitReachedType } from '../../../enum/showLimitReachedType';

// ----------------------------------------------------------------------

CategoryCard.propTypes = {
  category: PropTypes.object,
};

export default function CategoryCard({
  category,
  categories,
  setCategories,
  viewMode,
  isEditing,
  setIsEditing,
  isSaving,
  setIsSaving,
  limits,
}) {
  const { active: isActive } = category;

  const reverseExpandSubcategories = () => {
    setCategories(
      [...categories].map((_category) => {
        if (_category.id === category.id) {
          return {
            ..._category,
            expandSubcategories: !_category.expandSubcategories,
          };
        }
        return { ..._category };
      })
    );
  };

  const getVisibleSubcategories = (category, categories) => {
    return (
      categories
        .find((_category) => _category.id === category.id)
        ?.subcategories?.filter((subcategory) =>
          viewMode === CategoriesPageMode.EDIT ? true : subcategory.visible
        ) || []
    );
  };

  const getCategory = (category, categories) => {
    return categories.find((_category) => _category.id === category.id) || {};
  };

  const changeCategoryVisibility = () => {
    return;
  };

  const setCategoryAsActive = () => {
    return;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {isEditing.categoryId === category.id &&
      viewMode === CategoriesPageMode.EDIT ? (
        <EditCategory
          categories={categories}
          setCategories={setCategories}
          category={category}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
        />
      ) : (
        <Card>
          <Box sx={{ display: 'flex' }}>
            {viewMode === CategoriesPageMode.EDIT && (
              <>
                <Box
                  sx={{
                    width: `60px`,
                    minWidth: '60px',
                    p: 2,
                    color: isSaving
                      ? IS_SAVING_HEX
                      : category.visible
                      ? GREEN
                      : RED,
                    background: `white`,
                    border: `solid 2px ${LIGHT_SILVER}`,
                    borderRight: `0px`,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    cursor: !isSaving && 'pointer',
                    '&:hover': !isSaving && {
                      color: !category.visible ? GREEN : RED,
                      background: LIGHT_SILVER,
                    },
                  }}
                  onClick={() => !isSaving && changeCategoryVisibility()}
                >
                  <Iconify
                    icon={
                      category.visible
                        ? 'gridicons:visible'
                        : 'gridicons:not-visible'
                    }
                    width={40}
                    sx={{ m: -2, position: 'absolute', bottom: 34, left: 27 }}
                  />
                </Box>
                <Box
                  sx={{
                    width: `60px`,
                    minWidth: '60px',
                    p: 2,
                    color: isSaving ? IS_SAVING_HEX : GREEN,
                    background: `white`,
                    borderTop: `solid 2px ${LIGHT_SILVER}`,
                    borderBottom: `solid 2px ${LIGHT_SILVER}`,
                    cursor: !isSaving && 'pointer',
                    '&:hover': !isSaving && {
                      background: LIGHT_SILVER,
                    },
                  }}
                  onClick={() =>
                    !isSaving &&
                    setIsEditing({
                      subcategoryId: undefined,
                      categoryId: category.id,
                      createNew: undefined,
                    })
                  }
                >
                  <Iconify
                    icon={'material-symbols:edit'}
                    width={40}
                    sx={{ m: -2, position: 'absolute', bottom: 34, left: 88 }}
                  />
                </Box>
              </>
            )}
            <Box
              sx={{
                color: isSaving && IS_SAVING_HEX,
                background: isActive
                  ? getRgbaStringFromHexString(
                      isSaving ? IS_SAVING_HEX : category?.color,
                      0.3
                    )
                  : getRepeatingLinearGradient(
                      isSaving ? IS_SAVING_HEX : category?.color,
                      0.3
                    ),
                flex: 1,
                border: isSaving
                  ? `solid 2px ${IS_SAVING_HEX}`
                  : viewMode === CategoriesPageMode.EDIT
                  ? `solid 2px ${getHexFromRGBAObject({
                      ...getRgbaObjectFromHexString(category?.color),
                      a: 0.3,
                    })}`
                  : isActive
                  ? `solid 2px ${LIGHT_GREEN}`
                  : `solid 2px ${LIGHT_RED}`,
                borderLeft:
                  viewMode === CategoriesPageMode.EDIT
                    ? `0px`
                    : isSaving
                    ? `solid 2px ${IS_SAVING_HEX}`
                    : isActive
                    ? `solid 2px ${LIGHT_GREEN}`
                    : `solid 2px ${LIGHT_RED}`,
                borderRight: 0,
                borderTopLeftRadius:
                  viewMode === CategoriesPageMode.EDIT ? 0 : 12,
                borderBottomLeftRadius:
                  viewMode === CategoriesPageMode.EDIT ? 0 : 12,
                cursor:
                  !isSaving &&
                  viewMode === CategoriesPageMode.EDIT &&
                  'pointer',
                '&:hover': !isSaving && {
                  background:
                    viewMode === CategoriesPageMode.EDIT
                      ? getRepeatingLinearGradient(category?.color, 0.3)
                      : isActive
                      ? LIGHT_RED
                      : LIGHT_GREEN,
                  border:
                    viewMode === CategoriesPageMode.EDIT
                      ? `solid 2px ${getHexFromRGBAObject({
                          ...getRgbaObjectFromHexString(category?.color),
                          a: 0.3,
                        })}`
                      : !isActive
                      ? `solid 2px ${LIGHT_GREEN}`
                      : `solid 2px ${LIGHT_RED}`,
                  borderLeft:
                    viewMode === CategoriesPageMode.EDIT
                      ? 0
                      : !isActive
                      ? `solid 2px ${LIGHT_GREEN}`
                      : `solid 2px ${LIGHT_RED}`,
                  borderRight: 0,
                },
              }}
              onClick={() => !isSaving && setCategoryAsActive}
            >
              <Stack
                spacing={1}
                sx={{ p: 3 }}
                direction="row"
                alignItems="center"
                justifyContent="left"
              >
                <IsActive
                  isActive={getCategory(category, categories)?.active}
                  isSaving={isSaving}
                />
                <Typography variant="subtitle2" noWrap>
                  {getCategory(category, categories)?.name}
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                width: `60px`,
                p: 2,
                color: isSaving
                  ? IS_SAVING_HEX
                  : !getCategory(category, categories)?.expandSubcategories
                  ? GREEN
                  : RED,
                background: `white`,
                border: `solid 2px ${LIGHT_SILVER}`,
                borderLeft: `0px`,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                cursor: !isSaving && 'pointer',
                '&:hover': !isSaving && {
                  borderLeft: `0px`,
                  background: LIGHT_SILVER,
                },
              }}
              onClick={() =>
                !isSaving && reverseExpandSubcategories(category, categories)
              }
            >
              <Iconify
                icon={
                  getCategory(category, categories)?.expandSubcategories
                    ? 'eva:chevron-up-fill'
                    : 'eva:chevron-down-fill'
                }
                width={50}
                sx={{ m: -2, position: 'absolute', bottom: 27, right: 20 }}
              />
            </Box>
          </Box>
        </Card>
      )}

      {getCategory(category, categories)?.expandSubcategories ||
      getVisibleSubcategories(category, categories).filter(
        (subcategory) => subcategory.active
      ).length ? (
        <Grid container spacing={2} columns={12}>
          <Grid key={'edit_categories'} item xs={1} sm={1} md={1}></Grid>
          <Grid item xs={11} sm={11} md={11}>
            <Box
              sx={{
                flex: 1,
              }}
            >
              {getCategory(category, categories)?.expandSubcategories ? (
                <>
                  {getVisibleSubcategories(category, categories) ||
                  viewMode === CategoriesPageMode.EDIT ? (
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      {getVisibleSubcategories(category, categories).length ||
                      viewMode === CategoriesPageMode.EDIT ? (
                        getVisibleSubcategories(category, categories).map(
                          (subcategory) => (
                            <SubcategoryCard
                              key={subcategory.id}
                              subcategory={subcategory}
                              categories={categories}
                              setCategories={setCategories}
                              isEditing={isEditing}
                              setIsEditing={setIsEditing}
                              viewMode={viewMode}
                              isSaving={isSaving}
                              setIsSaving={setIsSaving}
                            />
                          )
                        )
                      ) : (
                        <Card
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.11)',
                            border: `solid 2px rgba(0,0,0,0.02)`,
                          }}
                        >
                          <Stack spacing={2} sx={{ p: 2 }}>
                            <Typography variant="subtitle3" noWrap>
                              No subcategories to display
                            </Typography>
                          </Stack>
                        </Card>
                      )}
                      {viewMode === CategoriesPageMode.EDIT && (
                        <>
                          {category.subcategories.length <
                          limits.subcategoriesLimit ? (
                            <AddNew
                              type={CreateNewType.SUBCATEGORY}
                              data={{ categoryId: category.id }}
                              isEditing={isEditing}
                              setIsEditing={setIsEditing}
                              category={category}
                              isSaving={isSaving}
                              setIsSaving={setIsSaving}
                            />
                          ) : (
                            <ShowLimitReached
                              type={ShowLimitReachedType.SUBCATEGORIES}
                            />
                          )}
                        </>
                      )}
                    </Box>
                  ) : undefined}
                </>
              ) : viewMode === CategoriesPageMode.EDIT ||
                getVisibleSubcategories(category, categories).filter(
                  (subcategory) => subcategory.active
                ).length ? (
                getVisibleSubcategories(category, categories)
                  .filter((subcategory) => subcategory.active)
                  .map((subcategory) => (
                    <>
                      <SubcategoryCard
                        key={subcategory.id}
                        subcategory={subcategory}
                        categories={categories}
                        setCategories={setCategories}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        viewMode={viewMode}
                        isSaving={isSaving}
                        setIsSaving={setIsSaving}
                      />
                    </>
                  ))
              ) : (
                <ShowNoShow type={ShowNoShowType.SUBCATEGORIES} />
              )}
            </Box>
          </Grid>
        </Grid>
      ) : undefined}
    </Box>
  );
}
