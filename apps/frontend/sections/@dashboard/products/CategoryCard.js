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

// ----------------------------------------------------------------------

CategoryCard.propTypes = {
  category: PropTypes.object,
};

export default function CategoryCard({ category }) {
  const [tempCategory, setTempCategory] = useState(category);
  const { name, cover, price, colors, status, priceSale } = tempCategory;
  const subcategories = tempCategory.subcategories?.filter(
    (subcategory) => subcategory.visible
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              flex: 1,
              bgcolor: tempCategory.active
                ? 'rgba(0,133,9,0.15)'
                : 'rgba(255,0,0,0.13)',
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              cursor: 'pointer',
              '&:hover': {
                background: tempCategory.active
                  ? 'rgba(255,0,0,0.2)'
                  : 'rgba(0,133,9,0.25)',
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
              <IsActive isActive={tempCategory.active} />
              <Typography variant="subtitle2" noWrap>
                {name}
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              width: `60px`,
              p: 2,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              cursor: 'pointer',
              '&:hover': {
                background: 'rgba(0,0,0,0.15)',
              },
            }}
            onClick={()=>setTempCategory({...tempCategory,expandSubcategories:!tempCategory.expandSubcategories})}
          >
            <Iconify
              icon={
                tempCategory.expandSubcategories
                  ? 'eva:chevron-up-fill'
                  : 'eva:chevron-down-fill'
              }
              width={50}
              sx={{ m: -2, position: 'absolute', bottom: 20, right: 20 }}
            />
          </Box>
        </Box>
      </Card>
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
          {tempCategory.expandSubcategories ? (
            <>
              {!subcategories.length && (
                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.11)' }}>
                  <Stack spacing={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle3" noWrap>
                      No subcategories to display
                    </Typography>
                  </Stack>
                </Card>
              )}
              {subcategories.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {subcategories.map((subcategory) => (
                    <SubcategoryCard
                      key={subcategory.id}
                      subcategory={subcategory}
                    />
                  ))}
                </Box>
              ) : undefined}
            </>
          ) : (
            subcategories
              .filter((subcategory) => subcategory.active)
              .map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                />
              ))
          )}
        </Box>
      </Box>
    </Box>
  );
}
