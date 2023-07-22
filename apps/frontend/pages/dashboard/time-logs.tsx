import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Grid } from '@mui/material';
// components
// sections
import DashboardLayout from '../../layouts/dashboard';
import React, { useEffect, useState } from 'react';
import { Category, TimeLog, User } from '@prisma/client';
import { DateTime } from 'luxon';
import { MeExtendedOption, Timezones } from '@test1/shared';
import { deleteUndefinedFromObject } from '../../utils/deleteUndefinedFromObject';
import Cookies from 'cookies';
import { getHexFromRGBObject } from '../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRandomRgbObjectForSliderPicker } from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import { isMobile } from 'react-device-detect';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
const { RangePicker } = DatePicker;

// ----------------------------------------------------------------------

type Props = {
  timeLogs: TimeLog[];
  categories: Category[];
  randomSliderHexColor: string;
  fetchedPeriods: {
    from: { year: number; month: number; day: number };
    to: { year: number; month: number; day: number };
  }[];
  user: User;
};

export default function TimeLogs({
  timeLogs: serverSideFetchedTimeLogs,
  categories: serverSideFetchedCategories,
  user: serverSideFetchedUser,
  fetchedPeriods,
  randomSliderHexColor,
}: Props) {
  const [disableHover, setDisableHover] = useState<boolean>(true);
  useEffect(() => {
    setDisableHover(isMobile);
  }, [isMobile]);
  const [user, setUser] = useState<User>(serverSideFetchedUser);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeDate, setActiveDate] = useState<DateTime>(
    DateTime.now().setZone(Timezones[user.timezone])
  );
  const [controlValue, setControlValue] = useState(user.controlValue);
  const [isEditing, setIsEditing] = useState({});

  // const refreshTimeLogs = async () => {
  //   setIsFetching(true);
  //   console.log(88888);
  //   await setTimeLogsWithinActiveDate(
  //     await findOrFetchTimeLogsWithinActiveDate(
  //       activeDate.c,
  //       [],
  //       activeDate,
  //       setTimeLogsWithinDates,
  //       user
  //     )
  //   );
  //   setIsFetching(false);
  // };
  //
  // useEffect(() => {
  //   (async () => {
  //     setIsFetching(true);
  //     await setTimeLogsWithinActiveDate(
  //       await findOrFetchTimeLogsWithinActiveDate(
  //         activeDate.c,
  //         timeLogsWithinDates,
  //         activeDate,
  //         setTimeLogsWithinDates,
  //         user
  //       )
  //     );
  //     setIsFetching(false);
  //   })();
  // }, [activeDate]);

  const [today] = useState(dayjs().tz(Timezones[user.timezone]));
  const [range, setRange] = useState([
    dayjs('2015/01/01', 'YYYY/MM/DD'),
    dayjs('2015/01/01', 'YYYY/MM/DD'),
  ]);

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
            {JSON.stringify(today)}
            {/*{JSON.stringify(dayjs.tz.guess())}*/}
            <RangePicker
              size={'large'}
              value={range}
              setValue={setRange}
              format={'YYYY/MM/DD'}
            />
            {JSON.stringify(range)}
            {/*<Card*/}
            {/*  sx={{*/}
            {/*    display: 'flex',*/}
            {/*    flexDirection: 'row',*/}
            {/*    justifyContent: 'space-between',*/}
            {/*    color: isFetching && GRAY,*/}
            {/*    mb: 2,*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <Box*/}
            {/*    sx={{*/}
            {/*      position: 'relative',*/}
            {/*      cursor: !isFetching && showDetails && 'pointer',*/}
            {/*      flex: 1,*/}
            {/*      backgroundColor: !showDetails*/}
            {/*        ? isFetching*/}
            {/*          ? LIGHT_SILVER*/}
            {/*          : LIGHT_ORANGE*/}
            {/*        : isFetching*/}
            {/*        ? SUPER_LIGHT_SILVER*/}
            {/*        : ULTRA_LIGHT_ORANGE,*/}
            {/*      border: `1px solid ${*/}
            {/*        isFetching ? LIGHT_SILVER : LIGHT_ORANGE*/}
            {/*      }`,*/}
            {/*      borderTopLeftRadius: '12px',*/}
            {/*      borderBottomLeftRadius: '12px',*/}
            {/*    }}*/}
            {/*    onClick={() =>*/}
            {/*      !isFetching && showDetails && setShowDetails(false)*/}
            {/*    }*/}
            {/*  >*/}
            {/*    <Typography variant="subtitle2" noWrap sx={{ p: 1 }}>*/}
            {/*      Summary*/}
            {/*    </Typography>*/}
            {/*  </Box>*/}
            {/*  <Box*/}
            {/*    sx={{*/}
            {/*      position: 'relative',*/}
            {/*      cursor: !isFetching && !showDetails && 'pointer',*/}
            {/*      flex: 1,*/}
            {/*      backgroundColor: showDetails*/}
            {/*        ? isFetching*/}
            {/*          ? LIGHT_SILVER*/}
            {/*          : LIGHT_ORANGE*/}
            {/*        : isFetching*/}
            {/*        ? SUPER_LIGHT_SILVER*/}
            {/*        : ULTRA_LIGHT_ORANGE,*/}
            {/*      border: `1px solid ${*/}
            {/*        isFetching ? LIGHT_SILVER : LIGHT_ORANGE*/}
            {/*      }`,*/}
            {/*      borderTopRightRadius: '12px',*/}
            {/*      borderBottomRightRadius: '12px',*/}
            {/*    }}*/}
            {/*    onClick={() =>*/}
            {/*      !isFetching && !showDetails && setShowDetails(true)*/}
            {/*    }*/}
            {/*  >*/}
            {/*    <Typography*/}
            {/*      variant="subtitle2"*/}
            {/*      noWrap*/}
            {/*      sx={{ p: 1, lineHeight: 0.8 }}*/}
            {/*      align="right"*/}
            {/*    >*/}
            {/*      Details*/}
            {/*      <br />*/}
            {/*      <span*/}
            {/*        style={{*/}
            {/*          fontWeight: 400,*/}
            {/*          fontSize: 12,*/}
            {/*          color: getHexFromRGBObject(*/}
            {/*            getColorShadeBasedOnSliderPickerSchema(*/}
            {/*              getRgbaObjectFromHexString(*/}
            {/*                getHexFromRGBAString(ORANGE)*/}
            {/*              )*/}
            {/*            )*/}
            {/*          ),*/}
            {/*        }}*/}
            {/*      >*/}
            {/*        (edit data)*/}
            {/*      </span>*/}
            {/*    </Typography>*/}
            {/*  </Box>*/}
            {/*</Card>*/}
            {/*<BrowseTimeLogs*/}
            {/*  key={`timeLogs-${showDetails ? 'details' : 'summary'}`}*/}
            {/*  refreshTimeLogs={refreshTimeLogs}*/}
            {/*  user={user}*/}
            {/*  timeLogsWithinActiveDate={timeLogsWithinActiveDate}*/}
            {/*  showDetails={showDetails}*/}
            {/*  isEditing={isEditing}*/}
            {/*  setIsEditing={setIsEditing}*/}
            {/*  categories={categories}*/}
            {/*  controlValue={controlValue}*/}
            {/*  setControlValue={setControlValue}*/}
            {/*  disableHover={disableHover}*/}
            {/*  isSaving={isSaving}*/}
            {/*  setIsSaving={setIsSaving}*/}
            {/*/>*/}
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);
  const jwt_token = cookies.get('jwt_token');
  //new Map<string, Category>();
  let user;
  const categories = [];
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
          extend: [MeExtendedOption.CATEGORIES],
        }),
      }
    );
    user = (await responseUser.json()).user;
    user.categories.forEach(
      (category) => categories.push(category) //.set(category.id, category)
    );
    delete user.categories;
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

  const timeLogs = []; //new Map<string, TimeLog>();
  const now = DateTime.now().setZone(Timezones[user.timezone]);
  const to = { year: now.year, month: now.month, day: now.day };
  const sevenDaysAgo = now.minus({ days: 7 });
  const from = {
    year: sevenDaysAgo.year,
    month: sevenDaysAgo.month,
    day: sevenDaysAgo.day,
  };
  const fetchedPeriods = [{ from, to }];
  try {
    const responseTimeLogs = await fetch(
      process.env.NEXT_PUBLIC_API_URL + 'time-log/find-extended',
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          authorization: `Bearer ${jwt_token}`,
        },
        body: JSON.stringify({
          from,
          to,
          alreadyKnownCategories: Object.keys(categories), //getMapKeysAsSet(categories),
        }),
      }
    );
    const response = await responseTimeLogs.json();
    (response?.timeLogs ?? []).forEach((timeLog) => timeLogs.push(timeLog));
    //   fetchedTimeLogs.set(timeLog.id, timeLog)
    // );
    (response?.categories ?? []).forEach((category) =>
      categories.push(category)
    );
    //   .forEach((category) =>
    //   categories.set(category.id, category)
    // );
  } catch (e) {
    console.log(e);
  }

  return {
    props: {
      user: user,
      timeLogs: deleteUndefinedFromObject(timeLogs),
      categories: deleteUndefinedFromObject(categories),
      fetchedPeriods,
      randomSliderHexColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
    },
  };
};
