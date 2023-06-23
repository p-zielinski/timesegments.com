import {Helmet} from 'react-helmet-async'; // @mui
import {Box, Container, Grid, Typography} from '@mui/material'; // components
import DashboardLayout from '../../layouts/dashboard';
import React, {useEffect, useState} from 'react';
import {User} from '@prisma/client';
import Cookies from 'cookies';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import {isMobile} from 'react-device-detect';
import {handleFetch} from '../../utils/fetchingData/handleFetch';
import {StatusCodes} from 'http-status-codes';
import SetName from '../../sections/@dashboard/settings/SetName';
import ChangeTimezone from '../../sections/@dashboard/settings/ChangeTimezone';
import ChangePassword from '../../sections/@dashboard/settings/ChangePassword';
import {getColorShadeBasedOnSliderPickerSchema} from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../../utils/colors/getHexFromRGBObject';
import ChangeEmail from '../../sections/@dashboard/settings/ChangeEmail';
import ManageLoginSessions from '../../sections/@dashboard/settings/ManageLoginSessions';
import {getBackgroundColor} from '../../utils/colors/getBackgroundColor';
import {TimelineDot} from '@mui/lab';
import Iconify from '../../components/iconify';
import {SettingOption} from '../../enum/settingOption';
import {findKeyOfValueInObject, Timezones} from '@test1/shared';
import ShowCompletedInfoSettings from '../../sections/@dashboard/settings/ShowCompletedInfo';
import ConfirmEmail from '../../sections/@dashboard/settings/ConfirmEmail'; // ----------------------------------------------------------------------
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type OptionsColors = {
  SET_NAME: string;
  CHANGE_PASSWORD: string;
  CHANGE_EMAIL: string;
  CHANGE_TIMEZONE: string;
  MANAGE_LOGIN_SESSIONS: string;
};

type Props = {
  user: User;
  optionsColors: OptionsColors;
  currentTokenId: string;
  randomSliderHexColor: string;
};

