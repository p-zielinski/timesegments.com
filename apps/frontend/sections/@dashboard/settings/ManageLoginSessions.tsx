import { Box, Stack, TextField, Typography } from '@mui/material';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import Iconify from '../../../components/iconify';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { Timezones } from '@test1/shared';
import { Token } from '@prisma/client';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { SelectWithSearch } from '../../../components/form/SelectWithSearch';

export default function ManageLoginSessions({
  currentTokenId,
  disableHover,
  user,
  isSaving,
  setIsSaving,
  setOpenedSettingOption,
  currentSettingOption,
  setCompleted,
}) {
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [userTokensFetched, setUserTokensFetched] = useState(false);

  const { color } = currentSettingOption;
  const router = useRouter();
  const getUserTokens = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'token/all',
      method: 'GET',
    });
    if (response.statusCode === StatusCodes.OK && response.tokens) {
      setUserTokens(response.tokens);
      setUserTokensFetched(true);
      setIsSaving(false);
    }
    return;
  };

  useEffect(() => {
    if (!userTokensFetched) {
      getUserTokens();
    }
  }, [userTokensFetched]);

  const getLoginSessionOptions = (tokens: Token[]) => {
    return tokens.map((token) => {
      const createdAtString = DateTime.fromISO(token.createdAt, {
        zone: Timezones[user.timezone],
      }).toLocaleString({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: 'numeric',
      });
      return {
        value: token.id,
        label:
          token.id === currentTokenId
            ? `Current session, created ${createdAtString}`
            : `${token.userAgent}, created ${createdAtString}`,
      };
    });
  };

  let StyledTextField, darkHexColor;
  const setStyledTextField = (hexColor) => {
    darkHexColor = isSaving
      ? 'rgb(144, 156, 168)'
      : getHexFromRGBObject(
          getColorShadeBasedOnSliderPickerSchema(
            getRgbaObjectFromHexString(hexColor)
          )
        );
    StyledTextField = styled(TextField)({
      '& input': {
        color: darkHexColor,
      },
      '& label.Mui-focused': {
        color: darkHexColor,
      },
      '& label': {
        color: darkHexColor,
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: hexColor,
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: hexColor,
        },
        '&:hover fieldset': {
          borderColor: hexColor,
        },
        '&.Mui-focused fieldset': {
          borderColor: hexColor,
        },
      },
    });
  };
  setStyledTextField(isSaving ? IS_SAVING_HEX : color.hex);

  const revokeSession = async (
    tokenId: string,
    resetForm: () => void,
    setFieldError: (field: string, message: string) => void
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'token/revoke',
      body: { tokenId },
      method: 'POST',
    });
    if (tokenId === currentTokenId) {
      Cookies.remove('jwt_token');
      router.push('/');
      return;
    }
    setUserTokens(userTokens.filter((userToken) => userToken.id !== tokenId));
    if (response.statusCode === StatusCodes.CREATED) {
      setCompleted(true);
    } else {
      await getUserTokens();
      setFieldError('loginSession', response.error || 'Unknown error');
    }
    setIsSaving(false);
    return;
  };

  const validationSchema = yup.object().shape({
    loginSession: yup.string().required(),
  });

  return (
    <Box>
      <Formik
        initialValues={{
          loginSession: '',
        }}
        onSubmit={async (
          values,
          { setSubmitting, resetForm, setFieldError }
        ) => {
          await revokeSession(values.loginSession, resetForm, setFieldError);
          setSubmitting(false);
        }}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, values, setFieldValue }) => {
          const isFormValid = validationSchema.isValidSync(values);

          const backgroundColor = getHexFromRGBAObject(
            getRgbaObjectFromHexString(
              isSaving
                ? IS_SAVING_HEX
                : getHexFromRGBAObject(
                    getColorShadeBasedOnSliderPickerSchema(
                      getRgbaObjectFromHexString(color?.hex),
                      'bright'
                    )
                  ),
              0.2
            )
          );

          return (
            <Box>
              <Box
                sx={{
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  cursor: 'auto',
                  background: backgroundColor,
                  border: `solid 1px ${backgroundColor}`,
                  borderBottom: '0px',
                }}
              >
                <Box sx={{ p: 1.5, pt: 0 }}>
                  <Stack
                    spacing={3}
                    sx={{ mb: 0.8 }}
                    key={`${userTokens.map((token) => token.id).join(',')}`}
                  >
                    <Box
                      sx={{
                        filter: isSaving ? 'grayscale(100%)' : 'none',
                        cursor: isSaving ? 'default' : 'pointer',
                      }}
                    >
                      {isSaving && (
                        <Box
                          sx={{
                            width: 'calc(100% + 20px)',
                            height: 'calc(100% + 20px)',
                            background: 'transparent',
                            position: 'absolute',
                            zIndex: 1,
                            transform: 'translate(-10px, -10px)',
                          }}
                        />
                      )}
                    </Box>
                    <SelectWithSearch
                      name="loginSession"
                      label="Login session"
                      options={getLoginSessionOptions(userTokens)}
                      TextField={StyledTextField}
                      helperTextColor={isSaving ? IS_SAVING_HEX : darkHexColor}
                      disabled={isSaving}
                    />
                  </Stack>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    background:
                      !isFormValid || isSaving
                        ? SUPER_LIGHT_SILVER
                        : LIGHT_GREEN,
                    borderBottomLeftRadius: 12,
                    border: `solid 1px ${
                      isSaving || !isFormValid
                        ? SUPER_LIGHT_SILVER
                        : LIGHT_GREEN
                    }`,
                    color: isSaving
                      ? IS_SAVING_HEX
                      : !isFormValid
                      ? 'rgba(0,0,0,.2)'
                      : 'black',
                    cursor: !isFormValid || isSaving ? 'default' : 'pointer',
                    flex: 1,
                    '&:hover': !disableHover &&
                      !isSaving &&
                      isFormValid && {
                        border: !isFormValid
                          ? `solid 1px ${getHexFromRGBAObject({
                              r: 0,
                              g: 0,
                              b: 0,
                              a: 0.05,
                            })}`
                          : `solid 1px ${GREEN}`,
                      },
                  }}
                  onClick={() => {
                    !isSaving && handleSubmit();
                  }}
                >
                  <Box
                    sx={{
                      p: '5px',
                    }}
                  >
                    <Iconify
                      icon={'material-symbols:delete-forever'}
                      width={40}
                      sx={{
                        position: 'relative',
                        top: '50%',
                        left: '40%',
                        transform: 'translate(-40%, -50%)',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                    }}
                  >
                    <Stack
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translate(0, -50%)',
                      }}
                    >
                      <Typography variant="subtitle2" noWrap>
                        REVOKE ACCESS
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED,
                    borderBottomRightRadius: 14,
                    pl: '5px',
                    pr: '5px',
                    border: `solid 1px ${
                      isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED
                    }`,
                    color: isSaving ? IS_SAVING_HEX : 'black',
                    cursor: isSaving ? 'default' : 'pointer',
                    '&:hover': !disableHover &&
                      !isSaving && {
                        background: LIGHT_RED,
                        border: `solid 1px ${RED}`,
                      },
                  }}
                  onClick={() => {
                    if (isSaving) {
                      return;
                    }
                    setOpenedSettingOption(undefined);
                  }}
                >
                  <Iconify
                    icon={'mdi:cancel-bold'}
                    width={40}
                    sx={{
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
        }}
      </Formik>
    </Box>
  );
}
