import PropTypes from 'prop-types';
// @mui
import { Card, Typography, Stack, Box } from '@mui/material';
// utils
import IsActive from '../../../components/is-active/IsActive';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  LIGHT_SILVER,
  RED,
} from '../../../consts/colors';
import { getRgbaStringFromHexString } from '../../../utils/getRgbaStringFromHexString';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';
import Iconify from '../../../components/iconify';
import { getHexFromRGBAObject } from '../../../utils/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../utils/getRgbaObjectFromHexString';
import { CategoriesPageMode } from '../../../enum/categoriesPageMode';
import EditSubcategory from './EditSubcategory';

// ----------------------------------------------------------------------

SubcategoryCard.propTypes = {
  subcategory: PropTypes.object,
  categories: PropTypes.array,
  setCategories: PropTypes.func,
  isEditing: PropTypes.object,
};

export default function SubcategoryCard({
  subcategory,
  categories,
  setCategories,
  isEditing,
  setIsEditing,
  viewMode,
  isSaving,
  setIsSaving,
}) {
  const { name, active: isActive } = subcategory;
  const category = categories.find((category) =>
    category.subcategories.find(
      (_subcategory) => _subcategory.id === subcategory.id
    )
  );

  const changeSubcategoryVisibility = () => {
    return;
  };

  const setSubcategoryAsActive = () => {
    return;
  };

  if (
    viewMode === CategoriesPageMode.EDIT &&
    isEditing.subcategoryId === subcategory.id
  ) {
    return (
      <EditSubcategory
        category={category}
        subcategory={subcategory}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
      />
    );
  }

  return (
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
                  : subcategory.visible
                  ? GREEN
                  : RED,
                background: `white`,
                border: `solid 2px ${LIGHT_SILVER}`,
                borderRight: `0px`,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                cursor: !isSaving && 'pointer',
                '&:hover': !isSaving && {
                  color: !subcategory.visible ? GREEN : RED,
                  background: LIGHT_SILVER,
                },
              }}
              onClick={() => !isSaving && changeSubcategoryVisibility()}
            >
              <Iconify
                icon={
                  subcategory.visible
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
              onClick={() => {
                !isSaving &&
                  setIsEditing({
                    categoryId: undefined,
                    subcategoryId: subcategory.id,
                    createNew: undefined,
                  });
              }}
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
                  isSaving
                    ? IS_SAVING_HEX
                    : subcategory?.color || category?.color,
                  0.3
                )
              : getRepeatingLinearGradient(
                  isSaving
                    ? IS_SAVING_HEX
                    : subcategory?.color || category?.color,
                  0.3
                ),
            flex: 1,
            border:
              viewMode === CategoriesPageMode.EDIT
                ? `solid 2px ${getHexFromRGBAObject({
                    ...getRgbaObjectFromHexString(
                      isSaving
                        ? IS_SAVING_HEX
                        : subcategory?.color || category?.color
                    ),
                    a: 0.3,
                  })}`
                : isActive
                ? `solid 2px ${LIGHT_GREEN}`
                : `solid 2px ${LIGHT_RED}`,
            borderLeft:
              viewMode === CategoriesPageMode.EDIT
                ? `0px`
                : isActive
                ? `solid 2px ${LIGHT_GREEN}`
                : `solid 2px ${LIGHT_RED}`,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            borderTopLeftRadius: viewMode === CategoriesPageMode.EDIT ? 0 : 12,
            borderBottomLeftRadius:
              viewMode === CategoriesPageMode.EDIT ? 0 : 12,
            cursor: viewMode === CategoriesPageMode.EDIT ? 'auto' : 'pointer',
            '&:hover': !isSaving && {
              background:
                viewMode === CategoriesPageMode.EDIT
                  ? getRepeatingLinearGradient(
                      subcategory?.color || category?.color,
                      0.3
                    )
                  : isActive
                  ? LIGHT_RED
                  : LIGHT_GREEN,
              border:
                viewMode === CategoriesPageMode.EDIT
                  ? `solid 2px ${getHexFromRGBAObject({
                      ...getRgbaObjectFromHexString(
                        subcategory?.color || category?.color
                      ),
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
            },
          }}
          onClick={() => !isSaving && setSubcategoryAsActive}
        >
          <Stack
            spacing={1}
            sx={{ p: 3, pl: viewMode === CategoriesPageMode.EDIT ? 2 : 3 }}
            direction="row"
            alignItems="center"
            justifyContent="left"
          >
            <IsActive isActive={isActive} isSaving={isSaving} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
