import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Card,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
// components
// sections
import React, { useEffect, useRef, useState } from 'react';
import { Category, TimeLog, User } from '@prisma/client';
import { DateTime } from 'luxon';
import {
  ControlValue,
  MeExtendedOption,
  TimePeriod,
  Timezones,
} from '@test1/shared';
import Cookies from 'cookies';
import { getHexFromRGBObject } from '../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRandomRgbObjectForSliderPicker } from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';
import { Formik } from 'formik';
import DatePicker from '../../components/form/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import {
  GRAY,
  IS_SAVING_HEX,
  LIGHT_ORANGE,
  LIGHT_SILVER,
  ORANGE,
  SUPER_LIGHT_SILVER,
  ULTRA_LIGHT_ORANGE,
} from '../../consts/colors';
import { getRgbaObjectFromHexString } from '../../utils/colors/getRgbaObjectFromHexString';
import { getHexFromRGBAObject } from '../../utils/colors/getHexFromRGBAObject';
import { styled } from '@mui/material/styles';
import { BpCheckbox } from '../../components/form/Checkbox';
import { createStore, StoreContext } from '../../hooks/useStore';
import { useRouter } from 'next/router';
import { useStore } from 'zustand';
import { getHexFromRGBAString } from 'apps/frontend/utils/colors/getHexFromRGBString';
import dynamic from 'next/dynamic';
import BrowseTimeLogs from '../../sections/@dashboard/app/BrowseTimeLogs';

const DashboardLayout = dynamic(() => import('../../layouts/dashboard'), {
  ssr: false,
});

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

// ----------------------------------------------------------------------

type Props = {
  user: User;
  categories: Category[];
  timeLogs: TimeLog[];
  controlValues: Record<ControlValue, string>;
  fetchedPeriods: TimePeriod[];
  randomSliderHexColor: string;
};

