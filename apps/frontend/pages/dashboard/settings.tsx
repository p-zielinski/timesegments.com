import {Helmet} from 'react-helmet-async'; // @mui
import {Box, Container, Grid, Stack, Typography} from '@mui/material'; // components
import DashboardLayout from '../../layouts/dashboard';
import React, {useState} from 'react';
import {User} from '@prisma/client';
import Cookies from 'cookies';
import {getRepeatingLinearGradient} from '../../utils/colors/getRepeatingLinearGradient';
import {getHexFromRGBAObject} from '../../utils/colors/getHexFromRGBAObject';
import {getRgbaObjectFromHexString} from '../../utils/colors/getRgbaObjectFromHexString';
import {LIGHT_GREEN, LIGHT_RED, SUPER_LIGHT_SILVER,} from '../../consts/colors';
import {getRandomRgbObjectForSliderPicker} from '../../utils/colors/getRandomRgbObjectForSliderPicker'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type Props = {
  user: User;
};

export default function Index({ user: serverSideFetchedUser }: Props) {
  const [user, setUser] = useState<User>(serverSideFetchedUser);
  const [openedSettingOption, setOpenedSettingOption] =
    useState<SettingOption>(undefined);

  enum SettingOption {
    CHANGE_PASSWORD = 'Change password',
    CHANGE_EMAIL = 'Change email',
  }

  const allSettingOptions = Object.keys(SettingOption);

  return (
    <DashboardLayout user={user} setUser={setUser} title={'Settings'}>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <Container>
        <Grid container spacing={2} columns={1}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
            }}
          >
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
                          getRandomRgbObjectForSliderPicker().hex,
                          0.3
                        ),
                        border: `solid 2px ${getHexFromRGBAObject({
                          ...getRgbaObjectFromHexString('#aaaaaa'),
                          a: 0.3,
                        })}`,
                        borderRight: 0,
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                        cursor: 'hover',
                      }}
                    />
                    <Box
                      sx={{
                        background: isActive ? LIGHT_GREEN : SUPER_LIGHT_SILVER,
                        flex: 1,
                        border: `solid 2px ${
                          isActive ? LIGHT_GREEN : LIGHT_RED
                        }`,
                        borderLeft: 0,
                        borderRadius: '12px',
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        '&:hover': {
                          border: isActive
                            ? `solid 2px ${LIGHT_RED}`
                            : `solid 2px ${LIGHT_GREEN}`,
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
                  {isActive && <Box>active</Box>}
                </Box>
              );
            })}
          </Box>
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
    },
  };
};
