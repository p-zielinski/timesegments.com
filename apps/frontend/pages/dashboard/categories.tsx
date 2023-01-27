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

import {
  Limits,
  MeExtendedOption,
  UserWithCategoriesAndSubcategories,
} from '@test1/shared';
import { Category } from '@prisma/client';
import { CategoriesPageMode } from '../../enum/categoriesPageMode';

// ----------------------------------------------------------------------

type Props = {
  user?: UserWithCategoriesAndSubcategories;
  limits: Limits;
};

export default function Categories({ user, limits }: Props) {
  const [categories, setCategories] = useState<Category[]>(
    user?.categories || []
  );
  const [viewMode, setViewMode] = useState<CategoriesPageMode>(
    CategoriesPageMode.VIEW
  );
  const [isEditing, setIsEditing] = useState<{
    categoryId: string;
    subcategoryId: string;
    createNew: string;
  }>({
    categoryId: undefined,
    subcategoryId: undefined,
    createNew: undefined,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  return (
    <DashboardLayout>
      <Helmet>
        <title> Categories </title>
      </Helmet>

      <Container>
        <Typography
          variant="h4"
          sx={{ mb: 1 }}
          onClick={() => setIsSaving(!isSaving)}
        >
          Categories & subcategories
        </Typography>

        <Stack
          direction="row"
          flexWrap="wrap-reverse"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ mb: 3 }}>
            <ProductSort
              categories={categories}
              setCategories={setCategories}
            />
          </Stack>
        </Stack>

        <CategoryList
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          categories={categories}
          setCategories={setCategories}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          limits={limits}
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
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        jwt_token,
      },
      body: JSON.stringify({
        extend: [
          MeExtendedOption.CATEGORIES,
          MeExtendedOption.SUBCATEGORIES,
          MeExtendedOption.CATEGORIES_LIMIT,
          MeExtendedOption.SUBCATEGORIES_LIMIT,
        ],
      }),
    }
  );
  let user: UserWithCategoriesAndSubcategories, limits: Limits;
  try {
    const response = await responseUser.json();
    user = response.user;
    limits = response.limits;
  } catch (e) {
    console.log(e);
  }

  return {
    props: { user, limits },
  };
};
