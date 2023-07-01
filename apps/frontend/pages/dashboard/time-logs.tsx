import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
// components
// sections
import DashboardLayout from '../../layouts/dashboard';
import React, { useEffect, useState } from 'react';
import { User } from '@prisma/client';
import { DateTime } from 'luxon';
import { Timezones } from '@test1/shared';
import {
  findTimeLogsWithinCurrentPeriod,
  TimeLogWithinCurrentPeriod,
  TimeLogWithinCurrentPeriodISO,
} from '../../utils/findTimeLogsWithinCurrentPeriod';
import {
  TimeLogsWithinDate,
  TimeLogsWithinDateISO,
} from '../../types/timeLogsWithinDate';
import { deleteUndefinedFromObject } from '../../utils/deleteUndefinedFromObject';
import { deleteIfValueIsFalseFromObject } from '../../utils/deleteIfValueIsFalseFromObject';
import {
  GRAY,
  GREEN,
  LIGHT_GREEN,
  LIGHT_RED,
  LIGHT_SILVER,
  RED,
  SUPER_LIGHT_SILVER,
  ULTRA_LIGHT_GREEN,
  ULTRA_LIGHT_RED,
} from '../../consts/colors';
import Cookies from 'cookies';
import { getHexFromRGBObject } from '../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRandomRgbObjectForSliderPicker } from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import { findOrFetchTimeLogsWithinActiveDate } from '../../utils/fetchingData/findOrFetchTimeLogsWithinActiveDate';
import AppOrderTimeline from '../../sections/@dashboard/app/AppOrderTimeline';
import { getCurrentDate, getRelativeDate } from '../../utils/getCurrentDate';
import { isMobile } from 'react-device-detect';
import { getHexFromRGBAString } from '../../utils/colors/getHexFromRGBString';
import { getRgbaObjectFromHexString } from '../../utils/colors/getRgbaObjectFromHexString';

const AppNewsUpdate = dynamic(
  () => import('../../sections/@dashboard/app/AppNewsUpdate'),
  { ssr: false }
);

const AppCurrentVisits = dynamic(
  () => import('../../sections/@dashboard/app/AppCurrentVisits'),
  { ssr: false }
);
const AppWebsiteVisits = dynamic(
  () => import('../../sections/@dashboard/app/AppWebsiteVisits'),
  { ssr: false }
);
const AppTrafficBySite = dynamic(
  () => import('../../sections/@dashboard/app/AppTrafficBySite'),
  { ssr: false }
);
const AppWidgetSummary = dynamic(
  () => import('../../sections/@dashboard/app/AppWidgetSummary'),
  { ssr: false }
);
const AppCurrentSubject = dynamic(
  () => import('../../sections/@dashboard/app/AppCurrentSubject'),
  { ssr: false }
);
const AppConversionRates = dynamic(
  () => import('../../sections/@dashboard/app/AppConversionRates'),
  { ssr: false }
);
const AppTasks = dynamic(
  () => import('../../sections/@dashboard/app/AppTasks'),
  { ssr: false }
);

// ----------------------------------------------------------------------

type Props = {
  user: User;
  timeLogsWithDatesISO: TimeLogsWithinDateISO[];
  randomSliderHexColor: string;
};

