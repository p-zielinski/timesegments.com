import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import dynamic from 'next/dynamic';
// components
// sections
import DashboardLayout from '../../layouts/dashboard';
import React, { useEffect, useState } from 'react';
import { User } from '@prisma/client';
import { DateTime } from 'luxon';
import { FromToDate, Timezones } from '@test1/shared';
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
import { handleFetch } from '../../utils/handleFetch';
import {
  GREEN,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
  ULTRA_LIGHT_GREEN,
  ULTRA_LIGHT_RED,
} from '../../consts/colors';
import Cookies from 'cookies';

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
const AppOrderTimeline = dynamic(
  () => import('../../sections/@dashboard/app/AppOrderTimeline'),
  { ssr: false }
);

// ----------------------------------------------------------------------

type Props = {
  user: User;
  timeLogsWithDatesISO: TimeLogsWithinDateISO[];
};

export default function Index({
  user: serverSideFetchedUser,
  timeLogsWithDatesISO,
}: Props) {
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
    return setActiveDate(activeDate.minus({ months: numberOfMonths }));
  };

  const [timeLogsWithinActiveDate, setTimeLogsWithinActiveDate] = useState<
    TimeLogWithinCurrentPeriod[]
  >([]);

  useEffect(() => {
    const findOrFetchTimeLogsWithinActiveDate = async (
      date: FromToDate,
      timeLogsWithinDates: TimeLogsWithinDate[]
    ): Promise<TimeLogWithinCurrentPeriod[]> => {
      const timeLogsWithinActiveDate = timeLogsWithinDates.find(
        (timeLogsWithinDate) => {
          return (
            timeLogsWithinDate.date.year === date.year &&
            timeLogsWithinDate.date.month === date.month &&
            timeLogsWithinDate.date.day === date.day
          );
        }
      )?.timeLogsExtended;
      if (timeLogsWithinActiveDate) {
        return timeLogsWithinActiveDate;
      }
      setIsFetching(true);
      //update setTimeLogsWithinDates while fetching data
      const response = await handleFetch({
        pathOrUrl: 'time-log/find-extended',
        body: { from: { ...activeDate.c }, to: { ...activeDate.c } },
        method: 'POST',
      });
      if (response.statusCode === 201) {
        const timeLogsExtendedForActiveDate = findTimeLogsWithinCurrentPeriod({
          allTimeLogs: response.timeLogs,
          userTimezone: Timezones[user.timezone],
          fromDate: activeDate.c,
          toDate: activeDate.c,
          categories: response.categories,
          subcategories: response.subcategories,
        });
        setTimeLogsWithinDates([
          ...timeLogsWithinDates,
          {
            date: activeDate.c,
            timeLogsExtended: timeLogsExtendedForActiveDate,
          },
        ] as TimeLogsWithinDate[]);
        setIsFetching(false);
        return timeLogsExtendedForActiveDate as TimeLogWithinCurrentPeriod[];
      }
      //handle error, error while fetching
      return [] as TimeLogWithinCurrentPeriod[];
    };

    setTitle(getTitle(activeDate));

    (async () => {
      setTimeLogsWithinActiveDate(
        await findOrFetchTimeLogsWithinActiveDate(
          activeDate.c,
          timeLogsWithinDates
        )
      );
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

    return `${activeDate.toLocaleString({
      day: 'numeric',
    })} ${activeDate.toLocaleString({
      month: 'long',
    })}, ${activeDate.toLocaleString({
      year: 'numeric',
    })} ${mapDaysDifferenceToText(daysDifference)}`;
  };

  const [title, setTitle] = useState(undefined);

  const theme = useTheme();

  const previousDatesButtonSx = {
    m: 1,
    borderColor: LIGHT_RED,
    color: RED,
    '&:hover': {
      borderColor: RED,
      color: RED,
      background: ULTRA_LIGHT_RED,
    },
  };

  const futureDatesButtonSx = {
    m: 1,
    borderColor: LIGHT_GREEN,
    color: GREEN,
    '&:hover': {
      borderColor: GREEN,
      color: GREEN,
      background: ULTRA_LIGHT_GREEN,
    },
  };

  return (
    <DashboardLayout user={user} setUser={setUser} title={'Dashboard'}>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            sx={previousDatesButtonSx}
            onClick={() => changeDay(-1)}
          >
            -1 day
          </Button>
          <Button
            variant="outlined"
            sx={previousDatesButtonSx}
            onClick={() => changeDay(-7)}
          >
            -1 week
          </Button>
          <Button
            variant="outlined"
            sx={previousDatesButtonSx}
            onClick={() => changeMonth(-1)}
          >
            -1 month
          </Button>
          <Button
            variant="outlined"
            sx={futureDatesButtonSx}
            onClick={() => changeDay(1)}
          >
            +1 day
          </Button>
          <Button
            variant="outlined"
            sx={futureDatesButtonSx}
            onClick={() => changeDay(7)}
          >
            +1 week
          </Button>
          <Button
            variant="outlined"
            sx={futureDatesButtonSx}
            onClick={() => changeMonth(1)}
          >
            +1 month
          </Button>
        </Box>
        <FormControlLabel
          sx={{
            m: 1,
            mb: 2,
            mt: -1,
            color: '#c97a9a',
          }}
          control={
            <Switch
              checked={showDetails}
              onChange={() => setShowDetails(!showDetails)}
              inputProps={{ 'aria-label': 'controlled' }}
              sx={{
                '& .Mui-disabled': {
                  color: '#e886a9',
                },
                '& .Mui-checked': {
                  color: '#e886a9',
                },
                '& .Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#e886a9',
                },
                '& .MuiSwitch-track': {
                  color: '#e886a9',
                  borderRadius: 22 / 2,
                  '&:before, &:after': {
                    color: '#e886a9',
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                  },
                  '&:before': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                      theme.palette.getContrastText(theme.palette.primary.main)
                    )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
                    left: 12,
                  },
                  '&:after': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                      theme.palette.getContrastText(theme.palette.primary.main)
                    )}" d="M19,13H5V11H19V13Z" /></svg>')`,
                    right: 12,
                  },
                },
              }}
            />
          }
          label="details"
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <AppOrderTimeline
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
          jwt_token,
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
    httpOnly: process.env.NODE_ENV === 'production',
    secure: false,
    sameSite: false,
    maxAge: 1000 * 60 * 60 * 24 * 400,
  });

  let allTimeLogs = [];
  let categories = [];
  let subcategories = [];

  const now = DateTime.now().setZone(Timezones[user.timezone]);
  const to = { month: now.month, year: now.year, day: now.day };
  const sevenDaysAgo = now.minus({ days: 7 });
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
          jwt_token,
        },
        body: JSON.stringify({ from, to }),
      }
    );
    const response = await responseTimeLogs.json();
    allTimeLogs = response?.timeLogs ?? [];
    categories = response?.categories ?? [];
    subcategories = response?.subcategories ?? [];
  } catch (e) {
    console.log(e);
  }

  const timeLogsWithDates = [] as TimeLogsWithinDateISO[];

  for (let i = 0; i <= 7; i++) {
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
        subcategories,
        options: { asIso: true },
      }) as TimeLogWithinCurrentPeriodISO[],
    });
  }

  return {
    props: {
      user: user,
      timeLogsWithDatesISO: deleteUndefinedFromObject(timeLogsWithDates),
    },
  };
};
