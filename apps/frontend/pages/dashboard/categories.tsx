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

import { User } from '@prisma/client';
import { sleep } from '../../utils/sleep';

// ----------------------------------------------------------------------

type Props = {
  user?: User;
};

export default function Categories({ user }: Props) {
  const getWindowDimensions = async () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  };
  // @ts-ignore
  const [categories, setCategories] = useState(user?.categories || []);
  const [isEditing, setIsEditing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(null);

  useEffect(() => {
    const handleResize = async () => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const widthAndHeight = await getWindowDimensions();
          if (widthAndHeight.width) {
            setWindowWidth(widthAndHeight.width);
            break;
          }
        } catch (e) {}
        await sleep(100);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

        <CategoryList
          categories={categories}
          setCategories={setCategories}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          windowWidth={windowWidth}
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
        jwt_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbGJmaXNobmwwMDAwcXR6ZGllZjlhOG1iIiwidG9rZW5JZCI6ImNsY2FuNGEyajAwMDFxdDF3bXMzZjFiNWQiLCJleHBpcmVzQXQiOiIyMDIzLTAyLTI4VDE0OjU4OjQ2LjY1MFoifQ.U7n8UtL08ZTHc9zjnb6FWyayOfWRSxkghA8n_vn89fI`,
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
