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
import { Test } from '../../sections/@dashboard/test';
import { User } from '@prisma/client';

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
};

export default function Index({ user: serverSideFetchedUser }: Props) {
  const [user, setUser] = useState<User>(serverSideFetchedUser);

  useEffect(() => {
    refreshToken();
  }, []);

  const theme = useTheme();

  return (
    <DashboardLayout user={{ email: 'random@email' }} setUser={setUser}>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Test
          from={{
            day: 22,
            month: 2,
            year: 2023,
          }}
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
              list={
                [] ||
                [...Array(50)].map((_, index) => ({
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
                }))
              }
              subheader={undefined}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
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
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
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

  let responseUser;
  try {
    responseUser = await fetch(process.env.NEXT_PUBLIC_API_URL + 'user/me', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        jwt_token,
      },
    });
  } catch (e) {
    console.log(e);
  }
  let user;
  try {
    const response = await responseUser.json();
    user = response.user;
  } catch (e) {
    console.log(e);
  }

  return {
    props: { user: user ?? null },
  };
};