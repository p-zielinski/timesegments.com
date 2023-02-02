import { useState, useEffect } from 'react';
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
import loginRegisterSchema from '../../yupSchemas/loginRegister';
// components
import Iconify from '../../components/iconify';
import { useRouter } from 'next/router';
import { AuthPageState } from '@test1/shared';
import recoverSchema from '../../yupSchemas/recover';
import { InputText } from '../../components/form/Text';
import Image from 'next/image';
import mail from '../../graphics/mail.svg';
import locker from '../../graphics/locker.svg';
import { handleFetch } from '../../utils/handleFetch';
// ----------------------------------------------------------------------

export default function AuthForm({ authPageState, setAuthPageState }) {
  const [error, setError] = useState<Error | undefined>(undefined);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const onLoginOrRegister = async (
    emailAndPassword: {
      email: string;
      password: string;
    },
    endpoint: 'login' | 'register'
  ): Promise<boolean> => {
    const response = await handleFetch({
      pathOrUrl: 'user/' + endpoint,
      body: emailAndPassword,
      method: 'POST',
    });
    if (response.statusCode === 201) {
      const jwtDecoded: { exp: number } = jwt_decode(response.token);
      await Cookies.set('jwt_token', response.token, {
        expires: new Date(jwtDecoded.exp * 1000),
        path: '/',
      });
      return true;
    }
    setError(new Error(response.error));
    return;
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
              <InputText type="text" name="email" label="Email address" />
              {[AuthPageState.LOGIN, AuthPageState.REGISTER].includes(
                authPageState
              ) && (
                <InputText
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setShowPassword(!showPassword);
                          console.log('123');
                        }}
                        edge="end"
                      >
                        <Iconify
                          icon={
                            showPassword
                              ? ('eva:eye-fill' as any)
                              : ('eva:eye-off-fill' as any)
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  }
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Password"
                />
              )}
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="end"
              sx={{ my: 2, mt: 1 }}
            >
              {authPageState !== AuthPageState.RECOVER_ACCOUNT && (
                <Link
                  variant="subtitle2"
                  underline="hover"
                  sx={{ cursor: 'pointer' }}
                  onClick={() =>
                    setAuthPageState(AuthPageState.RECOVER_ACCOUNT)
                  }
                >
                  Forgot password?
                </Link>
              )}
            </Stack>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              onClick={() => handleSubmit()}
            >
              {authPageState}
            </LoadingButton>
          </>
        );
      }}
    </Formik>
  );
}
