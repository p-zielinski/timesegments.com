import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import Iconify from '../../components/iconify';
import { faker } from '@faker-js/faker';
// components
// sections
import DashboardLayout from '../../layouts/dashboard';
import { useEffect, useState } from 'react';
import { refreshToken } from '../../utils/refreshToken';
import { User } from '@prisma/client';
import { DateTime } from 'luxon';
import { Timezones } from '@test1/shared';
import { DisplayTimeLogsWithCurrentDate } from '../../sections/@dashboard/DisplayTimeLogsWithCurrentDate';
import {
  findTimeLogsWithinCurrentPeriod,
  TimeLogWithinCurrentPeriodISO,
} from '../../utils/findTimeLogsWithinCurrentPeriod';
import {
  TimeLogsWithinDate,
  TimeLogsWithinDateISO,
} from '../../types/timeLogsWithinDate';
import { deleteUndefinedFromObject } from '../../utils/deleteUndefinedFromObject';

const AppNewsUpdate = dynamic(
  () => import('../../sections/@dashboard/app/AppNewsUpdate'),
  { ssr: false }
);
const AppOrderTimeline = dynamic(
  () => import('../../sections/@dashboard/app/AppOrderTimeline'),
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
};

export default function Index({
  user: serverSideFetchedUser,
  timeLogsWithDatesISO,
}: Props) {
  const [user, setUser] = useState<User>(serverSideFetchedUser);
  const [timeLogsWithDates, setTimeLogsWithDates] = useState<
    TimeLogsWithinDate[]
  >(
    timeLogsWithDatesISO.map((timeLogWithDatesISO) => {
      return {
        date: timeLogWithDatesISO.date,
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
    }) as unknown as TimeLogsWithinDate[]
  );
  const [isFetched, setIsFetched] = useState(true);
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone(Timezones[user.timezone])
  );

  useEffect(() => {
    refreshToken();
  }, []);

  const theme = useTheme();

  return (
    <DashboardLayout user={user} setUser={setUser}>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <DisplayTimeLogsWithCurrentDate
          user={user}
          timeLogsWithDates={timeLogsWithDates}
          setTimeLogsWithDates={setTimeLogsWithDates}
          setIsFetched={setIsFetched}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
        />
        <Grid container spacing={3}>
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

          <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="Today"
              list={[...Array(50)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  '1983, orders, $4220',
                  '12 Invoices have been paid',
                  'Order #37745 from September',
                  'New order placed #XF-2356',
                  'New order placed #XF-2346',
                ][index % 5],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
              subheader={undefined}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4} sx={{ gap: 2 }}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'FaceBook',
                  value: 323234,
                  icon: (
                    <Iconify
                      icon={'eva:facebook-fill'}
                      color="#1877F2"
                      width={32}
                    />
                  ),
                },
                {
                  name: 'Google',
                  value: 341212,
                  icon: (
                    <Iconify
                      icon={'eva:google-fill'}
                      color="#DF3E30"
                      width={32}
                    />
                  ),
                },
                {
                  name: 'Linkedin',
                  value: 411213,
                  icon: (
                    <Iconify
                      icon={'eva:linkedin-fill'}
                      color="#006097"
                      width={32}
                    />
                  ),
                },
                {
                  name: 'Twitter',
                  value: 443232,
                  icon: (
                    <Iconify
                      icon={'eva:twitter-fill'}
                      color="#1C9CEA"
                      width={32}
                    />
                  ),
                },
              ]}
              subheader={undefined}
            />
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
              subheader={undefined}
            />
          </Grid>
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
        timezone: Timezones[user.timezone],
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
