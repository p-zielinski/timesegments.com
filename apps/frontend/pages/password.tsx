import {Helmet} from 'react-helmet-async'; // @mui
import {styled} from '@mui/material/styles';
import {Box, Stack} from '@mui/material'; // hooks
import React from 'react';
import {UserWithCategoriesAndNotes} from '@test1/shared';
import {getRandomRgbObjectForSliderPicker} from '../utils/colors/getRandomRgbObjectForSliderPicker';
import {getColorShadeBasedOnSliderPickerSchema} from '../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getHexFromRGBObject} from '../utils/colors/getHexFromRGBObject';
import {useRouter} from 'next/router';
import LoadingButton from '@mui/lab/LoadingButton';
import {Formik} from 'formik';
import InputText from '../components/form/Text';
import Cookies from 'cookies';
import JsCookies from 'js-cookie'; // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: (theme as any).customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

type Props = {
  randomSliderColor: string;
};

export default function Index({ randomSliderColor }: Props) {
  const router = useRouter();

  return (
    <>
      <Helmet>
        <title> Password </title>
      </Helmet>

      <Box sx={{ positive: 'relative' }}>
        <Box
          sx={{
            width: '70%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Formik
            initialValues={{ login: '', password: '' }}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              setSubmitting(true);
              JsCookies.set('website_login', values.login);
              JsCookies.set('website_password', values.password);
              await router.push('/');
              setSubmitting(false);
            }}
          >
            {({
              handleSubmit,
              isSubmitting,
              values,
              errors,
              isValid,
              setFieldValue,
              touched,
              setErrors,
            }) => {
              return (
                <>
                  <Stack spacing={1}>
                    <InputText type="text" name="login" label="Login" />
                    <InputText type="text" name="password" label="Password" />
                  </Stack>
                  <LoadingButton
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    onClick={() => handleSubmit()}
                  >
                    Login
                  </LoadingButton>
                </>
              );
            }}
          </Formik>
        </Box>
      </Box>
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