export default function TimeLogs({
  user: serverSideFetchedUser,
  timeLogsWithDatesISO,
  randomSliderHexColor,
}: Props) {
  const [disableHover, setDisableHover] = useState<boolean>(true);
  useEffect(() => {
    setDisableHover(isMobile);
  }, [isMobile]);

  const [user, setUser] = useState<User>(serverSideFetchedUser);
  const [timeLogsWithinDates, setTimeLogsWithinDates] = useState<
    TimeLogsWithinDate[]
  >(
    timeLogsWithDatesISO.map((timeLogWithDatesISO) => {
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
    }) as unknown as any
  );
  const [isFetching, setIsFetching] = useState(false);
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone(Timezones[user.timezone]).set({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  );
  const [showDetails, setShowDetails] = useState(false);

  const changeDay = (numberOfDays: number) => {
    if (numberOfDays === 0) {
      return;
    }
    if (numberOfDays > 0) {
      return setActiveDate(activeDate.plus({ days: numberOfDays }));
    } else {
      return setActiveDate(activeDate.minus({ days: -numberOfDays }));
    }
  };

  const changeMonth = (numberOfMonths: number) => {
    if (numberOfMonths === 0) {
      return;
    }
    if (numberOfMonths > 0) {
      return setActiveDate(activeDate.plus({ months: numberOfMonths }));
    }
    return setActiveDate(activeDate.plus({ months: numberOfMonths }));
  };

  const [timeLogsWithinActiveDate, setTimeLogsWithinActiveDate] = useState<
    TimeLogWithinCurrentPeriod[]
  >([]);

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      setTitle(getTitle(activeDate));
      await setTimeLogsWithinActiveDate(
        await findOrFetchTimeLogsWithinActiveDate(
          activeDate.c,
          timeLogsWithinDates,
          activeDate,
          setTimeLogsWithinDates,
          user
        )
      );
      setIsFetching(false);
    })();
  }, [activeDate]);

  const getTitle = (activeDate: DateTime) => {
    const daysDifference = deleteIfValueIsFalseFromObject(
      DateTime.now()
        .setZone(Timezones[user.timezone])
        .set({
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        })
        .diff(activeDate, ['years', 'months', 'days'])
        .toObject()
    );
    const mapDaysDifferenceToText = (daysDifference: {
      years?: number;
      months?: number;
      days?: number;
    }) => {
      if (Object.keys(daysDifference).length === 0) {
        return '(Today)';
      }
      const years = daysDifference.years
        ? `${daysDifference.years} year${daysDifference.years !== 1 ? 's' : ''}`
        : undefined;

      const months = daysDifference.months
        ? `${daysDifference.months} month${
            daysDifference.months !== 1 ? 's' : ''
          }`
        : undefined;

      const days = daysDifference.days
        ? `${daysDifference.days} day${daysDifference.days !== 1 ? 's' : ''}`
        : undefined;

      return `(${[years, months, days]
        .filter((text) => !!text)
        .join(' ')} ago)`;
    };

    return `${activeDate.toLocaleString(
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
      { locale: 'en' }
    )} ${mapDaysDifferenceToText(daysDifference)}`;
  };

  const [title, setTitle] = useState(undefined);

  const theme = useTheme();

  const previousDatesButtonSx = {
    borderColor: LIGHT_RED,
    color: RED,
    '&:hover': {
      borderColor: disableHover ? LIGHT_RED : RED,
      color: RED,
      background: !disableHover && ULTRA_LIGHT_RED,
    },
  };

  const futureDatesButtonSx = {
    borderColor: LIGHT_GREEN,
    color: GREEN,
    '&:hover': {
      color: GREEN,
      borderColor: disableHover ? LIGHT_GREEN : GREEN,
      background: !disableHover && ULTRA_LIGHT_GREEN,
    },
  };

  const canSelectFutureDate = () => {
    const currentDate = getCurrentDate(Timezones[user.timezone]);
    return currentDate.ts <= activeDate.ts;
  };

  const canSelect7DaysInTheFutureDate = () => {
    const date7DaysAgo = getRelativeDate(Timezones[user.timezone], -7);
    return date7DaysAgo.ts < activeDate.ts;
  };

  const canSelectAMonthInTheFutureDate = () => {
    const dateAMonthAgo = getRelativeDate(Timezones[user.timezone], 0, -1);
    return dateAMonthAgo.ts < activeDate.ts;
  };

  return (
    <DashboardLayout
      user={user}
      setUser={setUser}
      title={'Dashboard'}
      randomSliderHexColor={randomSliderHexColor}
    >
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <Container sx={{ mt: -3 }}>
        <Grid container spacing={2} columns={1} sx={{ mt: 1 }}>
          <Grid item xs={1} sm={1} md={1}>
            <Typography
              variant="h4"
              align={'center'}
              sx={{
                mb: 1,
                mt: -3,
              }}
            >
              {title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                mt: 1,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  sx={previousDatesButtonSx}
                  onClick={() => changeDay(-1)}
                  disabled={isFetching}
                >
                  -1 day
                </Button>
                <Button
                  variant="outlined"
                  sx={futureDatesButtonSx}
                  onClick={() => changeDay(1)}
                  disabled={isFetching || canSelectFutureDate()}
                >
                  +1 day
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Button
                  variant="outlined"
                  sx={previousDatesButtonSx}
                  onClick={() => changeDay(-7)}
                  disabled={isFetching}
                >
                  -1 week
                </Button>
                <Button
                  variant="outlined"
                  sx={futureDatesButtonSx}
                  onClick={() => changeDay(7)}
                  disabled={isFetching || canSelect7DaysInTheFutureDate()}
                >
                  +1 week
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Button
                  variant="outlined"
                  sx={previousDatesButtonSx}
                  onClick={() => changeMonth(-1)}
                  disabled={isFetching}
                >
                  -1 month
                </Button>
                <Button
                  variant="outlined"
                  sx={futureDatesButtonSx}
                  onClick={() => changeMonth(1)}
                  disabled={isFetching || canSelectAMonthInTheFutureDate()}
                >
                  +1 month
                </Button>
              </Box>
            </Box>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                color: isFetching && GRAY,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  cursor: !isFetching && showDetails && 'pointer',
                  flex: 1,
                  backgroundColor: !showDetails
                    ? isFetching
                      ? LIGHT_SILVER
                      : LIGHT_GREEN
                    : isFetching
                    ? SUPER_LIGHT_SILVER
                    : ULTRA_LIGHT_GREEN,
                  border: `1px solid ${
                    isFetching ? LIGHT_SILVER : LIGHT_GREEN
                  }`,
                  borderTopLeftRadius: '12px',
                  borderBottomLeftRadius: '12px',
                }}
                onClick={() =>
                  !isFetching && showDetails && setShowDetails(false)
                }
              >
                <Typography variant="subtitle2" noWrap sx={{ p: 1 }}>
                  Summary
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  cursor: !isFetching && !showDetails && 'pointer',
                  flex: 1,
                  backgroundColor: showDetails
                    ? isFetching
                      ? LIGHT_SILVER
                      : LIGHT_GREEN
                    : isFetching
                    ? SUPER_LIGHT_SILVER
                    : ULTRA_LIGHT_GREEN,
                  border: `1px solid ${
                    isFetching ? LIGHT_SILVER : LIGHT_GREEN
                  }`,
                  borderTopRightRadius: '12px',
                  borderBottomRightRadius: '12px',
                }}
                onClick={() =>
                  !isFetching && !showDetails && setShowDetails(true)
                }
              >
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ p: 1, lineHeight: 0.8 }}
                  align="right"
                >
                  Details
                  <br />
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: 12,
                      color: getHexFromRGBObject(
                        getColorShadeBasedOnSliderPickerSchema(
                          getRgbaObjectFromHexString(
                            getHexFromRGBAString(GREEN)
                          )
                        )
                      ),
                    }}
                  >
                    (edit data)
                  </span>
                </Typography>
              </Box>
            </Card>
            <AppOrderTimeline
              key={'timeLogs'}
              user={user}
              timeLogsWithinActiveDate={timeLogsWithinActiveDate}
              showDetails={showDetails}
            />
          </Grid>
          {/*<Grid item xs={12} md={6} lg={8}>*/}
          {/*  <AppWebsiteVisits*/}
          {/*    title="Website Visits"*/}
          {/*    subheader="(+43%) than last year"*/}
          {/*    chartLabels={[*/}
          {/*      '01/01/2003',*/}
          {/*      '02/01/2003',*/}
          {/*      '03/01/2003',*/}
          {/*      '04/01/2003',*/}
          {/*      '05/01/2003',*/}
          {/*      '06/01/2003',*/}
          {/*      '07/01/2003',*/}
          {/*      '08/01/2003',*/}
          {/*      '09/01/2003',*/}
          {/*      '10/01/2003',*/}
          {/*      '11/01/2003',*/}
          {/*    ]}*/}
          {/*    chartData={[*/}
          {/*      {*/}
          {/*        name: 'Team A',*/}
          {/*        type: 'column',*/}
          {/*        fill: 'solid',*/}
          {/*        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],*/}
          {/*      },*/}
          {/*      {*/}
          {/*        name: 'Team B',*/}
          {/*        type: 'area',*/}
          {/*        fill: 'gradient',*/}
          {/*        data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],*/}
          {/*      },*/}
          {/*      {*/}
          {/*        name: 'Team C',*/}
          {/*        type: 'line',*/}
          {/*        fill: 'solid',*/}
          {/*        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],*/}
          {/*      },*/}
          {/*    ]}*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid item xs={12} md={6} lg={4}>*/}
          {/*  <AppCurrentVisits*/}
          {/*    title="Current Visits"*/}
          {/*    chartData={[*/}
          {/*      { label: 'America', value: 4344 },*/}
          {/*      { label: 'Asia', value: 5435 },*/}
          {/*      { label: 'Europe', value: 1443 },*/}
          {/*      { label: 'Africa', value: 4443 },*/}
          {/*    ]}*/}
          {/*    chartColors={[*/}
          {/*      theme.palette.primary.main,*/}
          {/*      theme.palette.info.main,*/}
          {/*      theme.palette.warning.main,*/}
          {/*      theme.palette.error.main,*/}
          {/*    ]}*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid item xs={12} md={6} lg={8}>*/}
          {/*  <AppConversionRates*/}
          {/*    title="Conversion Rates"*/}
          {/*    subheader="(+43%) than last year"*/}
          {/*    chartData={[*/}
          {/*      { label: 'Italy', value: 400 },*/}
          {/*      { label: 'Japan', value: 430 },*/}
          {/*      { label: 'China', value: 448 },*/}
          {/*      { label: 'Canada', value: 470 },*/}
          {/*      { label: 'France', value: 540 },*/}
          {/*      { label: 'Germany', value: 580 },*/}
          {/*      { label: 'South Korea', value: 690 },*/}
          {/*      { label: 'Netherlands', value: 1100 },*/}
          {/*      { label: 'United States', value: 1200 },*/}
          {/*      { label: 'United Kingdom', value: 1380 },*/}
          {/*    ]}*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid item xs={12} md={6} lg={4}>*/}
          {/*  <AppCurrentSubject*/}
          {/*    title="Current Subject"*/}
          {/*    chartLabels={[*/}
          {/*      'English',*/}
          {/*      'History',*/}
          {/*      'Physics',*/}
          {/*      'Geography',*/}
          {/*      'Chinese',*/}
          {/*      'Math',*/}
          {/*    ]}*/}
          {/*    chartData={[*/}
          {/*      { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },*/}
          {/*      { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },*/}
          {/*      { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },*/}
          {/*    ]}*/}
          {/*    chartColors={[...Array(6)].map(*/}
          {/*      () => theme.palette.text.secondary*/}
          {/*    )}*/}
          {/*  />*/}
          {/*</Grid>*/}

          {/*<Grid item xs={12} md={6} lg={8}>*/}
          {/*  <AppNewsUpdate*/}
          {/*    title="News Update"*/}
          {/*    list={[...Array(5)].map((_, index) => ({*/}
          {/*      id: faker.datatype.uuid(),*/}
          {/*      title: faker.name.jobTitle(),*/}
          {/*      description: faker.name.jobTitle(),*/}
          {/*      image: `/assets/images/covers/cover_${index + 1}.jpg`,*/}
          {/*      postedAt: faker.date.recent(),*/}
          {/*    }))}*/}
          {/*  />*/}
          {/*</Grid>*/}
        </Grid>
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);
  const jwt_token = cookies.get('jwt_token');

  let user;
  try {
    const responseUser = await fetch(
      process.env.NEXT_PUBLIC_API_URL + 'user/me',
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          authorization: `Bearer ${jwt_token}`,
        },
      }
    );
    user = (await responseUser.json()).user;
  } catch (e) {
    console.log(e);
    cookies.set('jwt_token');
  }

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

  let allTimeLogs = [];
  let categories = [];

  const now = DateTime.now().setZone(Timezones[user.timezone]);
  const to = { month: now.month, year: now.year, day: now.day };
  const sevenDaysAgo = now.minus({ days: 1 });
  const from = {
    month: sevenDaysAgo.month,
    year: sevenDaysAgo.year,
    day: sevenDaysAgo.day,
  };

  try {
    const responseTimeLogs = await fetch(
      process.env.NEXT_PUBLIC_API_URL + 'time-log/find-extended',
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          authorization: `Bearer ${jwt_token}`,
        },
        body: JSON.stringify({ from, to }),
      }
    );
    const response = await responseTimeLogs.json();
    allTimeLogs = response?.timeLogs ?? [];
    categories = response?.categories ?? [];
  } catch (e) {
    console.log(e);
  }

  const timeLogsWithDates = [] as TimeLogsWithinDateISO[];

  for (let i = 0; i <= 0; i++) {
    const nDaysAgo = i > 0 ? now.minus({ days: i }) : now;
    const date = {
      month: nDaysAgo.month,
      year: nDaysAgo.year,
      day: nDaysAgo.day,
    };
    timeLogsWithDates.push({
      date,
      timeLogsExtended: findTimeLogsWithinCurrentPeriod({
        allTimeLogs,
        userTimezone: Timezones[user.timezone],
        fromDate: date,
        categories,
        options: { asIso: true },
      }) as TimeLogWithinCurrentPeriodISO[],
    });
  }

  return {
    props: {
      user: user,
      timeLogsWithDatesISO: deleteUndefinedFromObject(timeLogsWithDates),
      randomSliderHexColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
    },
  };
};
