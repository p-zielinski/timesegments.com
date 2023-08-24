import {Helmet} from 'react-helmet-async'; // @mui
import {styled} from '@mui/material/styles';
import {Container, Typography} from '@mui/material'; // hooks
import {AuthForm} from '../sections/auth';
import React, {useState} from 'react';
import {AuthPageState, UserWithCategoriesAndNotes} from '@test1/shared';
import {RenderAuthLink} from '../components/renderAuthLink';
import {isMobile} from 'react-device-detect';
import Cookies from 'cookies';
import {getRandomRgbObjectForSliderPicker} from '../utils/colors/getRandomRgbObjectForSliderPicker';
import {getColorShadeBasedOnSliderPickerSchema} from '../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../utils/colors/getHexFromRGBObject';
import {getHexFromRGBAObject} from '../utils/colors/getHexFromRGBAObject';
import {useRouter} from 'next/router';
// ---------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

type Props = {
  randomSliderColor: string;
};

export default function Auth({ randomSliderColor }: Props) {
  const router = useRouter();
  const StyledContent = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: isMobile ? 'start' : 'center',
    flexDirection: 'column',
    padding: theme.spacing(isMobile ? 6 : 12, 0),
  }));

  const [currentPageState, setCurrentPageState] = useState(AuthPageState.LOGIN);

  return (
    <>
      <Helmet>
        <title>
          {currentPageState === AuthPageState.LOGIN
            ? `Log in | TimeSegments.com`
            : currentPageState === AuthPageState.REGISTER
            ? `Sign up | TimeSegments.com`
            : `Recover account | TimeSegments.com`}
        </title>
      </Helmet>

      <StyledRoot>
        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              {currentPageState === AuthPageState.LOGIN
                ? `Sign in to `
                : currentPageState === AuthPageState.REGISTER
                ? `Sign up to `
                : `Recover account`}
              {[AuthPageState.LOGIN, AuthPageState.REGISTER].includes(
                currentPageState
              ) && (
                <span
                  style={{
                    color: getHexFromRGBAObject({ r: 0, g: 0, b: 0, a: 0.7 }),
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push('/')}
                >
                  TimeSeg
                  <span
                    style={{
                      color: randomSliderColor,
                    }}
                  >
                    ment
                  </span>
                  s.com
                </span>
              )}
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
              <RenderAuthLink
                currentPageState={currentPageState}
                setCurrentPageState={setCurrentPageState}
              />
            </Typography>

            <AuthForm
              authPageState={currentPageState}
              setAuthPageState={setCurrentPageState}
            />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const cookies = new Cookies(req, res);

  const jwt_token = cookies.get('jwt_token');
  let user: UserWithCategoriesAndNotes;
  if (jwt_token) {
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
      const response = await responseUser.json();
      user = response?.user;
    } catch (e) {
      console.log(e);
      cookies.set('jwt_token');
    }
    cookies.set('jwt_token', jwt_token, {
      httpOnly: false,
      secure: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60 * 24 * 400,
    });
  }

  if (user) {
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
    };
  }

  return {
    props: {
      randomSliderColor: getHexFromRGBObject(
        getColorShadeBasedOnSliderPickerSchema(
          getRandomRgbObjectForSliderPicker().rgb,
          'very bright'
        )
      ),
    },
  };
};
