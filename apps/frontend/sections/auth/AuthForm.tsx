import {useEffect, useState} from 'react';
// @mui
import {IconButton, InputAdornment, Link, Stack} from '@mui/material';
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
import {handleFetch} from '../../utils/handleFetch';
import {SelectWithSearch} from '../../components/form/SelectWithSearch';
import {StatusCodes} from 'http-status-codes';
import {timezoneOptions} from '../../consts/timezoneOptions';
// ----------------------------------------------------------------------

export default function AuthForm({
                                   authPageState,
                                   setAuthPageState,
                                   setUser,
                                   setCategories,
                                   setLimits,
                                 }) {
  const getTimezoneOptionsForSelectWithSearch = () => {
    const timezoneOptionsResult = [];
    for (const key of Object.keys(timezoneOptions)) {
      for (const timezone of timezoneOptions[key]) {
        timezoneOptionsResult.push({
          groupBy: key,
          label: timezone.name,
          value: timezone.value,
        });
      }
    }
    return timezoneOptionsResult;
  };
  const timezoneOptionsForSelect = getTimezoneOptionsForSelectWithSearch();

  const [error, setError] = useState<Error | undefined>(undefined);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const onLoginOrRegister = async (
    valuesAndEmailToLowerCase: {
      email: string;
      password: string;
      timezone?: string;
    },
    endpoint: 'login' | 'register'
  ): Promise<boolean> => {
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
        body: {name: 'jwt_token', value: response.token},
        method: 'POST',
      });
      setUser(response.user);
      setCategories(response.user?.categories ?? []);
      setLimits(response.limits);
      return true;
    }
    setError(new Error(response.error));
    return;
  };

  return (
    <Formik
      initialValues={{email: '', password: '', timezone: ''}}
      onSubmit={async (values, {setSubmitting}) => {
        setError(undefined);
        const valuesAndEmailToLowerCase = {
          ...values,
          email: values.email?.toLowerCase() || '',
        };
        if (authPageState === AuthPageState.LOGIN) {
          await onLoginOrRegister(valuesAndEmailToLowerCase, 'login');
        }
        if (authPageState === AuthPageState.REGISTER) {
          await onLoginOrRegister(valuesAndEmailToLowerCase, 'register');
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

        return (
          <>
            <Stack spacing={3}>
              <InputText type="text" name="email" label="Email address"/>
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

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="end"
              sx={{my: 2, mt: 1}}
            >
              {authPageState !== AuthPageState.RECOVER_ACCOUNT && (
                <Link
                  variant="subtitle2"
                  underline="hover"
                  sx={{cursor: 'pointer'}}
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
