import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Stack } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// sections
import { AuthForm } from '../sections/auth';
import { useState } from 'react';
import {
  AuthPageState,
  Limits,
  MeExtendedOption,
  UserWithCategoriesAndSubcategories,
} from '@test1/shared';
import Logo from '../components/logo';
import { Category } from '@prisma/client';
import { CategoriesPageMode } from '../enum/categoriesPageMode';
import { RenderAuthLink } from '../components/renderAuthLink';
import DashboardLayout from '../layouts/dashboard';
import {
  CategoryList,
  ProductCartWidget,
  ProductSort,
} from '../sections/@dashboard/categories';
// ---------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: (theme as any).customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

type Props = {
  user?: UserWithCategoriesAndSubcategories;
  limits: Limits;
};

export default function Index({ user: serverSideFetchedUser, limits }: Props) {
  //Auth page states
  const mdUp = useResponsive('up', 'md');
  const [currentPageState, setCurrentPageState] = useState(
    AuthPageState.REGISTER
  );

  //Categories page states
  const [categories, setCategories] = useState<Category[]>(
    serverSideFetchedUser?.categories || []
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

  console.log(serverSideFetchedUser);

  if (!serverSideFetchedUser) {
    return (
      <>
        <Helmet>
          <title> Login | Minimal UI </title>
        </Helmet>

        <StyledRoot>
          <Logo
            sx={{
              position: 'fixed',
              top: { xs: 16, sm: 24, md: 40 },
              left: { xs: 16, sm: 24, md: 40 },
            }}
          />

          {mdUp && (
            <StyledSection>
              <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
                Hi, Welcome Back
              </Typography>
              <img
                src="/assets/illustrations/illustration_login.png"
                alt="login"
              />
            </StyledSection>
          )}

          <Container maxWidth="sm">
            <StyledContent>
              <Typography variant="h4" gutterBottom>
                {currentPageState === AuthPageState.LOGIN
                  ? `Sign in to ${process.env.NEXT_PUBLIC_APP_NAME}`
                  : currentPageState === AuthPageState.REGISTER
                  ? `Sign up to ${process.env.NEXT_PUBLIC_APP_NAME}`
                  : `Recover account`}
              </Typography>

              <Typography variant="body2" sx={{ mb: 3 }}>
                <RenderAuthLink
                  currentPageState={currentPageState}
                  setCurrentPageState={setCurrentPageState}
                />
              </Typography>

              <AuthForm
                authPageState={currentPageState}
                setAuthPageState={setCurrentPageState}
              />
            </StyledContent>
          </Container>
        </StyledRoot>
      </>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Categories</title>
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
        {/*<ProductCartWidget />*/}
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
