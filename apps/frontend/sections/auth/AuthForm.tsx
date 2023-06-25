import React, {useEffect, useState} from 'react';
// @mui
import {Box, CircularProgress, IconButton, InputAdornment, Link, Stack, Typography,} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {Formik} from 'formik';
import loginSchema from '../../yupSchemas/login';
// components
import Iconify from '../../components/iconify';
import {useRouter} from 'next/router';
import {AuthPageState} from '@test1/shared';
import recoverSchema from '../../yupSchemas/recover';
import registerSchema from '../../yupSchemas/register';
import {InputText} from '../../components/form/Text';
import {handleFetch} from '../../utils/fetchingData/handleFetch';
import {SelectWithSearch} from '../../components/form/SelectWithSearch';
import {StatusCodes} from 'http-status-codes';
import {timezoneOptionsForSelect} from '../@dashboard/Form/timezoneOptionsForSelect';
// ----------------------------------------------------------------------

export default function AuthForm({ authPageState, setAuthPageState }) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordEmailSent, setResetPasswordEmailSent] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const onResetPassword = async (
    email: string,
    setFieldError: (field: string, message: string) => void
  ): Promise<boolean> => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'email/send-reset-password-email',
      body: { email },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setResetPasswordEmailSent(true);
    }
    if (response.statusCode === StatusCodes.BAD_REQUEST) {
      const error = response.error;
      if (response.error && typeof response.error === 'string') {
        setFieldError('email', error);
      }
    }
    setIsSaving(false);
    return;
  };

  const onLoginOrRegister = async (
    valuesAndEmailToLowerCase: {
      email: string;
      password: string;
      timezone?: string;
    },
    endpoint: 'login' | 'register',
    setFieldError: (field: string, message: string) => void
  ): Promise<boolean> => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/' + endpoint,
      body: valuesAndEmailToLowerCase,
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      if (typeof process.env.NEXT_PUBLIC_FRONTEND_URL !== 'string') {
        console.log({
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
        });
        throw new Error('misconfiguration of NEXT_PUBLIC_API_URL');
      }
      await handleFetch({
        pathOrUrl: process.env.NEXT_PUBLIC_FRONTEND_URL + 'api/set-cookie',
        body: { name: 'jwt_token', value: response.token },
        method: 'POST',
      });
      return await router.push('/dashboard');
    }
    if (response.statusCode === StatusCodes.BAD_REQUEST) {
      const error = response.error || '';
      if (error.match(/password/i)) {
        setFieldError('password', error);
      }
      if (error.match(/email/i)) {
        setFieldError('email', error);
      }
    }
    setIsSaving(false);
    return;
  };

  useEffect(() => setResetPasswordEmailSent(false), [authPageState]);

  if (resetPasswordEmailSent) {
    return (
      <Typography variant="body1" sx={{ fontWeight: 800, mt: -1 }}>
        Success, email with further instructions has been sent!
      </Typography>
    );
  }

  return (
    <Formik
      initialValues={{ email: '', password: '', timezone: '' }}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        const valuesAndEmailToLowerCase = {
          ...values,
          email: values.email?.toLowerCase() || '',
        };
        if (authPageState === AuthPageState.LOGIN) {
          await onLoginOrRegister(
            valuesAndEmailToLowerCase,
            'login',
            setFieldError
          );
        }
        if (authPageState === AuthPageState.REGISTER) {
          await onLoginOrRegister(
            valuesAndEmailToLowerCase,
            'register',
            setFieldError
          );
        }
        if (authPageState === AuthPageState.RECOVER_ACCOUNT) {
          await onResetPassword(values.email, setFieldError);
        }
        setSubmitting(false);
      }}
      validationSchema={
        AuthPageState.LOGIN === authPageState
          ? loginSchema
          : AuthPageState.RECOVER_ACCOUNT === authPageState
          ? recoverSchema
          : registerSchema
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

        const isFormValid = (
          AuthPageState.LOGIN === authPageState
            ? loginSchema
            : AuthPageState.RECOVER_ACCOUNT === authPageState
            ? recoverSchema
            : registerSchema
        ).isValidSync(values);

        return (
          <>
            <Stack spacing={1}>
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
              {authPageState === AuthPageState.REGISTER && (
                <SelectWithSearch
                  name="timezone"
                  groupBy={(option) => option.groupBy}
                  label="Timezone"
                  options={timezoneOptionsForSelect}
                />
              )}
            </Stack>

            {authPageState !== AuthPageState.RECOVER_ACCOUNT ? (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="end"
                sx={{ my: 2, mt: 1 }}
              >
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
              </Stack>
            ) : (
              <Box sx={{ mb: 1, background: 'red' }} />
            )}
            <LoadingButton
              disabled={
                isSaving || !isFormValid || !!Object.keys(errors).length
              }
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              onClick={() => handleSubmit()}
            >
              {!isSaving ? (
                authPageState
              ) : (
                <CircularProgress size={'15px'} sx={{ color: 'silver' }} />
              )}
            </LoadingButton>
          </>
        );
      }}
    </Formik>
  );
}
