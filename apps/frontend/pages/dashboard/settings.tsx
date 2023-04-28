import {Helmet} from 'react-helmet-async'; // @mui
import {Box, Container, Grid, Stack, Typography} from '@mui/material'; // components
import DashboardLayout from '../../layouts/dashboard';
import React, {useEffect, useState} from 'react';
import {User} from '@prisma/client';
import Cookies from 'cookies';
import {getRepeatingLinearGradient} from '../../utils/colors/getRepeatingLinearGradient';
import {getHexFromRGBAObject} from '../../utils/colors/getHexFromRGBAObject';
import {LIGHT_RED, RED} from '../../consts/colors';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import {isMobile} from 'react-device-detect';
import {handleFetch} from '../../utils/handleFetch';
import {StatusCodes} from 'http-status-codes';
import EditName from '../../sections/@dashboard/settings/EditName'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

enum SettingOption {
  SET_NAME = 'Set name',
  CHANGE_PASSWORD = 'Change password',
  CHANGE_EMAIL = 'Change email',
  CHANGE_TIMEZONE = 'Change timezone',
}

type OptionsColors = {
  SET_NAME: string;
  CHANGE_PASSWORD: string;
  CHANGE_EMAIL: string;
  CHANGE_TIMEZONE: string;
};

type Props = {
  user: User;
  optionsColors: OptionsColors;
};

export default function Index({
  user: serverSideFetchedUser,
  optionsColors,
}: Props) {
  const [user, setUser] = useState<User>(serverSideFetchedUser);
  const [openedSettingOption, setOpenedSettingOption] =
    useState<SettingOption>(undefined);

  const [disableHover, setDisableHover] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [controlValue, setControlValue] = useState(user?.controlValue);
  const [refreshIntervalId, setRefreshIntervalId] = useState(undefined);

  const fetchMe = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/me',
      method: 'GET',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.user) {
      setUser(response.user);
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
      return fetchMe();
    }
    setIsSaving(false);
    return;
  };

  useEffect(() => {
    if (user && !controlValue) {
      fetchMe();
    }
    if (user) {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
      const intervalId = setInterval(() => {
        checkControlValue();
      }, 2 * 60 * 1000);
      setRefreshIntervalId(intervalId);
    }
  }, [controlValue]);

  useEffect(() => {
    setDisableHover(isMobile);
  }, [isMobile]);

  const allSettingOptions = Object.keys(SettingOption);

  return (
    <DashboardLayout user={user} setUser={setUser} title={'Settings'}>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <Container>
        <Grid container spacing={2} columns={1}>
          <Grid item xs={1} sm={1} md={1}>
            <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
              {allSettingOptions.map((currentSettingOption) => {
                const isActive =
                  openedSettingOption === SettingOption[currentSettingOption];
                return (
                  <Box key={currentSettingOption}>
                    <Box
                      sx={{ display: 'flex', width: '100%' }}
                      onClick={() =>
                        isActive
                          ? setOpenedSettingOption(undefined)
                          : setOpenedSettingOption(
                              SettingOption[currentSettingOption]
                            )
                      }
                    >
                      <Box
                        sx={{
                          width: `60px`,
                          minWidth: '60px',
                          p: 2,
                          background: getRepeatingLinearGradient(
                            optionsColors[currentSettingOption].hex,
                            0.3
                          ),
                          border: isActive
                            ? `solid 2px ${getHexFromRGBAObject({
                                ...optionsColors[currentSettingOption].rgb,
                                a: 0.5,
                              })}`
                            : `solid 2px ${getHexFromRGBAObject({
                                ...optionsColors[currentSettingOption].rgb,
                                a: 0.3,
                              })}`,
                          borderRight: 0,
                          borderTopLeftRadius: 12,
                          borderBottomLeftRadius: 12,
                        }}
                      />
                      <Box
                        sx={{
                          background: isActive
                            ? getHexFromRGBAObject({
                                ...optionsColors[currentSettingOption].rgb,
                                a: 0.24,
                              })
                            : getHexFromRGBAObject({
                                ...optionsColors[currentSettingOption].rgb,
                                a: 0.1,
                              }),
                          flex: 1,
                          border: `solid 2px ${
                            isActive
                              ? getHexFromRGBAObject({
                                  ...optionsColors[currentSettingOption].rgb,
                                  a: 0.5,
                                })
                              : LIGHT_RED
                          }`,
                          borderLeft: 0,
                          borderRadius: '12px',
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          cursor: 'pointer',
                          '&:hover': !disableHover && {
                            border: isActive
                              ? `solid 2px ${RED}`
                              : `solid 2px ${getHexFromRGBAObject({
                                  ...optionsColors[currentSettingOption].rgb,
                                  a: 0.5,
                                })}`,
                            borderStyle: isActive ? 'solid' : 'dashed',
                            borderLeft: 0,
                          },
                        }}
                      >
                        <Stack
                          spacing={1}
                          sx={{ p: 3 }}
                          direction="row"
                          alignItems="center"
                          justifyContent="left"
                        >
                          <Typography variant="subtitle2" noWrap>
                            {SettingOption[currentSettingOption]}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>

                    {isActive && (
                      <>
                        {openedSettingOption === SettingOption.SET_NAME && (
                          <EditName
                            controlValue={controlValue}
                            setControlValue={setControlValue}
                            disableHover={disableHover}
                            user={user}
                            setUser={setUser}
                            isSaving={isSaving}
                            setIsSaving={setIsSaving}
                            color={optionsColors[currentSettingOption]}
                            setOpenedSettingOption={setOpenedSettingOption}
                          />
                        )}
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Grid>
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

  return {
    props: {
      user: user,
      optionsColors: Object.fromEntries(
        Object.entries(SettingOption).map((keyAndValue) => [
          keyAndValue[0],
          getRandomRgbObjectForSliderPicker(),
        ])
      ),
    },
  };
};
