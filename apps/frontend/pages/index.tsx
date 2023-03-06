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
import {refreshToken} from '../utils/refreshToken';
import {handleFetch} from '../utils/handleFetch';
import {StatusCodes} from 'http-status-codes';

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
  const [refreshIntervalId, setRefreshIntervalId] = useState(undefined);

  useEffect(() => {
    refreshToken();
  }, []);

  const [user, setUser] = useState<UserWithCategoriesAndSubcategories>(
    serverSideFetchedUser
  );
  const [controlValue, setControlValue] = useState(user?.controlValue);

  useEffect(() => {
    setControlValue(user?.controlValue);
  }, [user?.controlValue]);

  useEffect(() => {
    if (user && !controlValue) {
      fetchExtendedUser();
    }
    if (user) {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
      const intervalId = setInterval(() => {
        checkControlValue();
      }, 2 * 60 * 1000);
      setRefreshIntervalId(intervalId);
    }
  }, [controlValue]);

  const checkControlValue = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/check-control-value',
      body: {
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setIsSaving(false);
      return;
    } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
      setUser(undefined);
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        setRefreshIntervalId(undefined);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      return fetchExtendedUser();
    }
    console.log(response);
    setIsSaving(false);
    return;
  };

  const fetchExtendedUser = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/me-extended',
      body: {
        extend: [
          MeExtendedOption.CATEGORIES,
          MeExtendedOption.SUBCATEGORIES,
          MeExtendedOption.CATEGORIES_LIMIT,
          MeExtendedOption.SUBCATEGORIES_LIMIT,
        ],
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.user) {
      setUser(response.user);
      setCategories(response.user?.categories ?? []);
      setControlValue(response.user?.controlValue);
    } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
      setUser(undefined);
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        setRefreshIntervalId(undefined);
      }
    }
    setIsSaving(false);
    return;
  };

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
    if (viewMode === CategoriesPageMode.EDIT || !user) {
      return;
    }
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
          controlValue={controlValue}
          setControlValue={setControlValue}
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

  let user: UserWithCategoriesAndSubcategories, limits: Limits;
  try {
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