export default function Index({
  user: serverSideFetchedUser,
  optionsColors,
  currentTokenId,
  randomSliderHexColor,
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
    if (response.statusCode === StatusCodes.OK && response?.user) {
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
      }, 3 * 60 * 1000);
      setRefreshIntervalId(intervalId);
    }
    return () => {
      clearInterval(refreshIntervalId);
    };
  }, [controlValue]);

  useEffect(() => {
    setDisableHover(isMobile);
  }, [isMobile]);

  const getAllSettingOptions = (user) => {
    return Object.keys(SettingOption)
      .filter((key) =>
        !user.emailConfirmed
          ? true
          : key !==
            findKeyOfValueInObject(SettingOption, SettingOption.CONFIRM_EMAIL)
      )
      .map((key) => {
        let icon,
          subtitle,
          successText,
          iconColor,
          color = { rgb: { r: 72, g: 191, b: 64, a: 1 }, hex: '#48bf40' };
        switch (key) {
          case findKeyOfValueInObject(
            SettingOption,
            SettingOption.CONFIRM_EMAIL
          ):
            icon = 'ph:warning-fill';
            successText = 'Email was sent!';
            subtitle = user.email;
            iconColor = 'rgb(191,64,64)';
            color = { rgb: { r: 191, g: 64, b: 64, a: 1 }, hex: '#bf4040' };
            break;
          case findKeyOfValueInObject(SettingOption, SettingOption.SET_NAME):
            icon = 'icon-park-outline:edit-name';
            subtitle = user.name;
            successText = 'Name was successfully changed';
            break;
          case findKeyOfValueInObject(
            SettingOption,
            SettingOption.CHANGE_TIMEZONE
          ):
            icon = 'mdi:timezone-outline';
            subtitle = Timezones[user.timezone];
            successText = 'Timezone was successfully changed';
            break;
          case findKeyOfValueInObject(
            SettingOption,
            SettingOption.CHANGE_PASSWORD
          ):
            icon = 'material-symbols:password';
            successText = 'Password was successfully changed';
            break;
          case findKeyOfValueInObject(
            SettingOption,
            SettingOption.CHANGE_EMAIL
          ):
            icon = 'ic:outline-email';
            subtitle = user.email;
            successText = 'We sent you an email with further instructions';
            break;
          case findKeyOfValueInObject(
            SettingOption,
            SettingOption.MANAGE_LOGIN_SESSIONS
          ):
            icon = 'tabler:lock-access';
            successText = 'Action successfully executed';
            break;
        }
        return {
          id: key,
          name: SettingOption[key],
          subtitle,
          icon,
          color,
          iconColor,
          successText,
        };
      });
  };

  const [allSettingOptions, setAllSettingOptions] = useState(
    getAllSettingOptions(user)
  );
  useEffect(() => {
    setAllSettingOptions(getAllSettingOptions(user));
  }, [user]);

  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    setCompleted(false);
  }, [openedSettingOption]);

  return (
    <DashboardLayout
      user={user}
      setUser={setUser}
      title={'Settings'}
      randomSliderHexColor={randomSliderHexColor}
    >
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <Container sx={{ minHeight: 'calc(100vh - 200px)' }}>
        <Grid container spacing={2} columns={1}>
          <Grid item xs={1} sm={1} md={1}>
            <Box
              sx={{
                gap: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {allSettingOptions.map((currentSettingOption) => {
                const isActive =
                  openedSettingOption === currentSettingOption.name;

                if (isActive && completed) {
                  return (
                    <ShowCompletedInfoSettings
                      key={`completed${currentSettingOption.id}`}
                      isSaving={isSaving}
                      setOpenedSettingOption={setOpenedSettingOption}
                      currentSettingOption={currentSettingOption}
                      disableHover={disableHover}
                    ></ShowCompletedInfoSettings>
                  );
                }

                if (
                  isActive &&
                  openedSettingOption === SettingOption.CONFIRM_EMAIL
                ) {
                  return (
                    <ConfirmEmail
                      key={`${currentSettingOption}-active`}
                      user={user}
                      disableHover={disableHover}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setOpenedSettingOption={setOpenedSettingOption}
                      currentSettingOption={currentSettingOption}
                      setCompleted={setCompleted}
                    />
                  );
                }

                if (
                  isActive &&
                  openedSettingOption === SettingOption.CHANGE_EMAIL
                ) {
                  return (
                    <ChangeEmail
                      key={`${currentSettingOption}-active`}
                      user={user}
                      disableHover={disableHover}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setOpenedSettingOption={setOpenedSettingOption}
                      currentSettingOption={currentSettingOption}
                      setCompleted={setCompleted}
                    />
                  );
                }

                if (
                  isActive &&
                  openedSettingOption === SettingOption.SET_NAME
                ) {
                  return (
                    <SetName
                      key={`${controlValue}-${currentSettingOption}-active`}
                      controlValue={controlValue}
                      setControlValue={setControlValue}
                      disableHover={disableHover}
                      user={user}
                      setUser={setUser}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setOpenedSettingOption={setOpenedSettingOption}
                      currentSettingOption={currentSettingOption}
                      setCompleted={setCompleted}
                    />
                  );
                }

                if (
                  isActive &&
                  openedSettingOption === SettingOption.CHANGE_TIMEZONE
                ) {
                  return (
                    <ChangeTimezone
                      key={`${controlValue}-${currentSettingOption}-active`}
                      controlValue={controlValue}
                      setControlValue={setControlValue}
                      disableHover={disableHover}
                      user={user}
                      setUser={setUser}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      currentSettingOption={currentSettingOption}
                      setOpenedSettingOption={setOpenedSettingOption}
                      setCompleted={setCompleted}
                    />
                  );
                }

                if (
                  isActive &&
                  openedSettingOption === SettingOption.CHANGE_PASSWORD
                ) {
                  return (
                    <ChangePassword
                      key={`${currentSettingOption}-active`}
                      disableHover={disableHover}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      setOpenedSettingOption={setOpenedSettingOption}
                      currentSettingOption={currentSettingOption}
                      setCompleted={setCompleted}
                    />
                  );
                }

                if (
                  isActive &&
                  openedSettingOption === SettingOption.MANAGE_LOGIN_SESSIONS
                ) {
                  return (
                    <ManageLoginSessions
                      currentTokenId={currentTokenId}
                      key={`${controlValue}-${currentSettingOption}-active`}
                      disableHover={disableHover}
                      user={user}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      currentSettingOption={currentSettingOption}
                      setOpenedSettingOption={setOpenedSettingOption}
                      setCompleted={setCompleted}
                    />
                  );
                }

                return (
                  <Box
                    key={`${currentSettingOption.id}_not_selected`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: getBackgroundColor(
                        0.2,
                        currentSettingOption.color.hex
                      ),
                      borderRadius: '10px',
                      border: `solid 1px ${getBackgroundColor(
                        0.2,
                        currentSettingOption.color.hex
                      )}`,
                      pl: 0,
                      m: 0,
                      pr: 1.5,
                      minHeight: '52px',
                      '&:hover': !disableHover &&
                        !isSaving && {
                          cursor: 'pointer',
                          border: `solid 1px ${getBackgroundColor(
                            1,
                            currentSettingOption.color.hex
                          )}`,
                        },
                    }}
                    onClick={() =>
                      !isSaving &&
                      setOpenedSettingOption(currentSettingOption.name)
                    }
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignContent: 'flex-start',
                        gap: '10px',
                        flex: 1,
                      }}
                    >
                      <Box sx={{ marginLeft: '10px' }}>
                        <TimelineDot
                          sx={{
                            background: currentSettingOption.color.hex,
                            mb: 0,
                          }}
                        />
                      </Box>
                      <Box sx={{ margin: '6px', marginLeft: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: isSaving ? '#637381' : undefined }}
                        >
                          {currentSettingOption.name}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', direction: 'column', mb: 0 }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', mb: 0 }}
                          >
                            {currentSettingOption.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', mr: '-12px' }}>
                      <Box
                        sx={{
                          pl: '5px',
                          pr: '5px',
                        }}
                        onClick={() => !isSaving && null}
                      >
                        <Iconify
                          icon={currentSettingOption.icon}
                          width={40}
                          sx={{
                            color: currentSettingOption.iconColor,
                            position: 'relative',
                            top: '50%',
                            left: '40%',
                            transform: 'translate(-40%, -50%)',
                          }}
                        />
                      </Box>
                    </Box>
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

  let user, currentTokenId;
  try {
    const responseUser = await fetch(
      process.env.NEXT_PUBLIC_API_URL + 'user/me-with-current-token',
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          authorization: `Bearer ${jwt_token}`,
        },
      }
    );
    const jsonResponse = await responseUser.json();
    user = jsonResponse.user;
    currentTokenId = jsonResponse.currentToken?.id;
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
      currentTokenId,
      optionsColors: Object.fromEntries(
        Object.entries(SettingOption).map((keyAndValue) => [
          keyAndValue[0],
          getRandomRgbObjectForSliderPicker(),
        ])
      ),
      randomSliderHexColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
    },
  };
};
