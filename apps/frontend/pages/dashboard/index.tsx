import {Helmet} from 'react-helmet-async'; // @mui
import {Box, Container, useMediaQuery} from '@mui/material'; // hooks
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
import {isMobile} from 'react-device-detect';
import {handleFetch} from '../../utils/handleFetch';
import {StatusCodes} from 'http-status-codes';
import Cookies from 'cookies';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import {getColorShadeBasedOnSliderPickerSchema} from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../utils/colors/getHexFromRGBObject';
import {NotesSection} from '../../sections/@dashboard/notes';
import {Note} from '@prisma/client';
import navConfig from '../../layouts/dashboard/nav/config';
import {isEqual} from 'lodash';
import {useRouter} from 'next/router';
import {getIsPageState} from '../../utils/getIsPageState';
import {DashboardPageState} from '../../enum/DashboardPageState';
import {GoToCategoriesOrNotes} from '../../sections/@dashboard/categories/GoToCategoriesOrNotes';
import {CategoriesSection} from '../../sections/@dashboard/categories';
// ---------------------------------------------------------------------

type Props = {
  user?: UserWithCategoriesAndSubcategories;
  limits: Limits;
  notes: Note[];
  randomSliderHexColor: string;
};

export default function Index({
  user: serverSideFetchedUser,
  limits: serverSideFetchedLimits,
  notes: serverSideFetchedNotes,
  randomSliderHexColor: randomSliderHexColor,
}: Props) {
  const width1200px = useMediaQuery('(min-width:1200px)');

  const [disableHover, setDisableHover] = useState<boolean>(true);
  useEffect(() => {
    setDisableHover(isMobile);
  }, [isMobile]);

  const router = useRouter();
  const [currentPageState, setCurrentPageState] = useState<DashboardPageState>(
    navConfig.find((configItem) => getIsPageState({ router, configItem }))
      ?.state
  );

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

  const limits: Limits = serverSideFetchedLimits;

  //Categories page states
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>(
    user?.categories || []
  );
  const [notes, setNotes] = useState<Note[]>(serverSideFetchedNotes || []);
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

  const [isSaving, setIsSaving] = useState<boolean>(false);

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
      randomSliderHexColor={randomSliderHexColor}
    >
      <Helmet>
        <title>Categories</title>
      </Helmet>

      <Container>
        {!width1200px ? (
          <GoToCategoriesOrNotes
            currentPageState={currentPageState}
            setCurrentPageState={setCurrentPageState}
            isSaving={isSaving}
            disableHover={disableHover}
          />
        ) : (
          <Box sx={{ mt: -5 }} />
        )}
        {currentPageState === DashboardPageState.CATEGORIES ? (
          <CategoriesSection
            categories={categories}
            setCategories={setCategories}
            viewMode={viewMode}
            setViewMode={setViewMode}
            limits={limits}
            controlValue={controlValue}
            setControlValue={setControlValue}
            user={user}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            disableHover={disableHover}
          />
        ) : currentPageState === DashboardPageState.NOTES ? (
          <NotesSection
            controlValue={controlValue}
            setControlValue={setControlValue}
            user={user}
            setUser={setUser}
            notes={notes}
            setNotes={setNotes}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            disableHover={disableHover}
          />
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
      randomSliderHexColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
    },
  };
};
