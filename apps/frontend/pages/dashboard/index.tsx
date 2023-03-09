import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
// components
// sections
import DashboardLayout from '../../layouts/dashboard';
import React, { useEffect, useState } from 'react';
import { refreshToken } from '../../utils/refreshToken';
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

  const add1Day = () => {
    setActiveDate(activeDate.minus({ days: 1 }));
  };

  const [timeLogsWithinActiveDate, setTimeLogsWithinActiveDate] = useState<
    TimeLogWithinCurrentPeriod[]
  >([]);

  useEffect(() => {
    const findTimeLogsWithinActiveDate = (
      date: FromToDate,
      timeLogsWithinDates: TimeLogsWithinDate[]
    ) => {
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
      setIsFetching(false);

      return [] as TimeLogWithinCurrentPeriod[]; //fetch from backend
    };

    setTitle(getTitle(activeDate));
    setTimeLogsWithinActiveDate(
      findTimeLogsWithinActiveDate(activeDate.c, timeLogsWithinDates)
    );
  }, [activeDate]);

  useEffect(() => {
    refreshToken();
  }, []);

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

  return (
    <DashboardLayout user={user} setUser={setUser} title={'Dashboard'}>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }} onClick={() => add1Day()}>
          {title}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <AppOrderTimeline
              user={user}
              timeLogsWithinActiveDate={timeLogsWithinActiveDate}
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

export const getServerSideProps = async (context) => {
  const { jwt_token } = context.req.cookies;

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
  }

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

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
