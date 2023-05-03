import {Helmet} from 'react-helmet-async'; // @mui
import {styled} from '@mui/material/styles';
import {Box, Container, Stack, Typography} from '@mui/material'; // hooks
import useResponsive from '../hooks/useResponsive'; // sections
import {AuthForm} from '../sections/auth';
import React, {useEffect, useState} from 'react';
import {
  AuthPageState,
  CategoryWithSubcategories,
  Limits,
  MeExtendedOption,
  UserWithCategoriesAndSubcategories,
  UserWithCategoriesAndSubcategoriesAndNotes,
} from '@test1/shared';
import {CategoriesPageMode} from '../enum/categoriesPageMode';
import {RenderAuthLink} from '../components/renderAuthLink';
import DashboardLayout from '../layouts/dashboard';
import {CategoryList, Sort} from '../sections/@dashboard/categories';
import {isMobile} from 'react-device-detect';
import {handleFetch} from '../utils/handleFetch';
import {StatusCodes} from 'http-status-codes';
import Cookies from 'cookies';
import {getRandomRgbObjectForSliderPicker} from '../utils/colors/getRandomRgbObjectForSliderPicker';
import {getColorShadeBasedOnSliderPickerSchema} from '../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../utils/colors/getHexFromRGBObject';
import {getHexFromRGBAObject} from '../utils/colors/getHexFromRGBAObject';
import {NotesSection} from '../sections/@dashboard/categories/Notes';
import {Note} from '@prisma/client';
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

type Props = {
  user?: UserWithCategoriesAndSubcategories;
  limits: Limits;
  notes: Note[];
  randomSliderColor: string;
};

export default function Index({
  user: serverSideFetchedUser,
  limits: serverSideFetchedLimits,
  notes: serverSideFetchedNotes,
  randomSliderColor: randomSliderColor,
}: Props) {
  const StyledContent = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: isMobile ? 'start' : 'center',
    flexDirection: 'column',
    padding: theme.spacing(isMobile ? 6 : 12, 0),
  }));

  const [refreshIntervalId, setRefreshIntervalId] = useState(undefined);

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
    return () => {
      clearInterval(refreshIntervalId);
    };
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
          MeExtendedOption.NOTES,
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

  const [limits, setLimits] = useState<Limits>(serverSideFetchedLimits || {});

  //Auth page states
  const mdUp = useResponsive('up', 'md');
  const [currentPageState, setCurrentPageState] = useState(AuthPageState.LOGIN);

  //Categories page states
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>(
    user?.categories || []
  );
  const [userNotes, setUserNotes] = useState<Note[]>(
    serverSideFetchedNotes || []
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
              <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 3 }}>
                {currentPageState === AuthPageState.REGISTER
                  ? 'Welcome!'
                  : 'Hi, Welcome Back'}
              </Typography>
              <Box sx={{ ml: 5, mr: 5, mt: 0 }}>
                <img src="/assets/clock.png" alt="login" />
              </Box>
            </StyledSection>
          )}

          <Container maxWidth="sm">
            <StyledContent>
              <Typography variant="h4" gutterBottom>
                {currentPageState === AuthPageState.LOGIN
                  ? `Sign in to `
                  : currentPageState === AuthPageState.REGISTER
                  ? `Sign up to `
                  : `Recover account`}
                {[AuthPageState.LOGIN, AuthPageState.REGISTER].includes(
                  currentPageState
                ) && (
                  <span
                    style={{
                      color: getHexFromRGBAObject({ r: 0, g: 0, b: 0, a: 0.7 }),
                    }}
                  >
                    TimeSeg
                    <span
                      style={{
                        color: randomSliderColor,
                      }}
                    >
                      ment
                    </span>
                    s.com
                  </span>
                )}
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
    <DashboardLayout
      user={user}
      setUser={setUser}
      title={'Categories & subcategories'}
    >
      <Helmet>
        <title>Categories</title>
      </Helmet>

      <Container>
        <NotesSection
          userNotes={userNotes}
          setUserNotes={setUserNotes}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          disableHover={disableHover}
        />
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
            sx={{ mt: 1, mb: 1 }}
          >
            <Sort
              user={user}
              categories={categories}
              setCategories={setCategories}
            />
          </Stack>
        </Stack>
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);
  const jwt_token = cookies.get('jwt_token');
  let user: UserWithCategoriesAndSubcategoriesAndNotes,
    limits: Limits,
    notes: Note[];
  if (jwt_token) {
    try {
      const responseUser = await fetch(
        process.env.NEXT_PUBLIC_API_URL + 'user/me-extended',
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            authorization: `Bearer ${jwt_token}`,
          },
          body: JSON.stringify({
            extend: [
              MeExtendedOption.CATEGORIES,
              MeExtendedOption.SUBCATEGORIES,
              MeExtendedOption.CATEGORIES_LIMIT,
              MeExtendedOption.SUBCATEGORIES_LIMIT,
              MeExtendedOption.NOTES,
            ],
          }),
        }
      );
      const response = await responseUser.json();
      user = response.user;
      limits = response.limits;
      notes = response.user.notes;
    } catch (e) {
      console.log(e);
      cookies.set('jwt_token');
    }
    cookies.set('jwt_token', jwt_token, {
      httpOnly: false,
      secure: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60 * 24 * 400,
    });
  }

  return {
    props: {
      user: user ?? null,
      limits: limits ?? null,
      notes: notes ?? null,
      randomSliderColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
    },
  };
};
