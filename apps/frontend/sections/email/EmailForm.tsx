import React, { useState } from 'react';
// @mui
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Formik } from 'formik';
// components
import Iconify from '../../components/iconify';
import { useRouter } from 'next/router';
import { EmailType, EmailWithUser } from '@test1/shared';
import { InputText } from '../../components/form/Text';
import { GREEN, LIGHT_GREEN, LIGHT_RED, RED } from '../../consts/colors';
import * as yup from 'yup';
import YupPassword from 'yup-password';
import { equalTo } from '../../utils/yupCustomMethods';
import emailRegexp from '../../regex/email';
import { handleFetch } from '../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';

YupPassword(yup); // extend yup
yup.addMethod(yup.string, 'equalTo', (ref, msg) =>
  equalTo(ref, msg, 'new password')
);
// ----------------------------------------------------------------------

export default function EmailForm({ email }: { email: EmailWithUser }) {
  const [completed, setCompleted] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordCheck, setShowNewPasswordCheck] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (completed) {
    let confirmationText = 'Success!';
    switch (email.type) {
      case EmailType.EMAIL_CONFIRMATION:
        confirmationText = 'Success, your email has been confirmed!';
        break;
      case EmailType.RESET_PASSWORD:
        confirmationText = 'Success, your password has been changed!';
        break;
      case EmailType.CHANGE_EMAIL_ADDRESS:
        confirmationText = 'Success, your email has been changed!';
        break;
    }
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2">{confirmationText}</Typography>
        <LoadingButton
          fullWidth
          size="large"
          variant="contained"
          onClick={() => router.push('/')}
        >
          Go Home
        </LoadingButton>
      </Box>
    );
  }

  const confirmEmail = async (email: EmailWithUser) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'email/confirm-email',
      body: { emailId: email.id, secretKey: email.secretKey },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setCompleted(true);
    }
    if (response.error) {
      setError(response.error);
    }
    setIsSaving(false);
    return;
  };

  const changePassword = async (
    email: EmailWithUser,
    newPassword: string,
    setFieldError: (field: string, message: string) => void
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'email/change-password',
      body: { emailId: email.id, secretKey: email.secretKey, newPassword },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      if (response.token) {
        await handleFetch({
          pathOrUrl: process.env.NEXT_PUBLIC_FRONTEND_URL + 'api/set-cookie',
          body: { name: 'jwt_token', value: response.token },
          method: 'POST',
        });
      }
      setCompleted(true);
    }
    if (response.error) {
      setFieldError('currentPassword', response.error);
    }
    setIsSaving(false);
    return;
  };

  switch (email.type) {
    case EmailType.EMAIL_CONFIRMATION:
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Looks like you want to confirm email: {email.user.email}
          </Typography>
          <LoadingButton
            disabled={isSaving}
            fullWidth
            size="large"
            variant="contained"
            sx={{
              background: GREEN,
              boxShadow: 'none',
              '&:hover': {
                background: GREEN,
                boxShadow: `0px 3px 1px -2px ${LIGHT_GREEN}, 0px 2px 2px 0px ${LIGHT_GREEN}, 0px 1px 5px 0px ${LIGHT_GREEN}`,
              },
            }}
            onClick={() => !isSaving && confirmEmail(email)}
          >
            {!isSaving ? (
              'YES'
            ) : (
              <CircularProgress size={'15px'} sx={{ color: 'silver' }} />
            )}
          </LoadingButton>
          <Button
            disabled={isSaving}
            fullWidth
            size="large"
            variant="contained"
            sx={{
              background: RED,
              boxShadow: 'none',
              '&:hover': {
                background: RED,
                boxShadow: `0px 3px 1px -2px ${LIGHT_RED}, 0px 2px 2px 0px ${LIGHT_RED}, 0px 1px 5px 0px ${LIGHT_RED}`,
              },
            }}
            onClick={() => !isSaving && router.push('/')}
          >
            NO
          </Button>
        </Box>
      );
    case EmailType.RESET_PASSWORD: {
      const validationSchema = yup.object().shape({
        newPassword: yup
          .string()
          .password()
          .minLowercase(1)
          .minUppercase(1)
          .minNumbers(1)
          .minSymbols(1)
          .min(5)
          .required()
          .label('New password'),
        newPasswordCheck: (yup as any)
          .string()
          .equalTo(yup.ref('newPassword'))
          .label('New password check'),
      });

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Looks like you want to change your password?
          </Typography>
          <Formik
            initialValues={{ newPassword: '', newPasswordCheck: '' }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setFieldError }) => {
              await changePassword(email, values.newPassword, setFieldError);
            }}
          >
            {({ handleSubmit, values }) => {
              const isFormValid = validationSchema.isValidSync(values);

              return (
                <>
                  <Stack spacing={1}>
                    <InputText
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              setShowNewPassword(!showNewPassword);
                            }}
                            edge="end"
                          >
                            <Iconify
                              icon={
                                showNewPassword
                                  ? ('eva:eye-fill' as any)
                                  : ('eva:eye-off-fill' as any)
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      }
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      label="New password"
                    />

                    <InputText
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              setShowNewPasswordCheck(!showNewPasswordCheck);
                            }}
                            edge="end"
                          >
                            <Iconify
                              icon={
                                showNewPasswordCheck
                                  ? ('eva:eye-fill' as any)
                                  : ('eva:eye-off-fill' as any)
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      }
                      type={showNewPasswordCheck ? 'text' : 'password'}
                      name={'newPasswordCheck'}
                      label={`New password check`}
                    />
                  </Stack>

                  <LoadingButton
                    disabled={!isFormValid || isSaving}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    onClick={() => !isSaving && handleSubmit()}
                  >
                    {!isSaving ? (
                      'Change password'
                    ) : (
                      <CircularProgress
                        size={'15px'}
                        sx={{ color: 'silver' }}
                      />
                    )}
                  </LoadingButton>
                </>
              );
            }}
          </Formik>
        </Box>
      );
    }

    case EmailType.CHANGE_EMAIL_ADDRESS: {
      const validationSchema = yup.object().shape({
        newEmail: yup
          .string()
          .matches(emailRegexp, 'Please enter a valid email')
          .required()
          .notOneOf(
            [yup.ref('currentEmail')],
            'New email cannot be the same as the current one'
          )
          .label('New email'),
        newEmailCheck: (yup as any)
          .string()
          .equalTo(yup.ref('newEmail'))
          .label('New email check'),
      });

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Looks like you want to change your email?
          </Typography>
          <Formik
            initialValues={{
              currentEmail: email.user.email,
              newEmail: '',
              newEmailCheck: '',
            }}
            validationSchema={validationSchema}
            onSubmit={() => undefined}
          >
            {({ handleSubmit, values }) => {
              const isFormValid = validationSchema.isValidSync(values);

              return (
                <>
                  <Stack spacing={1}>
                    <InputText type="text" name="newEmail" label="New email" />

                    <InputText
                      type="text"
                      name={'newEmailCheck'}
                      label={`New email check`}
                    />
                  </Stack>

                  <LoadingButton
                    disabled={!isFormValid}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    onClick={() => handleSubmit()}
                  >
                    Change email
                  </LoadingButton>
                </>
              );
            }}
          </Formik>
        </Box>
      );
    }
  }

  return undefined;
}
