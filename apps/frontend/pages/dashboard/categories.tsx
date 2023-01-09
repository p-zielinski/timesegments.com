import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import {
  ProductSort,
  CategoryList,
  ProductCartWidget,
} from '../../sections/@dashboard/products';

import DashboardLayout from '../../layouts/dashboard';

import { ColumnSortOptions } from '../../enums/sortOption';
import { sortCategories } from '../../utils/sortCategories';
import { UserWithCategoriesAndSubcategories } from '../../type/user';
import { shared } from '@test1/shared';

// ----------------------------------------------------------------------

type Props = {
  user?: UserWithCategoriesAndSubcategories;
};

export default function Categories({ user }: Props) {
  const [order, setOrder] = useState(ColumnSortOptions.NEWEST);
  const [categories, setCategories] = useState(
    sortCategories(user?.categories || [], order)
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCategories(sortCategories(categories, order));
  }, [order]);

  console.log(shared());

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
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
        <ProductCartWidget />
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async (context: any) => {
  const { access_token } = context.req.cookies;

  const responseUser = await fetch(
    process.env.NEXT_PUBLIC_API_URL + 'user/me-extended',
    {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${access_token}`,
        jwt_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbGJmaXNobmwwMDAwcXR6ZGllZjlhOG1iIiwidG9rZW5JZCI6ImNsY3A2azNlaTAwMDFxdDNieW41NzYzN3AiLCJleHBpcmVzQXQiOiIyMDIzLTAzLTEwVDE5OjExOjQzLjY3MloifQ.z0JEZKoWlM8rIHkbani6afrHspK__E4Mrc33bXjiS-8`,
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
