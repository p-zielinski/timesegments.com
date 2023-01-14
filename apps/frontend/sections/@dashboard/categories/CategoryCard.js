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
  LIGHT_BLUE,
  BLUE,
} from '../../../consts/colors';
import { getRgbaStringFromHexString } from '../../../utils/getRgbaStringFromHexString';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';
import { getHexFromRGBAObject } from '../../../utils/getHexFromRGBAObject';
import { Rgba } from '../../../type/user';
import { getRgbaObjectFromHexString } from '../../../utils/getRgbaObjectFromHexString';

// ----------------------------------------------------------------------

CategoryCard.propTypes = {
  category: PropTypes.object,
};

export default function CategoryCard({
  category,
  categories,
  setCategories,
  isEditing,
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
          isEditing ? true : subcategory.visible
        ) || []
    );
  };

  const getCategory = (category, categories) => {
    return categories.find((_category) => _category.id === category.id) || {};
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <Box sx={{ display: 'flex' }}>
          {isEditing && (
            <>
              <Box
                sx={{
                  width: `60px`,
                  minWidth: '60px',
                  p: 2,
                  color: category.visible ? GREEN : RED,
                  background: `white`,
                  border: `solid 2px ${LIGHT_SILVER}`,
                  borderRight: `0px`,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                  cursor: 'pointer',
                  '&:hover': {
                    color: !category.visible ? GREEN : RED,
                    background: LIGHT_SILVER,
                  },
                }}
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
                ? getRgbaStringFromHexString(category?.color, 0.3)
                : getRepeatingLinearGradient(category?.color, 0.3),
              flex: 1,
              border: isEditing
                ? `solid 2px ${getHexFromRGBAObject({
                    ...getRgbaObjectFromHexString(category?.color),
                    a: 0.3,
                  })}`
                : isActive
                ? `solid 2px ${LIGHT_GREEN}`
                : `solid 2px ${LIGHT_RED}`,
              borderLeft: isEditing
                ? `0px`
                : isActive
                ? `solid 2px ${LIGHT_GREEN}`
                : `solid 2px ${LIGHT_RED}`,
              borderRight: 0,
              borderTopLeftRadius: isEditing ? 0 : 12,
              borderBottomLeftRadius: isEditing ? 0 : 12,
              cursor: isEditing ? 'auto' : 'pointer',
              '&:hover': {
                background: isEditing
                  ? getRepeatingLinearGradient(category?.color, 0.3)
                  : isActive
                  ? LIGHT_RED
                  : LIGHT_GREEN,
                border: isEditing
                  ? `solid 2px ${getHexFromRGBAObject({
                      ...getRgbaObjectFromHexString(category?.color),
                      a: 0.3,
                    })}`
                  : !isActive
                  ? `solid 2px ${LIGHT_GREEN}`
                  : `solid 2px ${LIGHT_RED}`,
                borderLeft: isEditing
                  ? 0
                  : !isActive
                  ? `solid 2px ${LIGHT_GREEN}`
                  : `solid 2px ${LIGHT_RED}`,
                borderRight: 0,
              },
            }}
          >
            <Stack
              spacing={1}
              sx={{ p: 3 }}
              direction="row"
              alignItems="center"
              justifyContent="left"
            >
              <IsActive isActive={getCategory(category, categories)?.active} />
              <Typography variant="subtitle2" noWrap>
                {getCategory(category, categories)?.name}
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              width: `60px`,
              p: 2,
              color: !getCategory(category, categories)?.expandSubcategories
                ? GREEN
                : RED,
              background: `white`,
              border: `solid 2px ${LIGHT_SILVER}`,
              borderLeft: `0px`,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              cursor: 'pointer',
              '&:hover': {
                borderLeft: `0px`,
                background: LIGHT_SILVER,
              },
            }}
            onClick={() => reverseExpandSubcategories(category, categories)}
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
                  isEditing ? (
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      {getVisibleSubcategories(category, categories).length ||
                      isEditing ? (
                        getVisibleSubcategories(category, categories).map(
                          (subcategory) => (
                            <SubcategoryCard
                              key={subcategory.id}
                              subcategory={subcategory}
                              categories={categories}
                              setCategories={setCategories}
                              isEditing={isEditing}
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
                      {isEditing && (
                        <Card
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.11)',
                            cursor: 'pointer',
                            border: `solid 2px ${LIGHT_BLUE}`,
                            background: LIGHT_BLUE,
                            '&:hover': {
                              border: `solid 2px ${BLUE}`,
                            },
                          }}
                        >
                          <Iconify
                            icon={'material-symbols:add'}
                            width={50}
                            sx={{
                              m: -2,
                              position: 'absolute',
                              bottom: 18,
                              left: 20,
                            }}
                          />
                          <Stack spacing={2} sx={{ p: 2, ml: 5 }}>
                            <Typography variant="subtitle2" noWrap>
                              CREATE NEW SUBCATEGORY
                            </Typography>
                          </Stack>
                        </Card>
                      )}
                    </Box>
                  ) : undefined}
                </>
              ) : isEditing ||
                getVisibleSubcategories(category, categories).filter(
                  (subcategory) => subcategory.active
                ).length ? (
                getVisibleSubcategories(category, categories)
                  .filter((subcategory) => subcategory.active)
                  .map((subcategory) => (
                    <SubcategoryCard
                      key={subcategory.id}
                      subcategory={subcategory}
                      categories={categories}
                      setCategories={setCategories}
                      isEditing={isEditing}
                    />
                  ))
              ) : (
                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.11)' }}>
                  <Stack spacing={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle3" noWrap>
                      No subcategories to display
                    </Typography>
                  </Stack>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      ) : undefined}
    </Box>
  );
}
