import {Container} from '@mui/material'; // hooks
import React, {useEffect, useState} from 'react';
import {
  ControlValue,
  DatePeriod,
  Limits,
  MeExtendedOption,
  Timezones,
  UserWithCategories,
  UserWithCategoriesAndNotes,
} from '@test1/shared';
import DashboardLayout from '../../layouts/dashboard';
import {isMobile} from 'react-device-detect';
import {handleFetch} from '../../utils/fetchingData/handleFetch';
import {StatusCodes} from 'http-status-codes';
import Cookies from 'cookies';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import {getColorShadeBasedOnSliderPickerSchema} from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../utils/colors/getHexFromRGBObject';
import {Category, Note, TimeLog} from '@prisma/client';
import {findTimeLogsWithinCurrentPeriod, TimeLogWithinCurrentPeriod,} from '../../utils/findTimeLogsWithinCurrentPeriod';
import {DateTime} from 'luxon';
import {deleteUndefinedFromObject} from '../../utils/deleteUndefinedFromObject';
import Categories from '../../sections/@dashboard/categories';
import {getGroupedTimeLogsWithDateSorted} from '../../utils/mapper/getGroupedTimeLogsWithDateSorted';
import {getCurrentDate} from '../../utils/getCurrentDate';
// ---------------------------------------------------------------------

const getTimeLogsWithinDatesFromIsoType = (timeLogsWithDatesISO) => {
  return timeLogsWithDatesISO.map((timeLogWithDatesISO) => {
    return {
      date: DateTime.fromObject(timeLogWithDatesISO.date),
      timeLogsExtended: timeLogWithDatesISO.timeLogsExtended.map(
        (timeLogExtended) => {
          return {
            ...timeLogExtended,
            startedAt: DateTime.fromISO(timeLogExtended.startedAt),
            endedAt: timeLogExtended.ended
              ? DateTime.fromISO(timeLogExtended.endedAt)
              : undefined,
            isIsoString: false,
          };
        }
      ),
    };
  }) as unknown as any;
};

type Props = {
  user: UserWithCategories;
  limits: Limits;
  notes: Note[];
  timeLogs: TimeLog[];
  randomSliderHexColor: string;
  controlValues: Record<ControlValue, string>;
  fetchedPeriods: { from: number; to: number }[];
};

export default function Index({
  user: serverSideFetchedUserWithCategoriesAndCategoriesNotes,
  limits: serverSideFetchedLimits,
  notes: serverSideFetchedNotes,
  randomSliderHexColor: randomSliderHexColor,
  timeLogs: serverSideFetchedTimeLogs,
  fetchedPeriods: serverSideFetchedPeriods,
  controlValues: serverSideFetchedControlValues,
}: Props) {
  const [user, setUser] = useState<UserWithCategories>(
    serverSideFetchedUserWithCategoriesAndCategoriesNotes
  );
  const [disableHover, setDisableHover] = useState<boolean>(true);
  useEffect(() => {
    setDisableHover(isMobile);
  }, [isMobile]);
  const [controlValues, setControlValues] = useState(
    new Map<ControlValue, string>()
  );
  useEffect(() => {
    const newControlValuesMap = new Map();
    Object(ControlValue).values.forEach((value) =>
      newControlValuesMap.set(value, serverSideFetchedControlValues?.[value])
    );
    setControlValues(newControlValuesMap);
  }, []);

  const [timeLogs, setTimeLogs] = useState(serverSideFetchedTimeLogs);
  const [fetchedPeriods, setFetchedPeriods] = useState<DatePeriod[]>(
    serverSideFetchedPeriods
  );

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
          MeExtendedOption.CATEGORIES_LIMIT,
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
  const [categories, setCategories] = useState<Category[]>(
    user?.categories || []
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [groupedTimeLogsWithDateSorted, setGroupedTimeLogsWithDateSorted] =
    useState([]);

  useEffect(() => {
    if (timeLogs) {
      const timeLogsWithinActiveDate = findTimeLogsWithinCurrentPeriod({
        allTimeLogs: timeLogs,
        userTimezone: Timezones[user.timezone],
        fromDate: activeDate.c,
        toDate: activeDate.c,
        categories: user.categories,
      }) as TimeLogWithinCurrentPeriod[];

      setGroupedTimeLogsWithDateSorted(
        getGroupedTimeLogsWithDateSorted(timeLogsWithinActiveDate)
      );
    }
  }, [activeDate?.ts, timeLogs]);

  const checkActiveDateCorrectness = () => {
    const currentDate = getCurrentDate(Timezones[user.timezone]);
    if (currentDate.ts === activeDate.ts) {
      return true;
    }
    setActiveDate(currentDate);
    return false;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkActiveDateCorrectness();
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <DashboardLayout
      user={user}
      setUser={setUser}
      title={'Active Categories'}
      randomSliderHexColor={randomSliderHexColor}
    >
      <Container sx={{ mt: -5 }}>
        <Categories
          groupedTimeLogsWithDateSorted={groupedTimeLogsWithDateSorted}
          timeLogs={timeLogs}
          setTimeLogs={setTimeLogs}
          categories={categories}
          setCategories={setCategories}
          limits={limits}
          controlValue={controlValue}
          setControlValue={setControlValue}
          user={user}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          disableHover={disableHover}
        />
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);
  const jwt_token = cookies.get('jwt_token');
  let userWithCategoriesAndCategoriesNotes: UserWithCategoriesAndNotes,
    limits: Limits,
    timeLogs: TimeLog[],
    controlValues: Record<ControlValue, string>,
    fetchedPeriods: DatePeriod[];

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
              MeExtendedOption.CATEGORIES_NOTES,
              MeExtendedOption.CATEGORIES_LIMIT,
              MeExtendedOption.NOTES_PER_CATEGORY_LIMIT,
              MeExtendedOption.TODAYS_TIMELOGS,
            ],
          }),
        }
      );
      const response = await responseUser.json();
      userWithCategoriesAndCategoriesNotes = response.user;
      limits = response.limits;
      timeLogs = response.timeLogs;
      controlValues = response.controlValues;
      fetchedPeriods = response.fetchedPeriods;
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

  if (!userWithCategoriesAndCategoriesNotes) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      user: userWithCategoriesAndCategoriesNotes ?? null,
      limits: limits ?? null,
      randomSliderHexColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
      timeLogs: deleteUndefinedFromObject(timeLogs) || [],
      fetchedPeriods,
      controlValues,
    },
  };
};
