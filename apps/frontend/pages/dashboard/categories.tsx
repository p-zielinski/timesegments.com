import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import {
  ProductSort,
  CategoryList,
  ProductCartWidget,
} from '../../sections/@dashboard/categories';

import DashboardLayout from '../../layouts/dashboard';

import { ColumnSortOptions } from '@test1/shared';
import { sortCategories } from '../../utils/sortCategories';
import { UserWithCategoriesAndSubcategories } from '../../type/user';
import { Category } from '@prisma/client';
import { CategoriesPageMode } from '../../enum/categoriesPageMode';

// ----------------------------------------------------------------------

type Props = {
  user?: UserWithCategoriesAndSubcategories;
};

export default function Categories({ user }: Props) {
  const [order, setOrder] = useState<ColumnSortOptions>(
    ColumnSortOptions.NEWEST
  );
  const [categories, setCategories] = useState<Category[]>(
    sortCategories(user?.categories || [], order)
  );
  const [mode, setMode] = useState<CategoriesPageMode>(CategoriesPageMode.VIEW);
  const [isEditing, setIsEditing] = useState<{
    categoryId: string;
    subcategoryId: string;
    createNew: string;
  }>({
    categoryId: undefined,
    subcategoryId: undefined,
    createNew: undefined,
  });

  useEffect(() => {
    setCategories(sortCategories(categories, order));
  }, [order]);

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
            <ProductSort order={order} setOrder={setOrder} />
          </Stack>
        </Stack>

        <CategoryList
          categories={categories}
          setCategories={setCategories}
          mode={mode}
          setMode={setMode}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
        <ProductCartWidget />
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async (context: any) => {
  let { jwt_token } = context.req.cookies;

  jwt_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbGN0OXpjZnQwMDAwcXc1NXJ1MnQ5NjlvIiwidG9rZW5JZCI6ImNsZDVvd3czMDAwMDBxd3lubTJzb2t2c2UiLCJleHBpcmVzQXQiOiIyMDIzLTAzLTIyVDA4OjI5OjUyLjYxOVoifQ.j4Tyz6zORhroQ7sxVm-Tvnpxy1bVGVpTHj-fuDWNsSY`;

  const responseUser = await fetch(
    process.env.NEXT_PUBLIC_API_URL + 'user/me-extended',
    {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        jwt_token,
      },
    }
  );
  let user;
  try {
    user = (await responseUser.json())?.user;
  } catch (e) {}

  return {
    props: { user: user?.id ? user : null },
  };
};
