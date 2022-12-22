import { useState,useEffect } from 'react';
// @mui
import {
  Link,
  Stack,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Formik } from 'formik';
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';
import loginRegisterSchema from "../../yupSchemas/loginRegister";
// components
import Iconify from '../../components/iconify';
import { useRouter } from 'next/router';
import { AuthPageState } from '../../enums/authPageState';
import recoverSchema from "../../yupSchemas/recover";
import { InputText } from "../../components/form/Text";
import Image from 'next/image'
import mail from "../../graphics/mail.svg";
import locker from "../../graphics/locker.svg";
// ----------------------------------------------------------------------

export default function AuthForm({ authPageState, setAuthPageState }) {
  const [error, setError] = useState<Error | undefined>(undefined);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    router.push('/dashboard');
  };

  const onLoginOrRegister = async (
    emailAndPassword: {
      email: string;
      password: string;
    },
    endpoint: 'login' | 'register'
  ): Promise<boolean> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailAndPassword),
    });
    let responseJSON;
    try {
      responseJSON = await response.json();
    } catch (e) {
      setError(new Error('Communication error with the server'));
      return false;
    }
    if (responseJSON.token) {
      const jwtDecoded: { exp: number } = jwt_decode(responseJSON.token);
      await Cookies.set('access_token', responseJSON.token, {
        expires: new Date(jwtDecoded.exp * 1000),
        path: '/',
      });
      return true;
    }
    if (responseJSON.error) {
      setError(new Error(responseJSON.error));
    }
    return false;
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={async (values, { setSubmitting }) => {
        setError(undefined);
        const emailAndPassword = {
          ...values,
          email: values.email?.toLowerCase() || '',
        };
        if (authPageState === AuthPageState.LOGIN) {
          await onLoginOrRegister(emailAndPassword, 'login');
        }
        if (authPageState === AuthPageState.REGISTER) {
          await onLoginOrRegister(emailAndPassword, 'register');
        }
        console.log();

        setSubmitting(false);
      }}
      validationSchema={
        [AuthPageState.LOGIN, AuthPageState.REGISTER].includes(authPageState)
          ? loginRegisterSchema
          : recoverSchema
      }
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
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          setErrors({});
        }, [authPageState]);
        return (
          <>
            <Stack spacing={3}>
              <InputText
                type="text"
                name="email"
                label="Email address"
              />
              {[AuthPageState.LOGIN, AuthPageState.REGISTER].includes(
                authPageState
              ) && (
                <InputText
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setShowPassword(!showPassword);
                          console.log('123')
                        }}
                        edge="end"
                      >
                        <Iconify
                          icon={
                            showPassword
                              ? 'eva:eye-fill'
                              : ('eva:eye-off-fill' as string)
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  }
                  type={showPassword?'text':'password'}
                  name="password"
                  label="Password"
                />
              )}
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="end"
              sx={{ my: 2,mt:1 }}
            >
              <Link variant="subtitle2" underline="hover" onClick={()=>null}>
                Forgot password?
              </Link>
            </Stack>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              onClick={handleClick}
            >
              Login
            </LoadingButton>
          </>
        );
      }}
    </Formik>
  );
}
