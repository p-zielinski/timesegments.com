import {Helmet} from 'react-helmet-async'; // @mui
import {styled} from '@mui/material/styles';
import {Container, Stack} from '@mui/material'; // hooks
import useResponsive from '../../hooks/useResponsive'; // sections
import React, {useEffect, useState} from 'react';
import {
  CategoryWithSubcategories,
  Limits,
  MeExtendedOption,
  UserWithCategoriesAndSubcategories,
  UserWithCategoriesAndSubcategoriesAndNotes,
} from '@test1/shared';
import {CategoriesPageMode} from '../../enum/categoriesPageMode';
import DashboardLayout from '../../layouts/dashboard';
import {CategoryList, Sort} from '../../sections/@dashboard/categories';
import {isMobile} from 'react-device-detect';
import {handleFetch} from '../../utils/handleFetch';
import {StatusCodes} from 'http-status-codes';
import Cookies from 'cookies';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import {getColorShadeBasedOnSliderPickerSchema} from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../utils/colors/getHexFromRGBObject';
import {NotesSection} from '../../sections/@dashboard/categories/Notes';
import {Note} from '@prisma/client';
import navConfig from '../../layouts/dashboard/nav/config';
import {isEqual} from 'lodash';
import {useRouter} from 'next/router';
import {getIsPageState} from '../../utils/getIsPageState';
import {DashboardPageState} from '../../enum/DashboardPageState';
import {GoToCategoriesOrNotes} from '../../sections/@dashboard/categories/GoToCategoriesOrNotes'; // ---------------------------------------------------------------------
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
  const router = useRouter();
  const [currentPageState, setCurrentPageState] = useState<DashboardPageState>(
    navConfig.find((configItem) => getIsPageState({ router, configItem }))
      ?.state
  );

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

  return (
    <DashboardLayout
      user={user}
      setUser={setUser}
      title={
        currentPageState === DashboardPageState.CATEGORIES
          ? 'Categories & subcategories'
          : currentPageState === DashboardPageState.NOTES
          ? 'Recent notes'
          : undefined
      }
      currentPageState={currentPageState}
      setCurrentPageState={setCurrentPageState}
    >
      <Helmet>
        <title>Categories</title>
      </Helmet>

      <Container>
        <GoToCategoriesOrNotes
          currentPageState={currentPageState}
          setCurrentPageState={setCurrentPageState}
          isSaving={isSaving}
          disableHover={disableHover}
        />
        {currentPageState === DashboardPageState.CATEGORIES ? (
          <>
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
          </>
        ) : currentPageState === DashboardPageState.NOTES ? (
          <>
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
            <NotesSection
              controlValue={controlValue}
              setControlValue={setControlValue}
              user={user}
              setUser={setUser}
              userNotes={userNotes}
              setUserNotes={setUserNotes}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              disableHover={disableHover}
            />
          </>
        ) : undefined}
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const query = req.query || {};
  const possibleQueryOptions = navConfig
    .filter((config) => config.path === '/dashboard' && config.query)
    .map((config) => config.query);
  const queryOk = possibleQueryOptions.find((optionQuery) =>
    isEqual(optionQuery, query)
  );
  if (!queryOk && possibleQueryOptions.length) {
    return {
      redirect: {
        permanent: false,
        destination: `/dashboard?${new URLSearchParams(
          possibleQueryOptions[0]
        ).toString()}`,
      },
    };
  }

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

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
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