export default function TimeLogs({
  user: serverSideFetchedUser,
  controlValues: serverSideFetchedControlValues,
  timeLogs: serverSideFetchedTimeLogs,
  categories: serverSideFetchedCategories,
  fetchedPeriods: fetchedPeriodsStartingValue,
  randomSliderHexColor,
}: Props) {
  const beginningOfADay = DateTime.now()
    .setZone(Timezones[serverSideFetchedUser.timezone])
    .set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  const store = useRef(
    createStore({
      timeLogs: serverSideFetchedTimeLogs,
      disableHover: isMobile,
      router: useRouter(),
      user: serverSideFetchedUser,
      controlValues: serverSideFetchedControlValues,
      categories: serverSideFetchedCategories,
      fetchedPeriods: fetchedPeriodsStartingValue,
      showTimeLogsFrom: beginningOfADay.toMillis(),
      showTimeLogsTo: beginningOfADay.toMillis() + 1000 * 60 * 60 * 24,
    })
  ).current;
  const {
    user,
    isSaving,
    timeLogs,
    setShowTimeLogsFromTo,
    controlValues,
    checkControlValues,
  } = useStore(store);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkControlValues();
    }, 200 * 60 * 1000); //fix it
    return () => {
      clearInterval(intervalId);
    };
  }, [controlValues]);

  const datePickerColor = {
    hex: '#bf40b9',
    rgb: { r: 191, g: 64, b: 185, a: 1 },
  };

  let getTextFieldProps: (error, focused, disabled) => Record<string, any>,
    StyledTextField,
    darkHexColor;
  const setStyledTextField = (isSaving, hexColor) => {
    darkHexColor = getHexFromRGBObject(
      getColorShadeBasedOnSliderPickerSchema(
        getRgbaObjectFromHexString(isSaving ? IS_SAVING_HEX : hexColor)
      )
    );
    getTextFieldProps = (error, focused, disabled = false) => {
      return {
        background: 'white',
        borderRadius: '8px',
        '& input': {
          color: error ? '#FF4842' : darkHexColor,
          backgroundColor: 'white',
          borderRadius: '6px',
        },
        '& label.Mui-focused': {
          color: darkHexColor,
        },
        '& label': {
          color: error ? '#FF4842' : darkHexColor,
          backgroundColor: 'rgba(255,255,255,.5)',
          borderRadius: '6px',
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: hexColor,
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: isSaving
              ? IS_SAVING_HEX
              : error
              ? '#FF4842'
              : focused
              ? darkHexColor
              : getHexFromRGBAObject({
                  ...getRgbaObjectFromHexString(hexColor),
                  a: 0.3,
                }),
          },
          '&:hover fieldset': {
            borderColor: disabled
              ? 'rgb(232,232,232)'
              : error
              ? '#FF4842'
              : focused
              ? darkHexColor
              : hexColor,
          },
          '&.Mui-focused fieldset': {
            borderColor: hexColor,
            border: `1px solid ${darkHexColor}`,
          },
        },
      };
    };
    StyledTextField = styled(TextField)(getTextFieldProps(false, false, false));
  };
  setStyledTextField(isSaving, datePickerColor.hex);

  const [showDetails, setShowDetails] = useState(false);

  return (
    <StoreContext.Provider value={store}>
      <DashboardLayout
        title={'Time Logs'}
        randomSliderHexColor={randomSliderHexColor}
      >
        <Helmet>
          <title>Time Logs</title>
        </Helmet>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <Container sx={{ mt: -3 }}>
            <Grid container spacing={2} columns={1} sx={{ mt: -5 }}>
              <Grid item xs={1} sm={1} md={1}>
                <Formik
                  initialValues={{
                    showOnlyOneDay: true,
                    fromDate: beginningOfADay,
                    toDate: beginningOfADay,
                  }}
                  onSubmit={() => {}}
                >
                  {({
                    handleSubmit,
                    values,
                    setFieldValue,
                    errors,
                    setErrors,
                    setFieldTouched,
                  }) => {
                    // const isFormValid = getValidationSchema().isValidSync(values);
                    return (
                      <>
                        <Box sx={{ display: 'flex' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              flex: 1,
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                mb: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                if (!values.showOnlyOneDay) {
                                  const { fromDate } = values;
                                  setFieldValue('toDate', fromDate);
                                  setShowTimeLogsFromTo(
                                    fromDate.toMillis(),
                                    fromDate
                                      .set({
                                        hour: 24,
                                      })
                                      .toMillis()
                                  );
                                }
                                setFieldValue(
                                  'showOnlyOneDay',
                                  !values.showOnlyOneDay
                                );
                              }}
                            >
                              <Box sx={{ display: 'flex' }}>
                                <BpCheckbox checked={!!values.showOnlyOneDay} />
                                <Stack
                                  sx={{
                                    position: 'relative',
                                    pt: 1.5,
                                    pl: 0,
                                    color: darkHexColor,
                                  }}
                                >
                                  <Typography variant="subtitle2" noWrap>
                                    View single day
                                  </Typography>
                                </Stack>
                              </Box>
                            </Box>
                            <DatePicker
                              timezone={Timezones[user.timezone]}
                              label={'From Date'}
                              name={'fromDate'}
                              getTextFieldProps={getTextFieldProps}
                              helperTextColor={
                                isSaving ? IS_SAVING_HEX : darkHexColor
                              }
                              onChangeFnc={(value) => {
                                if (values.showOnlyOneDay) {
                                  setFieldValue('toDate', value);
                                  setShowTimeLogsFromTo(
                                    value.toMillis(),
                                    value.set({ hour: 24 }).toMillis()
                                  );
                                } else {
                                  setShowTimeLogsFromTo(
                                    value.toMillis(),
                                    values.toDate.set({ hour: 24 }).toMillis()
                                  );
                                }
                              }}
                              shouldDisableDate={(date) =>
                                values.showOnlyOneDay
                                  ? false
                                  : date.toMillis() > values.toDate.toMillis()
                              }
                            />
                            <DatePicker
                              timezone={Timezones[user.timezone]}
                              label={'To Date'}
                              name={'toDate'}
                              disabled={values.showOnlyOneDay}
                              getTextFieldProps={getTextFieldProps}
                              helperTextColor={
                                isSaving ? IS_SAVING_HEX : darkHexColor
                              }
                              shouldDisableDate={(date) =>
                                date.toMillis() < values.fromDate.toMillis()
                              }
                              onChangeFnc={(value) => {
                                setShowTimeLogsFromTo(
                                  values.fromDate.toMillis(),
                                  value.set({ hour: 24 })
                                );
                              }}
                            />
                          </Box>
                        </Box>
                      </>
                    );
                  }}
                </Formik>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    color: isSaving && GRAY,
                    mb: 2,
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      cursor: !isSaving && showDetails && 'pointer',
                      flex: 1,
                      backgroundColor: !showDetails
                        ? isSaving
                          ? LIGHT_SILVER
                          : LIGHT_ORANGE
                        : isSaving
                        ? SUPER_LIGHT_SILVER
                        : ULTRA_LIGHT_ORANGE,
                      border: `1px solid ${
                        isSaving ? LIGHT_SILVER : LIGHT_ORANGE
                      }`,
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                    }}
                    onClick={() =>
                      !isSaving && showDetails && setShowDetails(false)
                    }
                  >
                    <Typography variant="subtitle2" noWrap sx={{ p: 1 }}>
                      Summary
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                      cursor: !isSaving && !showDetails && 'pointer',
                      flex: 1,
                      backgroundColor: showDetails
                        ? isSaving
                          ? LIGHT_SILVER
                          : LIGHT_ORANGE
                        : isSaving
                        ? SUPER_LIGHT_SILVER
                        : ULTRA_LIGHT_ORANGE,
                      border: `1px solid ${
                        isSaving ? LIGHT_SILVER : LIGHT_ORANGE
                      }`,
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                    }}
                    onClick={() =>
                      !isSaving && !showDetails && setShowDetails(true)
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
                  key={
                    timeLogs.map((timeLog) => timeLog.id).join('-') +
                    showDetails.toString()
                  }
                  showDetails={showDetails}
                />
              </Grid>
            </Grid>
          </Container>
        </LocalizationProvider>
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
          extend: [MeExtendedOption.CATEGORIES],
        }),
      }
    );
    const responseUserJson = await responseUser.json();
    const {
      user,
      categories: userCategories,
      controlValues,
    } = responseUserJson;

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

    const endOfDay = DateTime.now()
      .setZone(Timezones[user.timezone])
      .set({ hour: 24, minute: 0, second: 0, millisecond: 0 });
    const beginningOfADaySevenDaysAgo = endOfDay.minus({ days: 8 });
    const responseTimeLogs = await fetch(
      process.env.NEXT_PUBLIC_API_URL + 'time-log/find-extended',
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          authorization: `Bearer ${jwt_token}`,
        },
        body: JSON.stringify({
          periods: [
            {
              from: beginningOfADaySevenDaysAgo.toMillis(),
              to: endOfDay.toMillis(),
            },
          ],
          alreadyKnownCategories: Object.keys(
            userCategories.map((category) => category.id)
          ),
          controlValues,
        }),
      }
    );
    const responseTimeLogsJson = await responseTimeLogs.json();
    const { timeLogs, categories: timeLogsCategories } = responseTimeLogsJson;

    const fetchedPeriods = [
      {
        from: beginningOfADaySevenDaysAgo.toMillis(),
        to: endOfDay.toMillis(),
      },
    ];

    return {
      props: {
        user: user,
        timeLogs,
        categories: [...userCategories, ...timeLogsCategories],
        controlValues,
        fetchedPeriods,
        randomSliderHexColor: getHexFromRGBObject(
          getColorShadeBasedOnSliderPickerSchema(
            getRandomRgbObjectForSliderPicker().rgb,
            'very bright'
          )
        ),
      },
    };
  } catch (e) {
    cookies.set('jwt_token');
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
};
