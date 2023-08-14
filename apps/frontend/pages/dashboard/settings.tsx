import { Helmet } from 'react-helmet-async'; // @mui
import { Box, Container, Grid, Typography } from '@mui/material'; // components
import React, { useEffect, useRef, useState } from 'react';
import { User } from '@prisma/client';
import Cookies from 'cookies';
import { getRandomRgbObjectForSliderPicker } from '../../utils/colors/getRandomRgbObjectForSliderPicker';
import { isMobile } from 'react-device-detect';
import SetName from '../../sections/@dashboard/settings/SetName';
import ChangeTimezone from '../../sections/@dashboard/settings/ChangeTimezone';
import ChangePassword from '../../sections/@dashboard/settings/ChangePassword';
import { getColorShadeBasedOnSliderPickerSchema } from '../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getHexFromRGBObject } from '../../utils/colors/getHexFromRGBObject';
import ChangeEmail from '../../sections/@dashboard/settings/ChangeEmail';
import { getBackgroundColor } from '../../utils/colors/getBackgroundColor';
import { TimelineDot } from '@mui/lab';
import Iconify from '../../components/iconify';
import { SettingOption } from '../../enum/settingOption';
import {
  ControlValue,
  findKeyOfValueInObject,
  MeExtendedOption,
  Timezones,
} from '@test1/shared';
import ShowCompletedInfoSettings from '../../sections/@dashboard/settings/ShowCompletedInfo';
import ConfirmEmail from '../../sections/@dashboard/settings/ConfirmEmail';
import ManageLoginSessions from '../../sections/@dashboard/settings/ManageLoginSessions';
import { createStore, StoreContext } from '../../hooks/useStore';
import { useRouter } from 'next/router';
import { useStore } from 'zustand';
import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(() => import('../../layouts/dashboard'), {
  ssr: false,
});
// ----------------------------------------------------------------------
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
  currentTokenId: string;
  randomSliderHexColor: string;
  controlValues: Record<ControlValue, string>;
};

export default function Index({
  user: serverSideFetchedUser,
  controlValues: serverSideFetchedControlValues,
  currentTokenId,
  randomSliderHexColor,
}: Props) {
  const store = useRef(
    createStore({
      currentTokenId,
      disableHover: isMobile,
      router: useRouter(),
      user: serverSideFetchedUser,
      controlValues: serverSideFetchedControlValues,
    })
  ).current;
  const { user, controlValues, disableHover, isSaving, checkControlValues } =
    useStore(store);
  const [openedSettingOption, setOpenedSettingOption] =
    useState<SettingOption>(undefined);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkControlValues();
    }, 2 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [controlValues]);

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
            successText =
              'We sent you an email with link to confirm your email address!';
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
    <StoreContext.Provider value={store}>
      <DashboardLayout
        title={'Settings'}
        randomSliderHexColor={randomSliderHexColor}
      >
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        <Container sx={{ minHeight: 'calc(100vh - 200px)', mt: -5 }}>
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
                        setOpenedSettingOption={setOpenedSettingOption}
                        currentSettingOption={currentSettingOption}
                      />
                    );
                  }

                  if (
                    isActive &&
                    openedSettingOption === SettingOption.CONFIRM_EMAIL
                  ) {
                    return (
                      <ConfirmEmail
                        key={`${currentSettingOption}-active`}
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
                        key={`${controlValues.User}-${currentSettingOption}-active`}
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
                        key={`${user.timezone}-${controlValues.User}-${currentSettingOption}-active`}
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
                        key={`${controlValues.User}-${currentSettingOption}-active`}
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
          extend: [MeExtendedOption.CURRENT_TOKEN],
        }),
      }
    );
    const response = await responseUser.json();
    const { user, currentToken, controlValues } = response;

    if (!user) {
      return {
        redirect: {
          permanent: false,
          destination: '/',
        },
      };
    }

    const currentTokenId = currentToken?.id || null;

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
        controlValues,
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
