import {Helmet} from 'react-helmet-async';
// @mui
import {Box, Card, Container, Grid, Typography} from '@mui/material';
// components
// sections
import DashboardLayout from '../../layouts/dashboard';
import React, {useEffect, useState} from 'react';
import {Category, TimeLog, User} from '@prisma/client';
import {DateTime} from 'luxon';
import {MeExtendedOption, Timezones} from '@test1/shared';
import {TimeLogWithinCurrentPeriod} from '../../utils/findTimeLogsWithinCurrentPeriod';
import {TimeLogsWithinDate, TimeLogsWithinDateISO,} from '../../types/timeLogsWithinDate';
import {deleteUndefinedFromObject} from '../../utils/deleteUndefinedFromObject';
import {GRAY, LIGHT_ORANGE, LIGHT_SILVER, ORANGE, SUPER_LIGHT_SILVER, ULTRA_LIGHT_ORANGE,} from '../../consts/colors';
import Cookies from 'cookies';
import {getHexFromRGBObject} from '../../utils/colors/getHexFromRGBObject';
import {getColorShadeBasedOnSliderPickerSchema} from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import {findOrFetchTimeLogsWithinActiveDate} from '../../utils/fetchingData/findOrFetchTimeLogsWithinActiveDate';
import BrowseTimeLogs from '../../sections/@dashboard/app/BrowseTimeLogs';
import {isMobile} from 'react-device-detect';
import {getHexFromRGBAString} from '../../utils/colors/getHexFromRGBString';
import {getRgbaObjectFromHexString} from '../../utils/colors/getRgbaObjectFromHexString';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterLuxon} from '@mui/x-date-pickers/AdapterLuxon';
import Calendar from '../../sections/@dashboard/browse/Calendar';
import {getMapKeysAsSet} from '../../utils/getMapKeysAsSet';

// ----------------------------------------------------------------------

type Props = {
  user: User;
  timeLogsWithDatesISO: TimeLogsWithinDateISO[];
  randomSliderHexColor: string;
  categories: Category[];
};

export default function TimeLogs({
  user: serverSideFetchedUser,
  timeLogsWithDatesISO,
  randomSliderHexColor,
  categories,
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
  const [activeDate, setActiveDate] = useState<DateTime>(
    DateTime.now().setZone(Timezones[user.timezone]).set({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  );
  const [showDetails, setShowDetails] = useState(false);

  const [timeLogsWithinActiveDate, setTimeLogsWithinActiveDate] = useState<
    TimeLogWithinCurrentPeriod[]
  >([]);

  const refreshTimeLogs = async () => {
    setIsFetching(true);
    console.log(88888);
    await setTimeLogsWithinActiveDate(
      await findOrFetchTimeLogsWithinActiveDate(
        activeDate.c,
        [],
        activeDate,
        setTimeLogsWithinDates,
        user
      )
    );
    setIsFetching(false);
  };

  useEffect(() => {
    (async () => {
      setIsFetching(true);
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

  const [isEditing, setIsEditing] = useState({});

  const [controlValue, setControlValue] = useState(user.controlValue);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
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
              <Calendar
                activeDate={activeDate}
                setActiveDate={setActiveDate}
                disabled={isFetching}
              />
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
                        : LIGHT_ORANGE
                      : isFetching
                      ? SUPER_LIGHT_SILVER
                      : ULTRA_LIGHT_ORANGE,
                    border: `1px solid ${
                      isFetching ? LIGHT_SILVER : LIGHT_ORANGE
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
                        : LIGHT_ORANGE
                      : isFetching
                      ? SUPER_LIGHT_SILVER
                      : ULTRA_LIGHT_ORANGE,
                    border: `1px solid ${
                      isFetching ? LIGHT_SILVER : LIGHT_ORANGE
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
                              getHexFromRGBAString(ORANGE)
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
              <BrowseTimeLogs
                key={`timeLogs-${showDetails ? 'details' : 'summary'}`}
                refreshTimeLogs={refreshTimeLogs}
                user={user}
                timeLogsWithinActiveDate={timeLogsWithinActiveDate}
                showDetails={showDetails}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                categories={categories}
                controlValue={controlValue}
                setControlValue={setControlValue}
                disableHover={disableHover}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
              />
            </Grid>
          </Grid>
        </Container>
      </DashboardLayout>
    </LocalizationProvider>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);
  const jwt_token = cookies.get('jwt_token');

  let user;
  const categories = new Map<string, Category>();
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
    user.categories.forEach((category) =>
      categories.set(category.id, category)
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

  const fetchedTimeLogs = new Map<string, TimeLog>();
  const now = DateTime.now().setZone(Timezones[user.timezone]);
  const to = { month: now.month, year: now.year, day: now.day };
  const sevenDaysAgo = now.minus({ days: 7 });
  const from = {
    month: sevenDaysAgo.month,
    year: sevenDaysAgo.year,
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
          alreadyKnownCategories: getMapKeysAsSet(categories),
        }),
      }
    );
    const response = await responseTimeLogs.json();
    (response?.timeLogs ?? []).forEach((timeLog) =>
      fetchedTimeLogs.set(timeLog.id, timeLog)
    );
    (response?.categories ?? []).forEach((category) =>
      categories.set(category.id, category)
    );
  } catch (e) {
    console.log(e);
  }

  return {
    props: {
      user: user,
      fetchedTimeLogs: deleteUndefinedFromObject(fetchedTimeLogs),
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
