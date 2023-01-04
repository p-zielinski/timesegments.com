import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import IsActive from '../../../components/is-active/IsActive';
import Iconify from '../../../components/iconify';
import SubcategoryCard from './SubcategoryCard';
import { useState } from 'react';
import {ACTIVE, ACTIVE_DARK, INACTIVE, INACTIVE_DARK, LIGHT_SILVER} from '../../../consts/colors';
import hexRgb from 'hex-rgb';

// ----------------------------------------------------------------------

CategoryCard.propTypes = {
  category: PropTypes.object,
};

export default function CategoryCard({ category, categories, setCategories }) {
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
        ?.subcategories?.filter((subcategory) => subcategory.visible) || []
    );
  };

  const getCategory = (category, categories) => {
    return categories.find((_category) => _category.id === category.id) || {};
  };

  const getRGBA = (hexRgbValue = `ffffff`, alpha = 1) => {
    const hexRgbObject = hexRgb(hexRgbValue);
    return `rgba(${hexRgbObject.red},${hexRgbObject.green},${hexRgbObject.blue},${alpha})`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              background: getRGBA(
                getCategory(category, categories)?.hexColor,
                0.3
              ),
              flex: 1,
              border: getCategory(category, categories)?.active
                ? `solid 2px ${ACTIVE}`
                : `solid 2px ${INACTIVE}`,
              borderRight: `0px`,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              cursor: 'pointer',
              '&:hover': {
                background: getCategory(category, categories)?.active
                  ? INACTIVE
                  : ACTIVE,
                border: !getCategory(category, categories)?.active
                  ? `solid 2px ${ACTIVE}`
                  : `solid 2px ${INACTIVE}`,
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
              color:!getCategory(category, categories)?.expandSubcategories?ACTIVE_DARK:INACTIVE_DARK,
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
            {getCategory(category, categories)?.expandSubcategories ? (
              <>
                {getVisibleSubcategories(category, categories) ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {getVisibleSubcategories(category, categories).length ? (
                      getVisibleSubcategories(category, categories).map(
                        (subcategory) => (
                          <SubcategoryCard
                            key={subcategory.id}
                            subcategory={subcategory}
                          />
                        )
                      )
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
                ) : undefined}
              </>
            ) : getVisibleSubcategories(category, categories).filter(
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
        </Box>
      ) : undefined}
    </Box>
  );
}