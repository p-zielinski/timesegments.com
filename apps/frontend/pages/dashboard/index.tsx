import {Container} from '@mui/material'; // hooks
import React, {useEffect, useRef} from 'react';
import {ControlValue, Limits, MeExtendedOption} from '@test1/shared';
import Cookies from 'cookies';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import {getColorShadeBasedOnSliderPickerSchema} from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../utils/colors/getHexFromRGBObject';
import {Category, Note, TimeLog, User} from '@prisma/client';
import {createStore, StoreContext} from '../../hooks/useStore';
import {useRouter} from 'next/router';
import {isMobile} from 'react-device-detect';
import Categories from 'apps/frontend/sections/@dashboard/categories';
import dynamic from 'next/dynamic';
import {useStore} from 'zustand';
import {Helmet} from 'react-helmet-async';
// --------------------------------------------------------------------

const DashboardLayout = dynamic(() => import('../../layouts/dashboard'), {
  ssr: false,
});

type Props = {
  isPageChanging: boolean;
  user: User;
  categories: Category[];
  notes: Note[];
  timeLogs: TimeLog[];
  fetchedFrom: number;
  limits: Limits;
  controlValues: Record<ControlValue, string>;
  randomSliderHexColor: string;
};

export default function Index({
  isPageChanging,
  user: serverSideFetchedUserWithCategoriesAndCategoriesNotes,
  categories: serverSideFetchedCategories,
  notes: serverSideFetchedNotes,
  timeLogs: serverSideFetchedTimeLogs,
  fetchedFrom: serverSideFetchedFrom,
  limits: serverSideFetchedLimits,
  controlValues: serverSideFetchedControlValues,
  randomSliderHexColor,
}: Props) {
  const store = useRef(
    createStore({
      disableHover: isMobile,
      router: useRouter(),
      user: serverSideFetchedUserWithCategoriesAndCategoriesNotes,
      categories: serverSideFetchedCategories,
      notes: serverSideFetchedNotes,
      timeLogs: serverSideFetchedTimeLogs,
      fetchedFrom: serverSideFetchedFrom,
      limits: serverSideFetchedLimits,
      controlValues: serverSideFetchedControlValues,
    })
  ).current;

  const { controlValues, checkControlValues, setIsSaving } = useStore(store);

  useEffect(() => {
    setIsSaving(isPageChanging);
  }, [isPageChanging]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkControlValues();
    }, 2 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [controlValues]);

  return (
    <StoreContext.Provider value={store}>
      <DashboardLayout
        title={'Active Categories'}
        randomSliderHexColor={randomSliderHexColor}
      >
        <Helmet>
          <title>Active Categories | TimeSegments.com</title>
        </Helmet>
        <Container sx={{ mt: -5 }}>
          <Categories />
        </Container>
      </DashboardLayout>
    </StoreContext.Provider>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);
  const jwt_token = cookies.get('jwt_token');
  if (!jwt_token) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

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
            MeExtendedOption.CATEGORIES_NOTES,
            MeExtendedOption.LIMITS,
            MeExtendedOption.TODAYS_TIMELOGS,
          ],
        }),
      }
    );
    const response = await responseUser.json();

    const {
      user,
      categories,
      notes,
      timeLogs,
      fetchedFrom,
      limits,
      controlValues,
    }: {
      user: User;
      categories: Category[];
      notes: Note[];
      timeLogs: TimeLog[];
      fetchedFrom: number;
      limits: Limits;
      controlValues: Record<ControlValue, string>;
    } = response;

    if (!user) {
      return {
        redirect: {
          permanent: false,
          destination: '/',
        },
      };
    }

    cookies.set('jwt_token', jwt_token, {
      httpOnly: false,
      secure: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60 * 24 * 400,
    });

    return {
      props: {
        user,
        categories,
        notes,
        timeLogs,
        fetchedFrom,
        limits,
        controlValues,
        randomSliderHexColor: getHexFromRGBObject(
          getColorShadeBasedOnSliderPickerSchema(
            getRandomRgbObjectForSliderPicker().rgb,
            'very bright'
          )
        ),
      },
    };
  } catch (e) {
    console.log(e);
    cookies.set('jwt_token');
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
};
