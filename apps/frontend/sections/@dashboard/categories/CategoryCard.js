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
  SUPER_LIGHT_SILVER,
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
import { getHexFromRGBObject } from '../../../utils/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/getColorShadeBasedOnSliderPickerSchema';
import { handleFetch } from '../../../utils/handleFetch';

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
  const doesAnySubcategoryWithinCurrentCategoryActive =
    !!category.subcategories.find((subcategory) => subcategory.active);

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

  const changeCategoryVisibility = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/change-visibility',
      body: { categoryId: category.id, visible: !category.visible },
      method: 'POST',
    });
    if (response.statusCode === 201 && response?.category) {
      setCategories(
        categories.map((category) => {
          const subcategories = category.subcategories;
          if (category.id === response.category?.id) {
            return { ...response.category, subcategories };
          }
          return { ...category, subcategories };
        })
      );
    }
    setIsSaving(false);
    return;
  };

  const changeCategoryActiveState = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/set-active',
      body: { categoryId: category.id },
      method: 'POST',
    });
    if (response.statusCode === 201 && response?.category) {
      setCategories(
        categories.map((category) => {
          const subcategories = category.subcategories.map((subcategory) => {
            subcategory.active = false;
            return subcategory;
          });
          if (category.id === response.category?.id) {
            return { ...response.category, subcategories };
          }
          return { ...category, active: false, subcategories };
        })
      );
    }
    setIsSaving(false);
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
                    color:
                      isSaving || category.active
                        ? IS_SAVING_HEX
                        : category.visible
                        ? GREEN
                        : RED,
                    background: isSaving
                      ? `white`
                      : category.active
                      ? SUPER_LIGHT_SILVER
                      : 'white',
                    border: `solid 2px ${LIGHT_SILVER}`,
                    borderRight: `0px`,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    cursor: !isSaving && !category.active && 'pointer',
                    '&:hover': !isSaving &&
                      !category.active && {
                        color: !category.visible ? GREEN : RED,
                        background: LIGHT_SILVER,
                      },
                  }}
                  onClick={() =>
                    !isSaving && !category.active && changeCategoryVisibility()
                  }
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
            {viewMode === CategoriesPageMode.VIEW && (
              <Box
                sx={{
                  width: `60px`,
                  minWidth: '60px',
                  p: 2,
                  background: isActive ? LIGHT_GREEN : LIGHT_RED,
                  border: isSaving
                    ? `solid 2px ${IS_SAVING_HEX}`
                    : isActive
                    ? `solid 2px ${LIGHT_GREEN}`
                    : `solid 2px ${LIGHT_RED}`,
                  borderLeft: isSaving
                    ? `solid 2px ${IS_SAVING_HEX}`
                    : isActive
                    ? `solid 2px ${LIGHT_GREEN}`
                    : `solid 2px ${LIGHT_RED}`,
                  borderRight: 0,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                }}
                onClick={() =>
                  !isSaving &&
                  setIsEditing({
                    subcategoryId: undefined,
                    categoryId: category.id,
                    createNew: undefined,
                  })
                }
              />
            )}
            <Box
              sx={{
                color: isSaving && IS_SAVING_HEX,
                background: getRepeatingLinearGradient(
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
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                cursor:
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW &&
                  'pointer',
                '&:hover': !isSaving && {
                  background:
                    viewMode === CategoriesPageMode.EDIT
                      ? getRepeatingLinearGradient(category?.color, 0.3)
                      : isActive &&
                        !doesAnySubcategoryWithinCurrentCategoryActive
                      ? LIGHT_RED
                      : LIGHT_GREEN,
                  border:
                    viewMode === CategoriesPageMode.EDIT
                      ? `solid 2px ${getHexFromRGBAObject({
                          ...getRgbaObjectFromHexString(category?.color),
                          a: 0.3,
                        })}`
                      : isActive &&
                        !doesAnySubcategoryWithinCurrentCategoryActive
                      ? `solid 2px ${LIGHT_RED}`
                      : `solid 2px ${LIGHT_GREEN}`,
                  borderLeft:
                    viewMode === CategoriesPageMode.EDIT
                      ? 0
                      : isActive &&
                        !doesAnySubcategoryWithinCurrentCategoryActive
                      ? `solid 2px ${LIGHT_RED}`
                      : `solid 2px ${LIGHT_GREEN}`,
                  borderRight: 0,
                },
              }}
              onClick={() =>
                !isSaving &&
                viewMode !== CategoriesPageMode.EDIT &&
                changeCategoryActiveState()
              }
            >
              <Stack
                spacing={1}
                sx={{ p: 3 }}
                direction="row"
                alignItems="center"
                justifyContent="left"
              >
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
                        <ShowNoShow
                          isSaving={isSaving}
                          type={ShowNoShowType.SUBCATEGORIES}
                        />
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
                              categories={categories}
                              setCategories={setCategories}
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
                <ShowNoShow
                  isSaving={isSaving}
                  type={ShowNoShowType.SUBCATEGORIES}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      ) : undefined}
    </Box>
  );
}
