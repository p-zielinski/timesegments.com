import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
// components
// sections
import DashboardLayout from '../../layouts/dashboard';
import React, { useRef } from 'react';
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
import { IS_SAVING_HEX } from '../../consts/colors';
import { getRgbaObjectFromHexString } from '../../utils/colors/getRgbaObjectFromHexString';
import { getHexFromRGBAObject } from '../../utils/colors/getHexFromRGBAObject';
import { styled } from '@mui/material/styles';
import { BpCheckbox } from '../../components/form/Checkbox';
import { createStore, StoreContext } from '../../hooks/useStore';
import { useRouter } from 'next/router';
import { useStore } from 'zustand';

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

// ----------------------------------------------------------------------

//user: user,
//         timeLogs,
//         categories: [...userCategories, ...timeLogsCategories],
//         controlValues,
//         fetchedPeriods,
//         randomSliderHexColor:

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
  const store = useRef(
    createStore({
      timeLogs: serverSideFetchedTimeLogs,
      disableHover: isMobile,
      router: useRouter(),
      user: serverSideFetchedUser,
      controlValues: serverSideFetchedControlValues,
      categories: serverSideFetchedCategories,
      fetchedPeriods: fetchedPeriodsStartingValue,
    })
  ).current;
  const {
    user,
    controlValues,
    disableHover,
    isSaving,
    checkControlValues,
    timeLogs,
  } = useStore(store);

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

  return (
    <StoreContext.Provider value={store}>
      <DashboardLayout
        title={'Dashboard'}
        randomSliderHexColor={randomSliderHexColor}
      >
        <Helmet>
          <title>Settings</title>
        </Helmet>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <Container sx={{ mt: -3 }}>
            <Grid container spacing={2} columns={1} sx={{ mt: -5 }}>
              <Grid item xs={1} sm={1} md={1}>
                <Formik
                  initialValues={{
                    onlyOneDay: true,
                    fromDate: DateTime.now().set({
                      hour: 0,
                      minute: 0,
                      second: 0,
                      millisecond: 0,
                    }),
                    toDate: DateTime.now().set({
                      hour: 0,
                      minute: 0,
                      second: 0,
                      millisecond: 0,
                    }),
                  }}
                  onSubmit={async (values, { setSubmitting }) => {
                    // await createTimeLog(
                    //   values.categoryId,
                    //   values.startDateTime,
                    //   values.endDateTime
                    // );
                    setSubmitting(false);
                  }}
                  // validationSchema={getValidationSchema}
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
                              }}
                            >
                              <Box sx={{ display: 'flex' }}>
                                <BpCheckbox
                                  onClick={() => {
                                    if (!values.onlyOneDay) {
                                      setFieldValue('toDate', values.fromDate);
                                    }
                                    setFieldValue(
                                      'onlyOneDay',
                                      !values.onlyOneDay
                                    );
                                  }}
                                  checked={!!values.onlyOneDay}
                                />
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
                                if (values.onlyOneDay) {
                                  setFieldValue('toDate', value);
                                }
                              }}
                              shouldDisableDate={(date) =>
                                values.onlyOneDay
                                  ? false
                                  : date.ts > values.toDate.ts
                              }
                            />
                            <DatePicker
                              timezone={Timezones[user.timezone]}
                              label={'To Date'}
                              name={'toDate'}
                              disabled={values.onlyOneDay}
                              getTextFieldProps={getTextFieldProps}
                              helperTextColor={
                                isSaving ? IS_SAVING_HEX : darkHexColor
                              }
                              shouldDisableDate={(date) =>
                                date.ts < values.fromDate.ts
                              }
                            />
                          </Box>
                          {console.log(values)}
                        </Box>
                      </>
                    );
                  }}
                </Formik>

                {/*{JSON.stringify(dayjs.tz.guess())}*/}
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
                {/*  key={timeLogs.map((timeLog) => timeLog.id).join('-')}*/}
                {/*/>*/}
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
          from: beginningOfADaySevenDaysAgo.ts,
          to: endOfDay.ts,
          alreadyKnownCategories: Object.keys(
            userCategories.map((category) => category.id)
          ),
        }),
      }
    );
    const responseTimeLogsJson = await responseTimeLogs.json();
    const { timeLogs, categories: timeLogsCategories } = responseTimeLogsJson;

    const fetchedPeriods = [
      {
        from: beginningOfADaySevenDaysAgo.ts,
        to: endOfDay.ts,
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
