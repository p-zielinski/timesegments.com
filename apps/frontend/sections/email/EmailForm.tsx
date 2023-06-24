import React, {useState} from 'react';
// @mui
import {Box, Button, IconButton, InputAdornment, Link, Stack, Typography,} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {Formik} from 'formik';
// components
import Iconify from '../../components/iconify';
import {useRouter} from 'next/router';
import {EmailType, EmailWithUser} from '@test1/shared';
import {InputText} from '../../components/form/Text';
import {SelectWithSearch} from '../../components/form/SelectWithSearch';
import {timezoneOptionsForSelect} from '../@dashboard/Form/timezoneOptionsForSelect';
import {GREEN, RED} from '../../consts/colors';
// ----------------------------------------------------------------------

export default function EmailForm({ email }: { email: EmailWithUser }) {
  const [error, setError] = useState<Error | undefined>(undefined);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  switch (email.type) {
    case EmailType.EMAIL_CONTINUATION:
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Looks like you want to confirm email: {email.user.email}
          </Typography>
          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            sx={{ background: GREEN, '&:hover': GREEN }}
            onClick={() => router.push('/')}
          >
            YES
          </LoadingButton>
          <Button
            fullWidth
            size="large"
            variant="contained"
            sx={{ background: RED, '&:hover': { background: RED } }}
            onClick={() => router.push('/')}
          >
            NO
          </Button>
        </Box>
      );
  }

  // const onLoginOrRegister = async (
  //   valuesAndEmailToLowerCase: {
  //     email: string;
  //     password: string;
  //     timezone?: string;
  //   },
  //   endpoint: 'login' | 'register',
  //   setFieldError: (field: string, message: string) => void
  // ): Promise<boolean> => {
  //   const response = await handleFetch({
  //     pathOrUrl: 'user/' + endpoint,
  //     body: valuesAndEmailToLowerCase,
  //     method: 'POST',
  //   });
  //   if (response.statusCode === StatusCodes.CREATED) {
  //     if (typeof process.env.NEXT_PUBLIC_FRONTEND_URL !== 'string') {
  //       console.log({
  //         NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  //       });
  //       throw new Error('misconfiguration of NEXT_PUBLIC_API_URL');
  //     }
  //     await handleFetch({
  //       pathOrUrl: process.env.NEXT_PUBLIC_FRONTEND_URL + 'api/set-cookie',
  //       body: { name: 'jwt_token', value: response.token },
  //       method: 'POST',
  //     });
  //     return await router.push('/dashboard');
  //   }
  //   if (response.statusCode === StatusCodes.BAD_REQUEST) {
  //     const error = response.error || '';
  //     if (error.match(/password/i)) {
  //       setFieldError('password', error);
  //     }
  //     if (error.match(/email/i)) {
  //       setFieldError('email', error);
  //     }
  //   }
  //   setError(new Error(response.error));
  //   return;
  // };

  return (
    <Formik
      initialValues={{ email: '', password: '', timezone: '' }}
      // onSubmit={async (values, { setSubmitting, setFieldError }) => {
      //   setError(undefined);
      //   const valuesAndEmailToLowerCase = {
      //     ...values,
      //     email: values.email?.toLowerCase() || '',
      //   };
      //   if (authPageState === AuthPageState.LOGIN) {
      //     await onLoginOrRegister(
      //       valuesAndEmailToLowerCase,
      //       'login',
      //       setFieldError
      //     );
      //   }
      //   if (authPageState === AuthPageState.REGISTER) {
      //     await onLoginOrRegister(
      //       valuesAndEmailToLowerCase,
      //       'register',
      //       setFieldError
      //     );
      //   }
      //   setSubmitting(false);
      // }}
      // validationSchema={
      //   AuthPageState.LOGIN === authPageState
      //     ? loginSchema
      //     : AuthPageState.RECOVER_ACCOUNT === authPageState
      //     ? recoverSchema
      //     : registerSchema
      // }
      onSubmit={() => undefined}
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
              <InputText type="text" name="email" label="Email address" />

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

              <SelectWithSearch
                name="timezone"
                groupBy={(option) => option.groupBy}
                label="Timezone"
                options={timezoneOptionsForSelect}
              />
            </Stack>

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
                onClick={() => undefined}
              >
                Forgot password?
              </Link>
            </Stack>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              onClick={() => handleSubmit()}
            >
              aa
            </LoadingButton>
          </>
        );
      }}
    </Formik>
  );
}
