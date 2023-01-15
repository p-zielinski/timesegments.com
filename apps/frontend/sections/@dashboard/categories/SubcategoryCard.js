import PropTypes from 'prop-types';
// @mui
import { Card, Typography, Stack, Box } from '@mui/material';
// utils
import IsActive from '../../../components/is-active/IsActive';
import {
  BLUE,
  GREEN,
  LIGHT_GREEN,
  LIGHT_RED,
  LIGHT_SILVER,
  ORANGE,
  RED,
} from '../../../consts/colors';
import { getRgbaStringFromHexString } from '../../../utils/getRgbaStringFromHexString';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';
import Iconify from '../../../components/iconify';
import { getHexFromRGBAObject } from '../../../utils/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../utils/getRgbaObjectFromHexString';
import { CategoriesPageMode } from '@test1/shared';

// ----------------------------------------------------------------------

SubcategoryCard.propTypes = {
  subcategory: PropTypes.object,
  categories: PropTypes.array,
  setCategories: PropTypes.func,
  isEditing: PropTypes.bool,
};

export default function SubcategoryCard({
  subcategory,
  categories,
  setCategories,
  isEditing,
  setIsEditing,
  mode,
}) {
  const { name, active: isActive, id } = subcategory;
  const category = categories.find((category) =>
    category.subcategories.find(
      (_subcategory) => _subcategory.id === subcategory.id
    )
  );

  return (
    <Card>
      <Box sx={{ display: 'flex' }}>
        {mode === CategoriesPageMode.EDIT && (
          <>
            <Box
              sx={{
                width: `60px`,
                minWidth: '60px',
                p: 2,
                color: subcategory.visible ? GREEN : RED,
                background: `white`,
                border: `solid 2px ${LIGHT_SILVER}`,
                borderRight: `0px`,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                cursor: 'pointer',
                '&:hover': {
                  color: !subcategory.visible ? GREEN : RED,
                  background: LIGHT_SILVER,
                },
              }}
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
                color: GREEN,
                background: `white`,
                borderTop: `solid 2px ${LIGHT_SILVER}`,
                borderBottom: `solid 2px ${LIGHT_SILVER}`,
                cursor: 'pointer',
                '&:hover': {
                  background: LIGHT_SILVER,
                },
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
            background: isActive
              ? getRgbaStringFromHexString(
                  subcategory?.color || category?.color,
                  0.3
                )
              : getRepeatingLinearGradient(
                  subcategory?.color || category?.color,
                  0.3
                ),
            flex: 1,
            border:
              mode === CategoriesPageMode.EDIT
                ? `solid 2px ${getHexFromRGBAObject({
                    ...getRgbaObjectFromHexString(
                      subcategory?.color || category?.color
                    ),
                    a: 0.3,
                  })}`
                : isActive
                ? `solid 2px ${LIGHT_GREEN}`
                : `solid 2px ${LIGHT_RED}`,
            borderLeft:
              mode === CategoriesPageMode.EDIT
                ? `0px`
                : isActive
                ? `solid 2px ${LIGHT_GREEN}`
                : `solid 2px ${LIGHT_RED}`,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            borderTopLeftRadius: mode === CategoriesPageMode.EDIT ? 0 : 12,
            borderBottomLeftRadius: mode === CategoriesPageMode.EDIT ? 0 : 12,
            cursor: mode === CategoriesPageMode.EDIT ? 'auto' : 'pointer',
            '&:hover': {
              background:
                mode === CategoriesPageMode.EDIT
                  ? getRepeatingLinearGradient(
                      subcategory?.color || category?.color,
                      0.3
                    )
                  : isActive
                  ? LIGHT_RED
                  : LIGHT_GREEN,
              border:
                mode === CategoriesPageMode.EDIT
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
                mode === CategoriesPageMode.EDIT
                  ? 0
                  : !isActive
                  ? `solid 2px ${LIGHT_GREEN}`
                  : `solid 2px ${LIGHT_RED}`,
            },
          }}
        >
          <Stack
            spacing={1}
            sx={{ p: 3, pl: mode === CategoriesPageMode.EDIT ? 2 : 3 }}
            direction="row"
            alignItems="center"
            justifyContent="left"
          >
            <IsActive isActive={isActive} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
