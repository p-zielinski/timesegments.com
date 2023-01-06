import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import {
  ProductSort,
  CategoryList,
  ProductCartWidget,
  ProductFilterSidebar,
} from '../../sections/@dashboard/products';

import DashboardLayout from '../../layouts/dashboard';

// ----------------------------------------------------------------------

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <DashboardLayout>
      <Helmet>
        <title> Categories </title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Categories & subcategories
        </Typography>

        <Stack
          direction="row"
          flexWrap="wrap-reverse"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ mb: 3 }}>
            <ProductSort />
          </Stack>
        </Stack>

        <CategoryList categories={categories} setCategories={setCategories} isEditing={isEditing} setIsEditing={setIsEditing}/>
        <ProductCartWidget />
      </Container>
    </DashboardLayout>
  );
}
