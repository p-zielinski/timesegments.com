import {Helmet} from 'react-helmet-async';
// @mui
import {styled} from '@mui/material/styles';
import {Container, Stack, Typography} from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// sections
import {AuthForm} from '../sections/auth';
import {useEffect, useState} from 'react';
import {AuthPageState, CategoryWithSubcategories, Limits, MeExtendedOption, UserWithCategoriesAndSubcategories,} from '@test1/shared';
import {CategoriesPageMode} from '../enum/categoriesPageMode';
import {RenderAuthLink} from '../components/renderAuthLink';
import DashboardLayout from '../layouts/dashboard';
import {CategoryList, Sort} from '../sections/@dashboard/categories';
import {isMobile} from 'react-device-detect';

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

type Props = {
  user?: UserWithCategoriesAndSubcategories;
  limits: Limits;
};

export default function Index({
  user: serverSideFetchedUser,
  limits: serverSideFetchedLimits,
}: Props) {
  const [user, setUser] = useState<UserWithCategoriesAndSubcategories>(
    serverSideFetchedUser
  );

  const [limits, setLimits] = useState<Limits>(serverSideFetchedLimits);

  //Auth page states
  const mdUp = useResponsive('up', 'md');
  const [currentPageState, setCurrentPageState] = useState(AuthPageState.LOGIN);

  //Categories page states
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>(
    user?.categories || []
  );
  const [viewMode, setViewMode] = useState<CategoriesPageMode>(
    CategoriesPageMode.VIEW
  );

  useEffect(() => {
    if (!categories.length) {
      setViewMode(CategoriesPageMode.EDIT);
    } else {
      setViewMode(CategoriesPageMode.VIEW);
    }
  }, [categories.length]);

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

  const [disableHover, setDisableHover] = useState<boolean>(true);

  useEffect(() => {
    setDisableHover(isMobile);
  }, [isMobile]);

  if (!user) {
    return (
      <>
        <Helmet>
          <title> Login | Minimal UI </title>
        </Helmet>

        <StyledRoot>
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
                setUser={setUser}
                setCategories={setCategories}
                setLimits={setLimits}
              />
            </StyledContent>
          </Container>
        </StyledRoot>
      </>
    );
  }

  return (
    <DashboardLayout user={user} setUser={setUser}>
      <Helmet>
        <title>Categories</title>
      </Helmet>

      <Container>
        <Stack
          direction="row"
          flexWrap="wrap-reverse"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Stack
            direction="row"
            spacing={1}
            flexShrink={0}
            sx={{ mt: -3, mb: 3 }}
          >
            <Sort
              user={user}
              categories={categories}
              setCategories={setCategories}
            />
          </Stack>
        </Stack>

        <CategoryList
          disableHover={disableHover}
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
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async (context: any) => {
  const { jwt_token } = context.req.cookies;

  let responseUser;
  try {
    responseUser = await fetch(
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
  } catch (e) {
    console.log(e);
  }
  let user: UserWithCategoriesAndSubcategories, limits: Limits;
  try {
    const response = await responseUser.json();
    user = response.user;
    limits = response.limits;
  } catch (e) {
    console.log(e);
  }

  return {
    props: { user: user ?? null, limits: limits ?? null },
  };
};
