import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack, Grid } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
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
import { getRGBA } from '../../../utils/getRGBA';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';

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
          <Box
            sx={{
              background: getCategory(category, categories)?.active
                ? getRGBA(getCategory(category, categories)?.hexColor, 0.3)
                : getRepeatingLinearGradient(
                    getCategory(category, categories)?.hexColor,
                    0.3
                  ),
              flex: 1,
              border: getCategory(category, categories)?.active
                ? `solid 2px ${LIGHT_GREEN}`
                : `solid 2px ${LIGHT_RED}`,
              borderRight: `0px`,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              cursor: 'pointer',
              '&:hover': {
                background: getCategory(category, categories)?.active
                  ? LIGHT_RED
                  : LIGHT_GREEN,
                border: !getCategory(category, categories)?.active
                  ? `solid 2px ${LIGHT_GREEN}`
                  : `solid 2px ${LIGHT_RED}`,
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
                              ADD NEW SUBCATEGORY
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
