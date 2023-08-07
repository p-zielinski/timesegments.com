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
import {createGroupedTimeLogPeriods} from '../../helperFunctions/createGroupedTimeLogPeriods';
import {useStore} from 'zustand';
import DashboardLayout from '../../layouts/dashboard';
import Categories from 'apps/frontend/sections/@dashboard/categories';
// --------------------------------------------------------------------

type Props = {
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
  user: serverSideFetchedUserWithCategoriesAndCategoriesNotes,
  categories: serverSideFetchedCategories,
  notes: serverSideFetchedNotes,
  timeLogs: serverSideFetchedTimeLogs,
  fetchedFrom: serverSideFetchedFrom,
  limits: serverSideFetchedLimits,
  controlValues: serverSideFetchedControlValues,
  randomSliderHexColor: randomSliderHexColor,
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

  const { timeLogs, user, setGroupedTimeLogPeriods } = useStore(store);

  // const checkControlValue = async () => {
  //   setIsSaving(true);
  //   const response = await handleFetch({
  //     pathOrUrl: 'user/check-control-value',
  //     body: {
  //       controlValue,
  //     },
  //     method: 'POST',
  //   });
  //   if (response.statusCode === StatusCodes.CREATED) {
  //     setIsSaving(false);
  //     return;
  //   } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
  //     setUser(undefined);
  //     if (refreshIntervalId) {
  //       clearInterval(refreshIntervalId);
  //       setRefreshIntervalId(undefined);
  //     }
  //   } else if (response.statusCode === StatusCodes.CONFLICT) {
  //     return fetchExtendedUser();
  //   }
  //   setIsSaving(false);
  //   return;
  // };
  //
  // const fetchExtendedUser = async () => {
  //   setIsSaving(true);
  //   const response = await handleFetch({
  //     pathOrUrl: 'user/me-extended',
  //     body: {
  //       extend: [
  //         MeExtendedOption.CATEGORIES,
  //         MeExtendedOption.CATEGORIES_LIMIT,
  //         MeExtendedOption.NOTES,
  //       ],
  //     },
  //     method: 'POST',
  //   });
  //   if (response.statusCode === StatusCodes.CREATED && response?.user) {
  //     setUser(response.user);
  //     setCategories(response.user?.categories ?? []);
  //     setControlValue(response.user?.controlValue);
  //   } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
  //     setUser(undefined);
  //     if (refreshIntervalId) {
  //       clearInterval(refreshIntervalId);
  //       setRefreshIntervalId(undefined);
  //     }
  //   }
  //   setIsSaving(false);
  //   return;
  // };

  // useEffect(() => {
  //   if (timeLogs) {
  //     const timeLogsWithinActiveDate = findTimeLogsWithinCurrentPeriod({
  //       allTimeLogs: timeLogs,
  //       userTimezone: Timezones[user.timezone],
  //       fromDate: activeDate.c,
  //       toDate: activeDate.c,
  //       categories: user.categories,
  //     }) as TimeLogWithinCurrentPeriod[];
  //
  //     setGroupedTimeLogsWithDateSorted(
  //       getGroupedTimeLogsWithDateSorted(timeLogsWithinActiveDate)
  //     );
  //   }
  // }, [activeDate?.ts, timeLogs]);
  //
  // const checkActiveDateCorrectness = () => {
  //   const currentDate = getCurrentDate(Timezones[user.timezone]);
  //   if (currentDate.ts === activeDate.ts) {
  //     return true;
  //   }
  //   setActiveDate(currentDate);
  //   return false;
  // };

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     checkActiveDateCorrectness();
  //   }, 1000);
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);

  useEffect(() => {
    setGroupedTimeLogPeriods(createGroupedTimeLogPeriods(user, timeLogs));
    const intervalIdLocal = setInterval(() => {
      setGroupedTimeLogPeriods(createGroupedTimeLogPeriods(user, timeLogs));
    }, 1000);
    return () => clearInterval(intervalIdLocal);
  }, [timeLogs, user.timezone]);

  return (
    <StoreContext.Provider value={store}>
      <DashboardLayout
        title={'Active Categories'}
        randomSliderHexColor={randomSliderHexColor}
      >
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
